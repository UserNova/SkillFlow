package com.example.grapheservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopActivityItem {
    private Long activityId;
    private String activityTitle;
    private long submissionsCount;
    private double avgScore; // average of submitted scores
}
