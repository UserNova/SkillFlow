package com.example.evaluationservice.entity;

import com.example.evaluationservice.persistence.StringListJsonConverter;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "evaluation_questions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="evaluation_id", nullable=false)
    private Long evaluationId;

    @Column(nullable=false)
    private String label;

    @Column(name="correct_answer", nullable=false)
    private String correctAnswer;

    @Column(nullable=false)
    private Integer position;

    // ✅ stored in options_json (TEXT), JSON array ["a","b","c"]
    @Convert(converter = StringListJsonConverter.class)
    @Column(name="options_json", columnDefinition="TEXT")
    private List<String> options;
}
