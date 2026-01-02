package com.example.grapheservice.dto;

import lombok.Data;

@Data
public class SubmissionRowDto {
    private Long submissionId;
    private String studentFullName;
    private String studentLevel;
    private Long activityId;
    private Integer score;       // 0..100 or null
    private String status;       // IN_PROGRESS / SUBMITTED
}
