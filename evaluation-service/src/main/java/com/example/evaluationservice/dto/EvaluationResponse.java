package com.example.evaluationservice.dto;

import com.example.evaluationservice.domain.EvaluationStatus;
import com.example.evaluationservice.domain.PrerequisiteLevel;
import lombok.*;

import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EvaluationResponse {
    private Long id;
    private String title;
    private PrerequisiteLevel prerequisiteLevel;
    private Long activityId;
    private String introduction;
    private EvaluationStatus status;
    private Instant createdAt;
    private Instant updatedAt;
    private long questionsCount;
}
