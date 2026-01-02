package com.example.activities_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resource_activity")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private ResourceType type;

    private String url;

    @Column(length = 2000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;
}
