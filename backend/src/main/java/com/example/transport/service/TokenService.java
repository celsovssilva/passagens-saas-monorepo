package com.example.transport.service;

import com.example.transport.entity.User;

public interface TokenService {
    String gerarToken(User user);
    String getSubject(String jwt);
}
