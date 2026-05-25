package com.example.transport.controller;

import com.example.transport.request.RotasRequest;
import com.example.transport.response.RotasResponse;
import com.example.transport.service.RotasService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
