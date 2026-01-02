package com.example.skillflow360.service;

import com.example.skillflow360.entity.Competence;
import com.example.skillflow360.entity.Resource;
import com.example.skillflow360.repository.CompetenceRepository;
import com.example.skillflow360.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final CompetenceRepository competenceRepository;

    public List<Resource> getAll() {
        return resourceRepository.findAll();
    }

    public List<Resource> getByCompetence(Long competenceId) {
        return resourceRepository.findByCompetenceId(competenceId);
    }

    public Resource getById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    public Resource create(Resource resource) {
        if (resource.getCompetence() == null || resource.getCompetence().getId() == null) {
            throw new RuntimeException("Competence is required");
        }

        Competence c = competenceRepository.findById(resource.getCompetence().getId())
                .orElseThrow(() -> new RuntimeException("Competence not found"));

        resource.setId(null);
        resource.setCompetence(c); // ✅ sets competence_id
        return resourceRepository.save(resource);
    }

    public Resource update(Long id, Resource updated) {
        Resource r = getById(id);
        r.setTitle(updated.getTitle());
        r.setUrl(updated.getUrl());

        if (updated.getCompetence() != null && updated.getCompetence().getId() != null) {
            Competence c = competenceRepository.findById(updated.getCompetence().getId())
                    .orElseThrow(() -> new RuntimeException("Competence not found"));
            r.setCompetence(c);
        }

        return resourceRepository.save(r);
    }

    public void delete(Long id) {
        resourceRepository.deleteById(id);
    }
}
