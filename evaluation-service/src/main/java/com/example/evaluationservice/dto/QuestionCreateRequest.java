package com.example.evaluationservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionCreateRequest {
    @NotBlank private String label;

    @NotEmpty
    private List<String> options; // ["oui","non","aucun"]

    @NotBlank
    private String correctAnswer; // doit être exactement dans options
}
