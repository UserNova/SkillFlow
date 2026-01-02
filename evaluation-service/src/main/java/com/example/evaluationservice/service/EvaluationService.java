package com.example.evaluationservice.service;

import com.example.evaluationservice.common.BadRequestException;
import com.example.evaluationservice.common.NotFoundException;
import com.example.evaluationservice.domain.*;
import com.example.evaluationservice.dto.*;
import com.example.evaluationservice.entity.*;
import com.example.evaluationservice.repository.*;
import lombok.RequiredArgsConstructor;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepo;
    private final QuestionRepository questionRepo;
    private final StudentEvaluationRepository submissionRepo;
    private final StudentAnswerRepository answerRepo;
    private final ScoringService scoring;

    // -------------------- EVALUATIONS (PROF) --------------------

    @Transactional
    public EvaluationResponse createEvaluation(EvaluationCreateRequest req) {
        Evaluation e = Evaluation.builder()
                .title(req.getTitle().trim())
                .prerequisiteLevel(req.getPrerequisiteLevel())
                .activityId(req.getActivityId())
                .introduction(req.getIntroduction())
                .status(EvaluationStatus.DRAFT)
                .build();

        e = evaluationRepo.save(e);
        return toEvalResponse(e);
    }

    // ✅ FIX 500: no createdAt sort (avoid null / missing column)
    @Transactional(readOnly = true)
    public List<EvaluationResponse> listEvaluations() {
        return evaluationRepo.findAllByOrderByIdDesc()
                .stream()
                .map(this::toEvalResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EvaluationResponse getEvaluation(Long id) {
        Evaluation e = evaluationRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Evaluation not found: " + id));
        return toEvalResponse(e);
    }

    @Transactional
    public EvaluationResponse updateEvaluation(Long id, EvaluationUpdateRequest req) {
        Evaluation e = evaluationRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Evaluation not found: " + id));

        e.setTitle(req.getTitle().trim());
        e.setPrerequisiteLevel(req.getPrerequisiteLevel());
        e.setActivityId(req.getActivityId());
        e.setIntroduction(req.getIntroduction());

        e = evaluationRepo.save(e);
        return toEvalResponse(e);
    }

    @Transactional
    public void deleteEvaluation(Long id) {
        if (!evaluationRepo.existsById(id)) throw new NotFoundException("Evaluation not found: " + id);

        questionRepo.deleteByEvaluationId(id);

        List<StudentEvaluation> subs = submissionRepo.findByEvaluationIdOrderByStartedAtDesc(id);
        for (StudentEvaluation s : subs) {
            answerRepo.deleteBySubmissionId(s.getId());
        }
        submissionRepo.deleteAll(subs);

        evaluationRepo.deleteById(id);
    }

    @Transactional
    public EvaluationResponse publishOrUnpublish(Long id, boolean published) {
        Evaluation e = evaluationRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Evaluation not found: " + id));

        long count = questionRepo.countByEvaluationId(id);
        if (published && count == 0) throw new BadRequestException("Cannot publish evaluation with 0 questions.");

        e.setStatus(published ? EvaluationStatus.PUBLISHED : EvaluationStatus.DRAFT);
        e = evaluationRepo.save(e);
        return toEvalResponse(e);
    }

    // -------------------- QUESTIONS (PROF) --------------------

    @Transactional
    public QuestionProfessorResponse addQuestion(Long evaluationId, QuestionCreateRequest req) {
        Evaluation e = requireEvaluation(evaluationId);

        if (e.getStatus() == EvaluationStatus.PUBLISHED) {
            throw new BadRequestException("Cannot add questions to PUBLISHED evaluation. Unpublish first.");
        }

        List<String> options = (req.getOptions() == null ? List.<Object>of() : (List<?>) req.getOptions())
                .stream()
                .filter(java.util.Objects::nonNull)
                .map(Object::toString)
                .map(String::trim)
                .filter(s -> !s.isEmpty()) // ✅ instead of isBlank()
                .toList();


        if (options.size() < 2) throw new BadRequestException("Question must have at least 2 options.");

        String correct = req.getCorrectAnswer().trim();
        if (!options.contains(correct)) throw new BadRequestException("correctAnswer must match one of options.");

        int position = questionRepo.findByEvaluationIdOrderByPositionAsc(evaluationId).size() + 1;

        Question q = Question.builder()
                .evaluationId(evaluationId)
                .label(req.getLabel().trim())
                .options(options)
                .correctAnswer(correct)
                .position(position)
                .build();

        q = questionRepo.save(q);

        return QuestionProfessorResponse.builder()
                .id(q.getId())
                .label(q.getLabel())
                .options(q.getOptions())
                .correctAnswer(q.getCorrectAnswer())
                .position(q.getPosition())
                .build();
    }

    @Transactional(readOnly = true)
    public List<QuestionProfessorResponse> listQuestionsProfessor(Long evaluationId) {
        requireEvaluation(evaluationId);

        return questionRepo.findByEvaluationIdOrderByPositionAsc(evaluationId).stream()
                .map(q -> QuestionProfessorResponse.builder()
                        .id(q.getId())
                        .label(q.getLabel())
                        .options(q.getOptions())
                        .correctAnswer(q.getCorrectAnswer())
                        .position(q.getPosition())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuestionStudentResponse> listQuestionsStudent(Long evaluationId) {
        Evaluation e = requireEvaluation(evaluationId);
        if (e.getStatus() != EvaluationStatus.PUBLISHED) throw new BadRequestException("Evaluation is not published.");

        return questionRepo.findByEvaluationIdOrderByPositionAsc(evaluationId).stream()
                .map(q -> QuestionStudentResponse.builder()
                        .id(q.getId())
                        .label(q.getLabel())
                        .options(q.getOptions())
                        .position(q.getPosition())
                        .build())
                .toList();
    }

    // -------------------- STUDENT FLOW --------------------

    @Transactional(readOnly = true)
    public List<EvaluationResponse> listPublished() {
        return evaluationRepo.findByStatusOrderByIdDesc(EvaluationStatus.PUBLISHED)
                .stream()
                .map(this::toEvalResponse)
                .toList();
    }


    @Transactional
    public StartEvaluationResponse start(Long evaluationId, StartEvaluationRequest req) {
        Evaluation e = requireEvaluation(evaluationId);
        if (e.getStatus() != EvaluationStatus.PUBLISHED) throw new BadRequestException("Evaluation is not published.");

        List<Question> questions = questionRepo.findByEvaluationIdOrderByPositionAsc(evaluationId);
        if (questions.isEmpty()) throw new BadRequestException("Evaluation has 0 questions.");

        Optional<StudentEvaluation> existing = submissionRepo
                .findTopByEvaluationIdAndStudentIdAndStatusOrderByStartedAtDesc(
                        evaluationId, req.getStudentId(), SubmissionStatus.IN_PROGRESS
                );

        StudentEvaluation sub;
        if (existing.isPresent()) {
            sub = existing.get();
        } else {
            sub = StudentEvaluation.builder()
                    .evaluationId(e.getId())
                    .activityId(e.getActivityId())
                    .prerequisiteLevel(e.getPrerequisiteLevel())
                    .studentId(req.getStudentId())
                    .studentFullName(req.getStudentFullName().trim())
                    .studentLevel(req.getStudentLevel().trim())
                    .status(SubmissionStatus.IN_PROGRESS)
                    .startedAt(Instant.now())
                    .build();
            sub = submissionRepo.save(sub);
        }

        List<QuestionStudentResponse> qDto = questions.stream()
                .map(q -> QuestionStudentResponse.builder()
                        .id(q.getId())
                        .label(q.getLabel())
                        .options(q.getOptions())
                        .position(q.getPosition())
                        .build())
                .toList();

        return StartEvaluationResponse.builder()
                .submissionId(sub.getId())
                .evaluationId(e.getId())
                .title(e.getTitle())
                .introduction(e.getIntroduction())
                .startedAt(sub.getStartedAt())
                .questions(qDto)
                .build();
    }


    @Transactional
    public SubmitAnswersResponse submit(Long submissionId, SubmitAnswersRequest req) {
        StudentEvaluation sub = submissionRepo.findById(submissionId)
                .orElseThrow(() -> new NotFoundException("Submission not found: " + submissionId));

        if (!Objects.equals(sub.getStudentId(), req.getStudentId())) {
            throw new BadRequestException("studentId does not match this submission.");
        }

        if (sub.getStatus() == SubmissionStatus.SUBMITTED) {
            throw new BadRequestException("Submission already submitted.");
        }

        List<Question> questions = questionRepo.findByEvaluationIdOrderByPositionAsc(sub.getEvaluationId());
        if (questions.isEmpty()) throw new BadRequestException("Evaluation has no questions.");

        Map<Long, Question> qMap = questions.stream().collect(Collectors.toMap(Question::getId, q -> q));

        answerRepo.deleteBySubmissionId(submissionId);

        int correctCount = 0;
        int total = questions.size();

        Set<Long> answered = new HashSet<>();

        for (SubmitAnswersRequest.AnswerItem item : req.getAnswers()) {
            Question q = qMap.get(item.getQuestionId());
            if (q == null) continue;

            String chosen = item.getChosenAnswer() == null ? "" : item.getChosenAnswer().trim();
            boolean ok = chosen.equals(q.getCorrectAnswer());
            if (ok) correctCount++;

            answered.add(q.getId());

            answerRepo.save(StudentAnswer.builder()
                    .submissionId(submissionId)
                    .questionId(q.getId())
                    .chosenAnswer(chosen)
                    .correct(ok)
                    .build());
        }

        for (Question q : questions) {
            if (!answered.contains(q.getId())) {
                answerRepo.save(StudentAnswer.builder()
                        .submissionId(submissionId)
                        .questionId(q.getId())
                        .chosenAnswer("")
                        .correct(false)
                        .build());
            }
        }

        int scorePercent = scoring.percent(correctCount, total);

        sub.setScore(scorePercent);
        sub.setStatus(SubmissionStatus.SUBMITTED);
        sub.setSubmittedAt(Instant.now());
        submissionRepo.save(sub);

        return SubmitAnswersResponse.builder()
                .submissionId(sub.getId())
                .score(scorePercent)
                .submittedAt(sub.getSubmittedAt())
                .status(sub.getStatus().name())
                .build();
    }

    @Transactional(readOnly = true)
    public List<SubmissionRowResponse> listSubmissionsForEvaluation(Long evaluationId) {
        Evaluation e = requireEvaluation(evaluationId);

        return submissionRepo.findByEvaluationIdOrderByStartedAtDesc(evaluationId).stream()
                .map(s -> SubmissionRowResponse.builder()
                        .submissionId(s.getId())
                        .studentFullName(s.getStudentFullName())
                        .studentLevel(s.getStudentLevel())
                        .evaluationTitle(e.getTitle())
                        .activityId(e.getActivityId())
                        .prerequisiteLevel(e.getPrerequisiteLevel())
                        .score(s.getScore())
                        .startedAt(s.getStartedAt())
                        .submittedAt(s.getSubmittedAt())
                        .status(s.getStatus())
                        .build())
                .toList();
    }@Transactional(readOnly = true)
public List<SubmissionRowResponse> listAllSubmissions() {
    return submissionRepo.findAll().stream()
            .map(this::toRow)
            .toList();
}

@Transactional(readOnly = true)
public List<SubmissionRowResponse> listSubmissionsForStudent(Long studentId) {
    return submissionRepo.findByStudentIdOrderByStartedAtDesc(studentId).stream()
            .map(this::toRow)
            .toList();
}

private SubmissionRowResponse toRow(StudentEvaluation s) {
    String evaluationTitle = null;
    Long activityId = null;
    PrerequisiteLevel prerequisiteLevel = null;

    if (s.getEvaluationId() != null) {
        Optional<Evaluation> opt = evaluationRepo.findById(s.getEvaluationId());
        if (opt.isPresent()) {
            Evaluation e = opt.get();
            evaluationTitle = e.getTitle();
            activityId = e.getActivityId();
            prerequisiteLevel = e.getPrerequisiteLevel();
        }
    }

    return SubmissionRowResponse.builder()
            .submissionId(s.getId())
            .studentFullName(s.getStudentFullName())
            .studentLevel(s.getStudentLevel())
            .evaluationTitle(evaluationTitle)
            .activityId(activityId)
            .prerequisiteLevel(prerequisiteLevel)
            .score(s.getScore())
            .startedAt(s.getStartedAt())
            .submittedAt(s.getSubmittedAt())
            .status(s.getStatus())
            .build();
}

    @Transactional(readOnly = true)
    public SubmissionDetailResponse getSubmissionDetail(Long submissionId) {
        StudentEvaluation sub = submissionRepo.findById(submissionId)
                .orElseThrow(() -> new NotFoundException("Submission not found: " + submissionId));

        Evaluation e = requireEvaluation(sub.getEvaluationId());

        List<Question> questions = questionRepo.findByEvaluationIdOrderByPositionAsc(e.getId());
        Map<Long, Question> qMap = questions.stream().collect(Collectors.toMap(Question::getId, q -> q));

        List<StudentAnswer> answers = answerRepo.findBySubmissionIdOrderByQuestionIdAsc(submissionId);

        List<SubmissionAnswerDetail> detail = answers.stream()
                .map(a -> {
                    Question q = qMap.get(a.getQuestionId());
                    String qLabel = (q == null) ? "(question deleted)" : q.getLabel();
                    String correct = (q == null) ? null : q.getCorrectAnswer();
                    return SubmissionAnswerDetail.builder()
                            .questionId(a.getQuestionId())
                            .questionLabel(qLabel)
                            .chosenAnswer(a.getChosenAnswer())
                            .correctAnswer(correct)
                            .correct(Boolean.TRUE.equals(a.getCorrect()))
                            .build();
                })
                .toList();

        return SubmissionDetailResponse.builder()
                .submissionId(sub.getId())
                .evaluationId(e.getId())
                .evaluationTitle(e.getTitle())
                .activityId(e.getActivityId())
                .prerequisiteLevel(e.getPrerequisiteLevel())
                .studentId(sub.getStudentId())
                .studentFullName(sub.getStudentFullName())
                .studentLevel(sub.getStudentLevel())
                .score(sub.getScore())
                .startedAt(sub.getStartedAt())
                .submittedAt(sub.getSubmittedAt())
                .status(sub.getStatus())
                .answers(detail)
                .build();
    }

    // -------------------- helpers --------------------

    private Evaluation requireEvaluation(Long evaluationId) {
        return evaluationRepo.findById(evaluationId)
                .orElseThrow(() -> new NotFoundException("Evaluation not found: " + evaluationId));
    }

    private EvaluationResponse toEvalResponse(Evaluation e) {
        long qCount = questionRepo.countByEvaluationId(e.getId());
        return EvaluationResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .prerequisiteLevel(e.getPrerequisiteLevel())
                .activityId(e.getActivityId())
                .introduction(e.getIntroduction())
                .status(e.getStatus())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .questionsCount(qCount)
                .build();
    }
}
