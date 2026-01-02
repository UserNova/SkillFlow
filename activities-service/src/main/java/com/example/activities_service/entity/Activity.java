package com.example.activities_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "activity")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private ActivityType type;

    @Column(nullable=false)
    private Integer duration;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Difficulty level;

    // Référence externe (MS Competence)
    @Column(nullable = false)
    private Long competenceId;
}
