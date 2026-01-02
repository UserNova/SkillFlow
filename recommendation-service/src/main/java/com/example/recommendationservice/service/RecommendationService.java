package com.example.recommendationservice.service;

import com.example.recommendationservice.web.RecommendationItem;
import com.example.recommendationservice.web.RecommendationResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RestTemplate restTemplate;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${services.activityBaseUrl:http://localhost:8888}")
    private String activityBaseUrl;

    @Value("${services.evaluationBaseUrl:http://localhost:8888}")
    private String evaluationBaseUrl;

    public RecommendationResponse recommendForStudent(String authorization, Long studentId, int limit) {
        if (studentId == null) throw new IllegalArgumentException("studentId est requis.");
        if (limit <= 0) limit = 6;

        // ✅ 1) activités via gateway
        List<JsonNode> activities = fetchArray(activityBaseUrl + "/api/v1/activities", authorization);

        // ✅ 2) scores/submissions (si endpoint existe, sinon [])
        List<JsonNode> submissions = fetchArray(evaluationBaseUrl + "/api/v1/submissions?studentId=" + studentId, authorization);

        // moyenne score
        List<Integer> scores = submissions.stream()
                .map(s -> getIntSafe(s, "score"))
                .filter(Objects::nonNull)
                .toList();

        double avg = scores.stream().mapToInt(Integer::intValue).average().orElse(0.0);
        String targetLevel = computeTargetLevel(avg);

        // activités déjà faites (si submissions contiennent activityId)
        Set<Long> done = submissions.stream()
                .map(s -> getLongSafe(s, "activityId"))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // ✅ 3) construire recos
        List<RecommendationItem> recs = new ArrayList<>();

        for (JsonNode a : activities) {
            Long id = getLongSafe(a, "id");
            if (id == null) continue;

            if (done.contains(id)) continue;

            String title = getTextSafe(a, "title");
            if (title == null) title = "Activity " + id;

            // ✅ mapping EASY/MEDIUM/HARD -> BEGINNER/INTERMEDIATE/ADVANCED
            String rawLevel = getTextSafe(a, "level");      // EASY/MEDIUM/HARD
            String level = normalizeLevel(rawLevel);        // BEGINNER/INTERMEDIATE/ADVANCED
            if (level == null) level = targetLevel;

            double priority = 0;

            // règle principale
            if (level.equals(targetLevel)) priority += 70;
            else priority += 30;

            // bonus selon score
            if (avg < 40 && level.equals("BEGINNER")) priority += 15;
            if (avg >= 40 && avg < 70 && level.equals("INTERMEDIATE")) priority += 10;
            if (avg >= 70 && level.equals("ADVANCED")) priority += 15;

            // bonus stable
            priority += (id % 10);

            recs.add(RecommendationItem.builder()
                    .activityId(id)
                    .title(title)
                    .skillId(null)
                    .level(level)
                    .priorityScore(Math.round(priority * 100.0) / 100.0)
                    .reason("Adaptée au niveau " + targetLevel + " (avg=" + round1(avg) + ").")
                    .build());
        }

        // tri + limit
        recs.sort((x, y) -> Double.compare(y.getPriorityScore(), x.getPriorityScore()));
        if (recs.size() > limit) recs = recs.subList(0, limit);

        return RecommendationResponse.builder()
                .generatedAt(Instant.now().toString())
                .studentId(studentId)
                .strategy("rule+scoring")
                .studentAvgScore(Math.round(avg * 100.0) / 100.0)
                .targetLevel(targetLevel)
                .recommendations(recs)
                .build();
    }

    private String computeTargetLevel(double avg) {
        if (avg < 40) return "BEGINNER";
        if (avg < 70) return "INTERMEDIATE";
        return "ADVANCED";
    }

    // ✅ IMPORTANT : mapping levels
    private String normalizeLevel(String level) {
        if (level == null) return null;
        String t = level.trim().toUpperCase(Locale.ROOT);

        // déjà pédago
        if (t.startsWith("BEGIN")) return "BEGINNER";
        if (t.startsWith("INTER")) return "INTERMEDIATE";
        if (t.startsWith("ADV")) return "ADVANCED";

        // ton système activité
        if (t.equals("EASY")) return "BEGINNER";
        if (t.equals("MEDIUM")) return "INTERMEDIATE";
        if (t.equals("HARD")) return "ADVANCED";

        return null;
    }

    private String round1(double v) {
        return String.format(Locale.US, "%.1f", v);
    }

    // ---------- HTTP helpers ----------
    private List<JsonNode> fetchArray(String url, String authorization) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            if (authorization != null && !authorization.isBlank()) {
                headers.set("Authorization", authorization);
            }

            ResponseEntity<String> resp = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), String.class
            );

            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) return List.of();

            JsonNode root = mapper.readTree(resp.getBody());
            if (root == null) return List.of();

            if (root.isArray()) {
                List<JsonNode> out = new ArrayList<>();
                root.forEach(out::add);
                return out;
            }

            // {data:[...]} / {content:[...]} etc.
            if (root.isObject()) {
                for (String k : List.of("content", "data", "items", "results")) {
                    JsonNode arr = root.get(k);
                    if (arr != null && arr.isArray()) {
                        List<JsonNode> out = new ArrayList<>();
                        arr.forEach(out::add);
                        return out;
                    }
                }
            }

            return List.of();
        } catch (HttpStatusCodeException e) {
            return List.of();
        } catch (Exception e) {
            return List.of();
        }
    }

    private Long getLongSafe(JsonNode node, String field) {
        try {
            JsonNode v = node.get(field);
            if (v == null || v.isNull()) return null;
            return v.asLong();
        } catch (Exception e) {
            return null;
        }
    }

    private Integer getIntSafe(JsonNode node, String field) {
        try {
            JsonNode v = node.get(field);
            if (v == null || v.isNull()) return null;
            return v.asInt();
        } catch (Exception e) {
            return null;
        }
    }

    private String getTextSafe(JsonNode node, String field) {
        try {
            JsonNode v = node.get(field);
            if (v == null || v.isNull()) return null;
            String t = v.asText();
            return (t == null || t.isBlank()) ? null : t;
        } catch (Exception e) {
            return null;
        }
    }
}
