package com.example.skillflow360.controller;

import com.example.skillflow360.entity.SubCompetence;
import com.example.skillflow360.service.SubCompetenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subcompetences")
@RequiredArgsConstructor
public class SubCompetenceController {

    private final SubCompetenceService service;

    @GetMapping
    public List<SubCompetence> getAll() {
        return service.getAll();
    }

    @GetMapping("/competence/{id}")
    public List<SubCompetence> getByCompetence(@PathVariable Long id) {
        return service.getByCompetence(id);
    }

    @GetMapping("/{id}")
    public SubCompetence getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public ResponseEntity<SubCompetence> create(@RequestBody SubCompetence sc) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(sc));
    }

    @PutMapping("/{id}")
    public SubCompetence update(@PathVariable Long id, @RequestBody SubCompetence sc) {
        return service.update(id, sc);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
