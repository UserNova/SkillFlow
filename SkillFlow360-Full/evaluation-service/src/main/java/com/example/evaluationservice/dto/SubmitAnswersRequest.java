package com.example.evaluationservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubmitAnswersRequest {

    @NotNull private Long studentId;
    @NotNull private List<AnswerItem> answers;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AnswerItem {
        @NotNull private Long questionId;
        private String chosenAnswer;
    }
}
