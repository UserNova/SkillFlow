package com.example.activities_service.controller;

import com.example.activities_service.dto.ResourceDto;
import com.example.activities_service.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService service;

    @GetMapping("/{activityId}/resources")
    public List<ResourceDto> getByActivity(@PathVariable Long activityId) {
        return service.getByActivity(activityId);
    }

    @PostMapping("/{activityId}/resources")
    public ResourceDto create(@PathVariable Long activityId, @RequestBody ResourceDto resource) {
        return service.create(activityId, resource);
    }

    // ✅ UPDATE resource
    @PutMapping("/resources/{id}")
    public ResourceDto update(@PathVariable Long id, @RequestBody ResourceDto resource) {
        return service.update(id, resource);
    }

    @DeleteMapping("/resources/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
