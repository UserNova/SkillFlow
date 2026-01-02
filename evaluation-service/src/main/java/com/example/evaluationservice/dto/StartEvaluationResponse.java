package com.example.evaluationservice.dto;

import lombok.*;

import java.time.Instant;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StartEvaluationResponse {
    private Long submissionId;
    private Long evaluationId;
    private String title;
    private String introduction;
    private Instant startedAt;
    private List<QuestionStudentResponse> questions;
}
