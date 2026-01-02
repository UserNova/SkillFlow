package com.example.activities_service.service;

import com.example.activities_service.dto.ActivityDto;
import com.example.activities_service.entity.Activity;
import com.example.activities_service.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository repo;

    private ActivityDto toDto(Activity a) {
        return ActivityDto.builder()
                .id(a.getId())
                .title(a.getTitle())
                .description(a.getDescription())
                .type(a.getType())
                .duration(a.getDuration())
                .level(a.getLevel())
                .competenceId(a.getCompetenceId())
                .build();
    }

    private void apply(Activity target, ActivityDto dto) {
        target.setTitle(dto.getTitle());
        target.setDescription(dto.getDescription());
        target.setType(dto.getType());
        target.setDuration(dto.getDuration());
        target.setLevel(dto.getLevel());
        target.setCompetenceId(dto.getCompetenceId());
    }

    public List<ActivityDto> getAll() {
        return repo.findAll().stream().map(this::toDto).toList();
    }

    public ActivityDto getById(Long id) {
        Activity a = repo.findById(id).orElseThrow(() -> new RuntimeException("Activity not found"));
        return toDto(a);
    }

    public List<ActivityDto> getByCompetence(Long competenceId) {
        return repo.findByCompetenceId(competenceId).stream().map(this::toDto).toList();
    }

    public ActivityDto create(ActivityDto dto) {
        Activity a = new Activity();
        apply(a, dto);
        return toDto(repo.save(a));
    }

    public ActivityDto update(Long id, ActivityDto dto) {
        Activity a = repo.findById(id).orElseThrow(() -> new RuntimeException("Activity not found"));
        apply(a, dto);
        return toDto(repo.save(a));
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
