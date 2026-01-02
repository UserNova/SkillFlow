package com.example.skillflow360.service;

import com.example.skillflow360.entity.Competence;
import com.example.skillflow360.entity.SubCompetence;
import com.example.skillflow360.repository.CompetenceRepository;
import com.example.skillflow360.repository.SubCompetenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubCompetenceService {

    private final SubCompetenceRepository subCompetenceRepository;
    private final CompetenceRepository competenceRepository;

    public List<SubCompetence> getAll() {
        return subCompetenceRepository.findAll();
    }

    public List<SubCompetence> getByCompetence(Long competenceId) {
        return subCompetenceRepository.findByCompetenceId(competenceId);
    }

    public SubCompetence getById(Long id) {
        return subCompetenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubCompetence not found"));
    }

    public SubCompetence create(SubCompetence subCompetence) {
        if (subCompetence.getCompetence() == null || subCompetence.getCompetence().getId() == null) {
            throw new RuntimeException("Competence is required");
        }

        Competence c = competenceRepository.findById(subCompetence.getCompetence().getId())
                .orElseThrow(() -> new RuntimeException("Competence not found"));

        subCompetence.setId(null);
        subCompetence.setCompetence(c); // ✅ sets competence_id
        return subCompetenceRepository.save(subCompetence);
    }

    public SubCompetence update(Long id, SubCompetence updated) {
        SubCompetence sc = getById(id);
        sc.setName(updated.getName());
        sc.setDescription(updated.getDescription());

        // optional: allow changing competence
        if (updated.getCompetence() != null && updated.getCompetence().getId() != null) {
            Competence c = competenceRepository.findById(updated.getCompetence().getId())
                    .orElseThrow(() -> new RuntimeException("Competence not found"));
            sc.setCompetence(c);
        }

        return subCompetenceRepository.save(sc);
    }

    public void delete(Long id) {
        subCompetenceRepository.deleteById(id);
    }
}
