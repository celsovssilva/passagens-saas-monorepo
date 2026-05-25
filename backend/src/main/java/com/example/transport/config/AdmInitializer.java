package com.example.transport.config;

import com.example.transport.entity.Role;
import com.example.transport.entity.User;
import com.example.transport.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdmInitializer {
    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder){
        return args -> {
            String adminEmail = "admin@admin.com";
            if(userRepository.findByEmail(adminEmail).isEmpty()){
                User u = new User();
                u.setEmail(adminEmail);
                String hash = passwordEncoder.encode("admin");
                u.setPassword(hash);
                u.setRole(Role.ADMIN);
                userRepository.save(u);
                System.out.println(">>>> ADMIN PADRÃO CRIADO <<<<");
            }
        };
    }
}
