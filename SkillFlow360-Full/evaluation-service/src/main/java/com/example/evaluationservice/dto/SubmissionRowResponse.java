package com.example.evaluationservice.dto;

import com.example.evaluationservice.domain.PrerequisiteLevel;
import com.example.evaluationservice.domain.SubmissionStatus;
import lombok.*;

import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubmissionRowResponse {
    private Long submissionId;
    private String studentFullName;
    private String studentLevel;
    private String evaluationTitle;
    private Long activityId;
    private PrerequisiteLevel prerequisiteLevel;
    private Integer score;
    private Instant startedAt;
    private Instant submittedAt;
    private SubmissionStatus status;
}
