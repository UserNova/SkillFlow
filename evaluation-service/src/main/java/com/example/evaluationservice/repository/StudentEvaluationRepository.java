package com.example.evaluationservice.repository;

import com.example.evaluationservice.domain.SubmissionStatus;
import com.example.evaluationservice.entity.StudentEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentEvaluationRepository extends JpaRepository<StudentEvaluation, Long> {

    List<StudentEvaluation> findByEvaluationIdOrderByStartedAtDesc(Long evaluationId);

    Optional<StudentEvaluation> findTopByEvaluationIdAndStudentIdAndStatusOrderByStartedAtDesc(
            Long evaluationId, Long studentId, SubmissionStatus status
    );

    List<StudentEvaluation> findByStudentIdOrderByStartedAtDesc(Long studentId);
}

