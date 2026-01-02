package com.example.skillflow360.repository;

import com.example.skillflow360.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByCompetenceId(Long competenceId);
}
