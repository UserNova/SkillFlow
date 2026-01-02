package com.example.evaluationservice.entity;

import com.example.evaluationservice.domain.PrerequisiteLevel;
import com.example.evaluationservice.domain.SubmissionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name="student_evaluations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class StudentEvaluation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="activity_id")
    private Long activityId;

    @Column(name="evaluation_id", nullable=false)
    private Long evaluationId;

    @Enumerated(EnumType.STRING)
    @Column(name="prerequisite_level")
    private PrerequisiteLevel prerequisiteLevel;

    private Integer score;

    @Column(name="started_at")
    private Instant startedAt;

    @Enumerated(EnumType.STRING)
    private SubmissionStatus status;

    @Column(name="student_full_name")
    private String studentFullName;

    @Column(name="student_id")
    private Long studentId;

    @Column(name="student_level")
    private String studentLevel;

    @Column(name="submitted_at")
    private Instant submittedAt;
}
