package com.example.transport.controller;

import com.example.transport.repository.PassageiroRepository; // Ajuste o pacote se necessário
import com.example.transport.repository.EmpresaRepository;    // Ajuste o pacote se necessário
import com.example.transport.repository.ViagemRepository;     // Ajuste o pacote se necessário
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("api/dashboard")
public class DashboardController {

    @Autowired
    private PassageiroRepository passageiroRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private ViagemRepository viagemRepository;

    @GetMapping("/estatisticas")
    public ResponseEntity<Map<String, Object>> obterEstatisticas() {
        Map<String, Object> metricas = new HashMap<>();


        long totalPassageiros = passageiroRepository.count();
        long totalEmpresas = empresaRepository.count();
        metricas.put("totalPassageiros", totalPassageiros);
        metricas.put("totalEmpresas", totalEmpresas);


        return ResponseEntity.ok(metricas);
    }
}