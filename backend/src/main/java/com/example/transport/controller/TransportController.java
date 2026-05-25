package com.example.transport.controller;

import com.example.transport.entity.Transport;
import com.example.transport.request.TransportRequest;
import com.example.transport.response.TransportResponse;
import com.example.transport.service.TransportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("api/transport")
public class TransportController {
    @Autowired
    private TransportService transportService;

    @PostMapping("/cadastrar")
    public ResponseEntity<TransportResponse> cadastrar(@RequestBody TransportRequest transport){
        Transport t = transportService.cadastrar(transport);
        TransportResponse response = new TransportResponse(
                transport.modelo(),
                transport.capacidade(),
                transport.status()
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/atualizar/{id}")
    public ResponseEntity<TransportResponse> atualizar(@PathVariable Long id, @RequestBody TransportRequest transport){
        Transport t = transportService.atualizar(id, transport);
        TransportResponse response = new TransportResponse(
                transport.modelo(),
                transport.capacidade(),
                transport.status()

        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/buscar/{id}")
    public ResponseEntity<TransportResponse> buscar(@PathVariable Long id){
        Transport transport = transportService.buscarPorId(id);
        TransportResponse response = new TransportResponse(transport);
       return ResponseEntity.ok(response);
    }

    @DeleteMapping("/deletar/{id}")
    public void deletar(@PathVariable Long id){
        transportService.deletar(id);
    }
}
