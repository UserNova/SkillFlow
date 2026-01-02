package com.example.evaluationservice.controller;

import com.example.evaluationservice.dto.SubmissionRowResponse;
import com.example.evaluationservice.dto.SubmitAnswersRequest;
import com.example.evaluationservice.dto.SubmitAnswersResponse;
import com.example.evaluationservice.dto.SubmissionDetailResponse;
import com.example.evaluationservice.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final EvaluationService service;


/**
 * Admin analytics endpoints (used by graphe-service).
 * - /api/v1/submissions?evaluationId=...   -> submissions for one evaluation
 * - /api/v1/submissions?studentId=...      -> submissions for one student
 * - /api/v1/submissions                    -> all submissions
 */
@GetMapping
public List<SubmissionRowResponse> list(
        @RequestParam(name = "evaluationId", required = false) Long evaluationId,
        @RequestParam(name = "studentId", required = false) Long studentId
) {
    if (evaluationId != null) {
        return service.listSubmissionsForEvaluation(evaluationId);
    }
    if (studentId != null) {
        return service.listSubmissionsForStudent(studentId);
    }
    return service.listAllSubmissions();
}

    @PostMapping("/{submissionId}/submit")
    public SubmitAnswersResponse submit(
            @PathVariable("submissionId") Long submissionId,
            @Valid @RequestBody SubmitAnswersRequest request
    ) {
        // ✅ call the method that exists in EvaluationService
        return service.submit(submissionId, request);
    }

    @GetMapping("/{submissionId}")
    public SubmissionDetailResponse detail(
            @PathVariable("submissionId") Long submissionId
    ) {
        return service.getSubmissionDetail(submissionId);
    }

}
