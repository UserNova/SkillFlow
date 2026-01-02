package com.example.grapheservice.service;

import com.example.grapheservice.dto.OverviewResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final RestTemplate restTemplate;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${services.evaluationBaseUrl}")
    private String evaluationBaseUrl;

    @Value("${services.activityBaseUrl}")
    private String activityBaseUrl;

    @Value("${services.authBaseUrl}")
    private String authBaseUrl;

    public OverviewResponse getOverview(String authorization) {
        try {
            // 1) Récupérer les vraies données des services
            List<JsonNode> evaluations = fetchDirectData("http://localhost:8083/api/v1/evaluations");
            List<JsonNode> submissions = fetchDirectData("http://localhost:8083/api/v1/submissions");
            List<JsonNode> activities = fetchDirectData("http://localhost:8082/api/v1/activities");

            // 2) Calculer les vraies statistiques
            int totalEvaluations = evaluations.size();
            int publishedEvaluations = (int) evaluations.stream()
                    .filter(e -> "PUBLISHED".equalsIgnoreCase(getTextSafe(e, "status")))
                    .count();

            int totalSubmissions = submissions.size();
            int submittedCount = (int) submissions.stream()
                    .filter(s -> "SUBMITTED".equalsIgnoreCase(getTextSafe(s, "status")))
                    .count();

            int inProgressCount = (int) submissions.stream()
                    .filter(s -> "IN_PROGRESS".equalsIgnoreCase(getTextSafe(s, "status")))
                    .count();

            int totalActivities = activities.size();

            // 3) Calculer les étudiants uniques
            Set<String> uniqueStudents = submissions.stream()
                    .map(s -> getTextSafe(s, "studentFullName"))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            int totalStudents = uniqueStudents.size();

            // 4) Performance par étudiant
            List<OverviewResponse.StudentPerformanceItem> studentsPerformance = new ArrayList<>();
            Map<String, List<JsonNode>> byStudent = submissions.stream()
                    .collect(Collectors.groupingBy(s -> getTextSafe(s, "studentFullName")));

            for (Map.Entry<String, List<JsonNode>> entry : byStudent.entrySet()) {
                String studentName = entry.getKey();
                List<JsonNode> studentSubmissions = entry.getValue();

                List<Integer> scores = studentSubmissions.stream()
                        .map(s -> getIntSafe(s, "score"))
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());

                double avgScore = scores.stream().mapToInt(Integer::intValue).average().orElse(0.0);
                Integer lastScore = scores.isEmpty() ? null : scores.get(scores.size() - 1);
                boolean atRisk = avgScore > 0 && avgScore < 50;

                studentsPerformance.add(
                        OverviewResponse.StudentPerformanceItem.builder()
                                .studentId(0)
                                .studentName(studentName)
                                .submissionsCount(studentSubmissions.size())
                                .avgScore(Math.round(avgScore * 100.0) / 100.0)
                                .lastScore(lastScore)
                                .atRisk(atRisk)
                                .build()
                );
            }

            // 5) Distribution des scores
            int c0_20 = 0, c21_40 = 0, c41_60 = 0, c61_80 = 0, c81_100 = 0;
            for (JsonNode s : submissions) {
                Integer score = getIntSafe(s, "score");
                if (score == null) continue;

                if (score <= 20) c0_20++;
                else if (score <= 40) c21_40++;
                else if (score <= 60) c41_60++;
                else if (score <= 80) c61_80++;
                else c81_100++;
            }

            List<OverviewResponse.ScoreDistributionItem> scoreDist = List.of(
                    OverviewResponse.ScoreDistributionItem.builder().range("0-20").count(c0_20).build(),
                    OverviewResponse.ScoreDistributionItem.builder().range("21-40").count(c21_40).build(),
                    OverviewResponse.ScoreDistributionItem.builder().range("41-60").count(c41_60).build(),
                    OverviewResponse.ScoreDistributionItem.builder().range("61-80").count(c61_80).build(),
                    OverviewResponse.ScoreDistributionItem.builder().range("81-100").count(c81_100).build()
            );

            // 6) Top activités
            Map<Long, String> activityTitleById = new HashMap<>();
            for (JsonNode a : activities) {
                Long id = getLongSafe(a, "id");
                if (id == null) continue;
                String title = getTextSafe(a, "title");
                if (title != null) activityTitleById.put(id, title);
            }

            Map<Long, List<JsonNode>> byActivity = submissions.stream()
                    .filter(s -> getLongSafe(s, "activityId") != null)
                    .collect(Collectors.groupingBy(s -> getLongSafe(s, "activityId")));

            List<OverviewResponse.TopActivityItem> topActivities = new ArrayList<>();
            for (Map.Entry<Long, List<JsonNode>> entry : byActivity.entrySet()) {
                Long activityId = entry.getKey();
                List<JsonNode> activitySubmissions = entry.getValue();

                double avgScore = activitySubmissions.stream()
                        .map(x -> getIntSafe(x, "score"))
                        .filter(Objects::nonNull)
                        .mapToInt(Integer::intValue)
                        .average()
                        .orElse(0.0);

                String title = activityTitleById.getOrDefault(activityId, "Activity " + activityId);

                topActivities.add(
                        OverviewResponse.TopActivityItem.builder()
                                .activityId(activityId)
                                .activityTitle(title)
                                .submissionsCount(activitySubmissions.size())
                                .avgScore(Math.round(avgScore * 100.0) / 100.0)
                                .build()
                );
            }

            topActivities.sort(Comparator.comparingInt(OverviewResponse.TopActivityItem::getSubmissionsCount).reversed());

            // 7) Calculer les étudiants à risque
            int atRiskCount = (int) studentsPerformance.stream().filter(OverviewResponse.StudentPerformanceItem::isAtRisk).count();

            return OverviewResponse.builder()
                    .generatedAt(Instant.now().toString())
                    .totalStudents(totalStudents)
                    .totalEvaluations(totalEvaluations)
                    .publishedEvaluations(publishedEvaluations)
                    .totalActivities(totalActivities)
                    .totalSubmissions(totalSubmissions)
                    .submittedCount(submittedCount)
                    .inProgressCount(inProgressCount)
                    .atRiskStudentsCount(atRiskCount)
                    .scoreDistribution(scoreDist)
                    .topActivities(topActivities)
                    .studentsPerformance(studentsPerformance)
                    .build();

        } catch (Exception e) {
            System.err.println("Error fetching data: " + e.getMessage());
            e.printStackTrace();
            
            // Return empty response in case of error
            return OverviewResponse.builder()
                    .generatedAt(Instant.now().toString())
                    .totalStudents(0)
                    .totalEvaluations(0)
                    .publishedEvaluations(0)
                    .totalActivities(0)
                    .totalSubmissions(0)
                    .submittedCount(0)
                    .inProgressCount(0)
                    .atRiskStudentsCount(0)
                    .scoreDistribution(List.of())
                    .topActivities(List.of())
                    .studentsPerformance(List.of())
                    .build();
        }
    }

    private List<JsonNode> fetchDirectData(String url) {
        try {
            System.out.println("Fetching data from: " + url);
            String json = doGet(url, null);
            if (json == null || json.isBlank()) {
                System.out.println("No data received from: " + url);
                return List.of();
            }

            JsonNode root = mapper.readTree(json);
            if (root == null || !root.isArray()) {
                System.out.println("Invalid JSON format from: " + url);
                return List.of();
            }

            List<JsonNode> result = new ArrayList<>();
            root.forEach(result::add);
            System.out.println("Successfully fetched " + result.size() + " items from: " + url);
            return result;

        } catch (Exception e) {
            System.err.println("Error fetching from " + url + ": " + e.getMessage());
            return List.of();
        }
    }

    // -----------------------
    // HTTP helpers with token
    // -----------------------
    private List<JsonNode> fetchArraySafe(String url, String authorization) {
        try {
            return fetchArray(url, authorization);
        } catch (Exception e) {
            System.err.println("Failed to fetch from " + url + ": " + e.getMessage());
            return List.of();
        }
    }

    private List<JsonNode> fetchArray(String url, String authorization) {
        try {
            String json = doGet(url, authorization);
            if (json == null || json.isBlank()) return List.of();

            JsonNode root = mapper.readTree(json);
            if (root == null) return List.of();

            // ✅ case 1: plain array
            JsonNode arr = root.isArray() ? root : null;

            // ✅ case 2: wrapped array (Spring Page / custom)
            if (arr == null && root.isObject()) {
                for (String key : List.of("content", "data", "items", "results")) {
                    JsonNode candidate = root.get(key);
                    if (candidate != null && candidate.isArray()) {
                        arr = candidate;
                        break;
                    }
                }
            }

            if (arr == null || !arr.isArray()) return List.of();

            List<JsonNode> out = new ArrayList<>();
            arr.forEach(out::add);
            return out;
        } catch (Exception ex) {
            return List.of();
        }
    }

    private Integer fetchIntSafe(String url, String field, String authorization) {
        try {
            String json = doGet(url, authorization);
            if (json == null || json.isBlank()) return null;

            JsonNode root = mapper.readTree(json);
            if (root == null) return null;

            JsonNode v = root.get(field);
            if (v == null || v.isNull()) return null;
            return v.asInt();
        } catch (Exception ex) {
            return null;
        }
    }

    private String doGet(String url, String authorization) {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        if (authorization != null && !authorization.isBlank()) {
            headers.set("Authorization", authorization);
        }

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> resp = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
        );

        return resp.getBody();
    }

    // -----------------------
    // JSON helpers
    // -----------------------
    private Integer getIntSafe(JsonNode n, String field) {
        try {
            JsonNode v = n.get(field);
            if (v == null || v.isNull()) return null;
            return v.asInt();
        } catch (Exception e) {
            return null;
        }
    }

    private Long getLongSafe(JsonNode n, String field) {
        try {
            JsonNode v = n.get(field);
            if (v == null || v.isNull()) return null;
            return v.asLong();
        } catch (Exception e) {
            return null;
        }
    }

    private String getTextSafe(JsonNode n, String field) {
        try {
            JsonNode v = n.get(field);
            if (v == null || v.isNull()) return null;
            String t = v.asText();
            return (t == null || t.isBlank()) ? null : t;
        } catch (Exception e) {
            return null;
        }
    }

    public String testConnection(String url) {
        try {
            return doGet(url, null);
        } catch (Exception e) {
            return null;
        }
    }
}
