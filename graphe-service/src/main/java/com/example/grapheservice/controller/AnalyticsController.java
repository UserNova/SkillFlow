package com.example.grapheservice.controller;

import com.example.grapheservice.dto.OverviewResponse;
import com.example.grapheservice.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/graphes")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Value("${services.evaluationBaseUrl}")
    private String evaluationBaseUrl;

    @Value("${services.activityBaseUrl}")
    private String activityBaseUrl;

    @GetMapping("/dashboard")
    public OverviewResponse dashboard() {
        return analyticsService.getOverview(null);
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "graphe-service");
        status.put("timestamp", Instant.now().toString());
        return status;
    }

    @GetMapping("/test-connections")
    public Map<String, Object> testConnections() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Test evaluation service
            String evalData = analyticsService.testConnection(evaluationBaseUrl + "/api/v1/evaluations");
            result.put("evaluations", evalData != null ? "OK" : "FAILED");
            
            // Test submissions
            String subData = analyticsService.testConnection(evaluationBaseUrl + "/api/v1/submissions");
            result.put("submissions", subData != null ? "OK" : "FAILED");
            
            // Test activities
            String actData = analyticsService.testConnection(activityBaseUrl + "/api/v1/activities");
            result.put("activities", actData != null ? "OK" : "FAILED");
            
            result.put("status", "SUCCESS");
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("error", e.getMessage());
        }
        
        return result;
    }
}
