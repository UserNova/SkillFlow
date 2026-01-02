package com.example.grapheservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ScoreDistributionItem {
    private String range; // "0-20", "21-40", ...
    private long count;
}
