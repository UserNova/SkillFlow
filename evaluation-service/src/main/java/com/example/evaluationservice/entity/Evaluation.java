package com.example.evaluationservice.entity;

import com.example.evaluationservice.domain.EvaluationStatus;
import com.example.evaluationservice.domain.PrerequisiteLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "evaluations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name="prerequisite_level", nullable=false)
    private PrerequisiteLevel prerequisiteLevel;

    @Column(name="activity_id", nullable=false)
    private Long activityId;

    @Column(columnDefinition = "TEXT")
    private String introduction;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private EvaluationStatus status;

    @CreationTimestamp
    @Column(name="created_at", updatable=false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name="updated_at")
    private Instant updatedAt;
}
