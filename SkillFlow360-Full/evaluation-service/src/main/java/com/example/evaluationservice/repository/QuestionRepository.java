package com.example.evaluationservice.repository;

import com.example.evaluationservice.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByEvaluationIdOrderByPositionAsc(Long evaluationId);
    long countByEvaluationId(Long evaluationId);
    void deleteByEvaluationId(Long evaluationId);
}
