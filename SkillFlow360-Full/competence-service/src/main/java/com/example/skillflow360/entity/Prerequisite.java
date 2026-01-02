package com.example.skillflow360.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prerequisite")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prerequisite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "source_id", nullable = false)
    private Competence source;

    @ManyToOne
    @JoinColumn(name = "target_id", nullable = false)
    private Competence target;

    @Enumerated(EnumType.STRING)
    private PrerequisiteType type;
}
