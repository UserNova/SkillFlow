package com.example.evaluationservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_answers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class StudentAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="chosen_answer", nullable = false)
    private String chosenAnswer; // "A" / "B" / "C"

    @Column(nullable = false)
    private Boolean correct;

    @Column(name="question_id", nullable = false)
    private Long questionId;

    @Column(name="submission_id", nullable = false)
    private Long submissionId;
}
