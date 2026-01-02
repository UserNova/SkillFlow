package com.example.auth_service.dto;

import com.example.auth_service.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String fullName;

}
