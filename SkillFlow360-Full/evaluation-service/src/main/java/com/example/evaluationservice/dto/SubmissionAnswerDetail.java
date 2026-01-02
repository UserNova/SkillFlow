package com.example.evaluationservice.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubmissionAnswerDetail {
    private Long questionId;
    private String questionLabel;
    private String chosenAnswer;
    private String correctAnswer;
    private boolean correct;
}
