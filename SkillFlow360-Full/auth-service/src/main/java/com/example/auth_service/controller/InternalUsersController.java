package com.example.auth_service.controller;

import com.example.auth_service.entity.Role;
import com.example.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Internal endpoints for other microservices (e.g., graphe-service).
 * In a production setup, protect this with mTLS / service-to-service auth.
 */
@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUsersController {

    private final UserRepository userRepository;

    @GetMapping("/students/count")
    public Map<String, Integer> countStudents() {
        int count = (int) userRepository.countByRole(Role.STUDENT);
        return Map.of("count", count);
    }
}
