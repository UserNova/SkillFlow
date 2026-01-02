package com.example.activities_service.dto;

import com.example.activities_service.entity.ResourceType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceDto {
    private Long id;
    private String title;
    private ResourceType type;
    private String url;
    private String description;
    private Long activityId;
}
