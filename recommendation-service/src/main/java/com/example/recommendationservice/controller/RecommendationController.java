package com.example.recommendationservice.controller;

import com.example.recommendationservice.service.RecommendationService;
import com.example.recommendationservice.web.RecommendationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/student/{studentId}")
    public RecommendationResponse recommendStudent(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "6") int limit
    ) {
        return recommendationService.recommendForStudent(authorization, studentId, limit);
    }
}
