package com.example.skillflow360.service;

import com.example.skillflow360.entity.Competence;
import com.example.skillflow360.repository.CompetenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompetenceService {

    private final CompetenceRepository competenceRepository;

    public List<Competence> getAll() {
        return competenceRepository.findAll();
    }

    public Competence getById(Long id) {
        return competenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Competence not found"));
    }

    public Competence create(Competence competence) {
        competence.setId(null);
        return competenceRepository.save(competence);
    }

    public Competence update(Long id, Competence updated) {
        Competence c = getById(id);
        c.setCode(updated.getCode());
        c.setName(updated.getName());
        c.setDescription(updated.getDescription());
        return competenceRepository.save(c);
    }

    public void delete(Long id) {
        competenceRepository.deleteById(id);
    }
}
