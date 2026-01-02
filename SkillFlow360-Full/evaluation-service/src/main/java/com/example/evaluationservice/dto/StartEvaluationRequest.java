package com.example.evaluationservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StartEvaluationRequest {
    @NotNull private Long studentId;
    @NotBlank private String studentFullName;
    @NotBlank private String studentLevel;
}
