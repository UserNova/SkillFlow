package com.example.evaluationservice.service;

import org.springframework.stereotype.Service;

@Service
public class ScoringService {
    public int percent(int correct, int total) {
        if (total <= 0) return 0;
        return (int) Math.round((correct * 100.0) / total);
    }
}
