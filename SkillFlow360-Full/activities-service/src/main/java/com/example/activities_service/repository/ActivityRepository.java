package com.example.activities_service.repository;

import com.example.activities_service.entity.Activity;
import com.example.activities_service.entity.ActivityType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByCompetenceId(Long competenceId);
    List<Activity> findByType(ActivityType type);
}
