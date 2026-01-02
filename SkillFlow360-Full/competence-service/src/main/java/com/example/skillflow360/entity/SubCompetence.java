package com.example.skillflow360.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sub_competence")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubCompetence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competence_id")
    private Competence competence;
}
