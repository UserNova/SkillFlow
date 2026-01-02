package com.example.evaluationservice.dto;

import com.example.evaluationservice.domain.PrerequisiteLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EvaluationCreateRequest {
    @NotBlank private String title;
    @NotNull private PrerequisiteLevel prerequisiteLevel;
    @NotNull private Long activityId;
    private String introduction;
}
