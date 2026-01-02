package com.example.activities_service.dto;

import com.example.activities_service.entity.ActivityType;
import com.example.activities_service.entity.Difficulty;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityDto {
    private Long id;
    private String title;
    private String description;
    private ActivityType type;
    private Integer duration;
    private Difficulty level;
    private Long competenceId;
}
