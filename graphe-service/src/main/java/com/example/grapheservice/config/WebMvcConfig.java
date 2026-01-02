package com.example.grapheservice.config;

import com.example.grapheservice.security.AdminSecurityInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final AdminSecurityInterceptor adminSecurityInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Temporarily disable security for testing
        // registry.addInterceptor(adminSecurityInterceptor)
        //         .addPathPatterns("/api/v1/graphes/**")
        //         .excludePathPatterns("/api/v1/graphes/health");
    }
}
