package com.example.grapheservice.dto;

import lombok.Data;

@Data
public class EvaluationDto {
    private Long id;
    private String title;
    private String prerequisiteLevel; // BEGINNER / INTERMEDIATE / ADVANCED
    private Long activityId;
    private String status;            // DRAFT / PUBLISHED
    private Integer questionsCount;
}
