package com.example.grapheservice.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OverviewResponse {

    private String generatedAt;

    private int totalStudents;

    private int totalEvaluations;
    private int publishedEvaluations;

    private int totalActivities;

    private int totalSubmissions;
    private int submittedCount;
    private int inProgressCount;

    private int atRiskStudentsCount;

    private List<ScoreDistributionItem> scoreDistribution;
    private List<TopActivityItem> topActivities;
    private List<StudentPerformanceItem> studentsPerformance;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ScoreDistributionItem {
        private String range;
        private int count;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TopActivityItem {
        private long activityId;
        private String activityTitle;
        private int submissionsCount;
        private double avgScore;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StudentPerformanceItem {
        private long studentId;
        private String studentName;
        private int submissionsCount;
        private double avgScore;
        private Integer lastScore;
        private boolean atRisk;
    }
}
