package com.example.skillflow360.controller;

import com.example.skillflow360.entity.Competence;
import com.example.skillflow360.entity.Prerequisite;
import com.example.skillflow360.repository.CompetenceRepository;
import com.example.skillflow360.service.PrerequisiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/prerequisites")
@RequiredArgsConstructor
public class PrerequisiteController {

    private final PrerequisiteService prerequisiteService;
    private final CompetenceRepository competenceRepository;

    @GetMapping
    public List<Prerequisite> getAll() {
        return prerequisiteService.getAll();
    }

    @GetMapping("/{id}")
    public Prerequisite getById(@PathVariable Long id) {
        return prerequisiteService.getById(id);
    }

    @PostMapping
    public Prerequisite create(@RequestBody Prerequisite prereq) {
        if (prereq.getSource() == null || prereq.getTarget() == null) {
            throw new RuntimeException("Source and Target Competence must not be null");
        }

        Competence source = competenceRepository.findById(prereq.getSource().getId())
                .orElseThrow(() -> new RuntimeException("Source competence not found"));
        Competence target = competenceRepository.findById(prereq.getTarget().getId())
                .orElseThrow(() -> new RuntimeException("Target competence not found"));

        prereq.setSource(source);
        prereq.setTarget(target);

        return prerequisiteService.create(prereq);
    }

    @PutMapping("/{id}")
    public Prerequisite update(@PathVariable Long id, @RequestBody Prerequisite updated) {
        if (updated.getSource() == null || updated.getTarget() == null) {
            throw new RuntimeException("Source and Target Competence must not be null");
        }

        Competence source = competenceRepository.findById(updated.getSource().getId())
                .orElseThrow(() -> new RuntimeException("Source competence not found"));
        Competence target = competenceRepository.findById(updated.getTarget().getId())
                .orElseThrow(() -> new RuntimeException("Target competence not found"));

        updated.setSource(source);
        updated.setTarget(target);

        return prerequisiteService.update(id, updated);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        prerequisiteService.delete(id);
    }
}
