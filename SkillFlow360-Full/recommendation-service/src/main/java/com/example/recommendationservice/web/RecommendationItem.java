package com.example.recommendationservice.web;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationItem {
    private Long activityId;
    private String title;
    private Long skillId;
    private String level;
    private double priorityScore;
    private String reason;
}
