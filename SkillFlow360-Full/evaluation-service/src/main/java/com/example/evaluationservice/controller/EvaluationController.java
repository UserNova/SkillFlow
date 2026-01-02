package com.example.evaluationservice.controller;

import com.example.evaluationservice.dto.*;
import com.example.evaluationservice.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService service;

    // =========================
    // PROF - CRUD ÉVALUATIONS
    // =========================

    @PostMapping
    public EvaluationResponse create(@Valid @RequestBody EvaluationCreateRequest req) {
        return service.createEvaluation(req);
    }

    @GetMapping
    public List<EvaluationResponse> listAll() {
        return service.listEvaluations();
    }

    @GetMapping("/{id}")
    public EvaluationResponse get(@PathVariable("id") Long id) {
        return service.getEvaluation(id);
    }

    @PutMapping("/{id}")
    public EvaluationResponse update(
            @PathVariable("id") Long id,
            @Valid @RequestBody EvaluationUpdateRequest req
    ) {
        return service.updateEvaluation(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id) {
        service.deleteEvaluation(id);
    }

    // =========================
    // PUBLISH / UNPUBLISH
    // =========================

    @PutMapping("/{id}/publish")
    public EvaluationResponse publish(
            @PathVariable("id") Long id,
            @Valid @RequestBody PublishRequest req
    ) {
        return service.publishOrUnpublish(id, Boolean.TRUE.equals(req.getPublished()));
    }

    // =========================
    // QUESTIONS - PROF
    // =========================

    @PostMapping("/{id}/questions")
    public QuestionProfessorResponse addQuestion(
            @PathVariable("id") Long id,
            @Valid @RequestBody QuestionCreateRequest req
    ) {
        return service.addQuestion(id, req);
    }

    @GetMapping("/{id}/questions/prof")
    public List<QuestionProfessorResponse> listQuestionsProf(@PathVariable("id") Long id) {
        return service.listQuestionsProfessor(id);
    }

    // =========================
    // QUESTIONS - STUDENT
    // =========================

    @GetMapping("/{id}/questions/student")
    public List<QuestionStudentResponse> listQuestionsStudent(@PathVariable("id") Long id) {
        return service.listQuestionsStudent(id);
    }

    // =========================
    // STUDENT - PUBLISHED LIST
    // =========================

    @GetMapping("/published")
    public List<EvaluationResponse> listPublished() {
        return service.listPublished();
    }

    // =========================
    // STUDENT - START
    // =========================

    @PostMapping("/{id}/start")
    public StartEvaluationResponse start(
            @PathVariable("id") Long id,
            @Valid @RequestBody StartEvaluationRequest req
    ) {
        return service.start(id, req);
    }

    // =========================
    // PROF - SUBMISSIONS LIST
    // =========================

    @GetMapping("/{id}/submissions")
    public List<SubmissionRowResponse> submissions(@PathVariable("id") Long id) {
        return service.listSubmissionsForEvaluation(id);
    }
}
