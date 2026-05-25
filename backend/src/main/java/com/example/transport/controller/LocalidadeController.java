package com.example.transport.controller;

import com.example.transport.response.CidadeIBGE;
import com.example.transport.response.EstadoIBGE;
import com.example.transport.service.LocalidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/localidades")
public class LocalidadeController {
    @Autowired
    LocalidadeService localidadeService;

    @GetMapping("/estados")
    public ResponseEntity<List<EstadoIBGE>> listarE(){
        List<EstadoIBGE> e = localidadeService.buscarTodosEstados();
        return ResponseEntity.ok(e);
    }

    @GetMapping("/estados/{uf}/cidades")
    public ResponseEntity<List<CidadeIBGE>> listarC(@PathVariable String uf){
        List<CidadeIBGE> c = localidadeService.buscarCidadesPorEstado(uf);
        return ResponseEntity.ok(c);
    }
}
