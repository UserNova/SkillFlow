package com.example.evaluationservice.repository;

import com.example.evaluationservice.domain.EvaluationStatus;
import com.example.evaluationservice.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findAllByOrderByIdDesc();

    // ✅ FIX: use EvaluationStatus not String
    List<Evaluation> findByStatusOrderByIdDesc(EvaluationStatus status);
}
