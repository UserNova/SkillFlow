package com.example.skillflow360.service;

import com.example.skillflow360.entity.Competence;
import com.example.skillflow360.entity.Level;
import com.example.skillflow360.repository.CompetenceRepository;
import com.example.skillflow360.repository.LevelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LevelService {

    private final LevelRepository levelRepository;
    private final CompetenceRepository competenceRepository;

    public List<Level> getAll() {
        return levelRepository.findAll();
    }

    public List<Level> getByCompetence(Long competenceId) {
        return levelRepository.findByCompetenceId(competenceId);
    }

    public Level getById(Long id) {
        return levelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Level not found"));
    }

    public Level create(Level level) {
        if (level.getCompetence() == null || level.getCompetence().getId() == null) {
            throw new RuntimeException("Competence is required");
        }

        Competence c = competenceRepository.findById(level.getCompetence().getId())
                .orElseThrow(() -> new RuntimeException("Competence not found"));

        level.setId(null);
        level.setCompetence(c); // ✅ sets competence_id
        return levelRepository.save(level);
    }

    public Level update(Long id, Level updated) {
        Level l = getById(id);
        l.setType(updated.getType());
        l.setLabel(updated.getLabel());
        l.setDescription(updated.getDescription());

        if (updated.getCompetence() != null && updated.getCompetence().getId() != null) {
            Competence c = competenceRepository.findById(updated.getCompetence().getId())
                    .orElseThrow(() -> new RuntimeException("Competence not found"));
            l.setCompetence(c);
        }

        return levelRepository.save(l);
    }

    public void delete(Long id) {
        levelRepository.deleteById(id);
    }
}
