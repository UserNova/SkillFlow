package com.example.activities_service.controller;

import com.example.activities_service.dto.ActivityDto;
import com.example.activities_service.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService service;

    @GetMapping
    public List<ActivityDto> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ActivityDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/competence/{competenceId}")
    public List<ActivityDto> getByCompetence(@PathVariable Long competenceId) {
        return service.getByCompetence(competenceId);
    }


    @PostMapping
    public ActivityDto create(@RequestBody ActivityDto activity) {
        return service.create(activity);
    }


    @PutMapping("/{id}")
    public ActivityDto update(@PathVariable Long id, @RequestBody ActivityDto updated) {
        return service.update(id, updated);
    }


    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
