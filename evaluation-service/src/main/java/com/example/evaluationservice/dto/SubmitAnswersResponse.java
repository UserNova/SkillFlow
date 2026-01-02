package com.example.evaluationservice.dto;

import lombok.*;

import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubmitAnswersResponse {
    private Long submissionId;
    private Integer score;
    private Instant submittedAt;
    private String status;
}
