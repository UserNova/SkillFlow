package com.example.evaluationservice.dto;

import com.example.evaluationservice.domain.PrerequisiteLevel;
import com.example.evaluationservice.domain.SubmissionStatus;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubmissionDetailResponse {
    private Long submissionId;
    private Long evaluationId;
    private String evaluationTitle;
    private Long activityId;
    private PrerequisiteLevel prerequisiteLevel;

    private Long studentId;
    private String studentFullName;
    private String studentLevel;

    private Integer score;
    private Instant startedAt;
    private Instant submittedAt;

    private SubmissionStatus status;

    private List<SubmissionAnswerDetail> answers;
}
