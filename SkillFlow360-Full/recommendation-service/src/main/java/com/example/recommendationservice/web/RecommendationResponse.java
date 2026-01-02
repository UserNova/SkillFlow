package com.example.recommendationservice.web;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationResponse {
    private String generatedAt;
    private Long studentId;
    private String strategy;
    private double studentAvgScore;
    private String targetLevel;
    private List<RecommendationItem> recommendations;
}
