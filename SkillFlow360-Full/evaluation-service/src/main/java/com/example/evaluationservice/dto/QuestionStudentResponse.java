package com.example.evaluationservice.dto;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionStudentResponse {
    private Long id;
    private String label;
    private List<String> options;
    private Integer position;
}
