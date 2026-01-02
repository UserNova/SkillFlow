package com.example.grapheservice.dto;

import lombok.Data;

@Data
public class ActivityDto {
    private Long id;
    private String title; // adapte si ton activity-service utilise un autre champ (name/label)
}
