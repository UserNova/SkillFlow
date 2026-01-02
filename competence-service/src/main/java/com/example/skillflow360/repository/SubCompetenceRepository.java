package com.example.skillflow360.repository;

import com.example.skillflow360.entity.SubCompetence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubCompetenceRepository extends JpaRepository<SubCompetence, Long> {
    List<SubCompetence> findByCompetenceId(Long competenceId);
}
