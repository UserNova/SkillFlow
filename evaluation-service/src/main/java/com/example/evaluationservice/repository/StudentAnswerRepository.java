package com.example.evaluationservice.repository;

import com.example.evaluationservice.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    List<StudentAnswer> findBySubmissionIdOrderByQuestionIdAsc(Long submissionId);
    void deleteBySubmissionId(Long submissionId);
}
