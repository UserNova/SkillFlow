package com.example.evaluationservice.dto;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionProfessorResponse {
    private Long id;
    private String label;
    private List<String> options;
    private String correctAnswer;
    private Integer position;
}
