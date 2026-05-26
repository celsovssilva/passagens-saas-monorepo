package com.example.transport.controller;

import com.example.transport.request.RotasRequest;
import com.example.transport.response.RotasResponse;
import com.example.transport.service.RotasService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/rotas")
public class RotasController {
    @Autowired
    RotasService rotasService;

    @PostMapping("/cadastrar")
    public ResponseEntity<RotasResponse> cadastrarRota(@RequestBody @Valid RotasRequest r){
        var rota = rotasService.cadastrar(r);
        return ResponseEntity.ok(rota);
    }
    @GetMapping
    public ResponseEntity<List<RotasResponse>> listarTodas() {

        return ResponseEntity.ok(rotasService.listarTodas());
    }
}
