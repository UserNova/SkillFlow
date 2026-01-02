package com.example.skillflow360.controller;

import com.example.skillflow360.entity.Competence;
import com.example.skillflow360.service.CompetenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/competences")
@RequiredArgsConstructor
public class CompetenceController {

    private final CompetenceService competenceService;

    @GetMapping
    public List<Competence> getAll() {
        return competenceService.getAll();
    }

    @GetMapping("/{id}")
    public Competence getById(@PathVariable Long id) {
        return competenceService.getById(id);
    }

    @PostMapping
    public ResponseEntity<Competence> create(@RequestBody Competence competence) {
        return ResponseEntity.status(HttpStatus.CREATED).body(competenceService.create(competence));
    }

    @PutMapping("/{id}")
    public Competence update(@PathVariable Long id, @RequestBody Competence competence) {
        return competenceService.update(id, competence);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        competenceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
