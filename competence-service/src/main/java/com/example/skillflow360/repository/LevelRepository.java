package com.example.skillflow360.repository;

import com.example.skillflow360.entity.Level;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LevelRepository extends JpaRepository<Level, Long> {
    List<Level> findByCompetenceId(Long competenceId);
}
