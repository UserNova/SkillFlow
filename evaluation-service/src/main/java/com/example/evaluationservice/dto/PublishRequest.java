package com.example.evaluationservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PublishRequest {
    @NotNull private Boolean published;
}
