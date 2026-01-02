package com.example.skillflow360.controller;

import com.example.skillflow360.entity.Level;
import com.example.skillflow360.service.LevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/levels")
@RequiredArgsConstructor
public class LevelController {

    private final LevelService service;

    @GetMapping
    public List<Level> getAll() {
        return service.getAll();
    }

    @GetMapping("/competence/{id}")
    public List<Level> getByCompetence(@PathVariable Long id) {
        return service.getByCompetence(id);
    }

    @GetMapping("/{id}")
    public Level getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public ResponseEntity<Level> create(@RequestBody Level level) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(level));
    }

    @PutMapping("/{id}")
    public Level update(@PathVariable Long id, @RequestBody Level level) {
        return service.update(id, level);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
