package com.example.activities_service.repository;

import com.example.activities_service.entity.ResourceActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<ResourceActivity, Long> {
    List<ResourceActivity> findByActivityId(Long activityId);
}
