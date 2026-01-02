package com.example.skillflow360.service;

import com.example.skillflow360.entity.Prerequisite;
import com.example.skillflow360.repository.PrerequisiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PrerequisiteService {

    private final PrerequisiteRepository prerequisiteRepository;

    public List<Prerequisite> getAll() {
        return prerequisiteRepository.findAll();
    }

    public Prerequisite getById(Long id) {
        return prerequisiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prerequisite not found"));
    }

    public Prerequisite create(Prerequisite prereq) {
        prereq.setId(null);
        return prerequisiteRepository.save(prereq);
    }

    public Prerequisite update(Long id, Prerequisite updated) {
        Prerequisite p = getById(id);
        p.setSource(updated.getSource());
        p.setTarget(updated.getTarget());
        p.setType(updated.getType());
        return prerequisiteRepository.save(p);
    }

    public void delete(Long id) {
        prerequisiteRepository.deleteById(id);
    }
}
