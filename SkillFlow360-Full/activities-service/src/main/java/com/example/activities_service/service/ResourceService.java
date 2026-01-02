package com.example.activities_service.service;

import com.example.activities_service.dto.ResourceDto;
import com.example.activities_service.entity.Activity;
import com.example.activities_service.entity.ResourceActivity;
import com.example.activities_service.repository.ActivityRepository;
import com.example.activities_service.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository repo;
    private final ActivityRepository activityRepo;

    private ResourceDto toDto(ResourceActivity r) {
        return ResourceDto.builder()
                .id(r.getId())
                .title(r.getTitle())
                .type(r.getType())
                .url(r.getUrl())
                .description(r.getDescription())
                .activityId(r.getActivity().getId())
                .build();
    }

    public List<ResourceDto> getByActivity(Long activityId) {
        return repo.findByActivityId(activityId).stream()
                .map(this::toDto)
                .toList();
    }

    public ResourceDto create(Long activityId, ResourceDto dto) {
        Activity activity = activityRepo.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        ResourceActivity r = ResourceActivity.builder()
                .title(dto.getTitle())
                .type(dto.getType())
                .url(dto.getUrl())
                .description(dto.getDescription())
                .activity(activity)
                .build();

        return toDto(repo.save(r));
    }

    // ✅ UPDATE resource
    public ResourceDto update(Long id, ResourceDto dto) {
        ResourceActivity r = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        // ✅ update champs
        if (dto.getTitle() != null) r.setTitle(dto.getTitle());
        if (dto.getType() != null) r.setType(dto.getType());
        r.setUrl(dto.getUrl());
        r.setDescription(dto.getDescription());

        // ⚠️ on ne change PAS activity ici (car ton endpoint update n'a pas activityId)
        return toDto(repo.save(r));
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
