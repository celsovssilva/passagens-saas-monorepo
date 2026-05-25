package com.example.transport.controller;

import com.example.transport.entity.Empresa;
import com.example.transport.request.EmpresaRequest;
import com.example.transport.response.EmpresaResponse;
import com.example.transport.response.TransportResponse;
import com.example.transport.service.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/empresa")
public class EmpresaController {
    @Autowired
    EmpresaService empresaService;

    @PostMapping("/cadastrar")
    public ResponseEntity<EmpresaResponse> cadastrar(@RequestBody EmpresaRequest e ){
        Empresa empresa = empresaService.cadastroEmpresa(e);
        EmpresaResponse er = new EmpresaResponse(empresa);
        return ResponseEntity.ok(er);


    }

    @GetMapping("/buscar/{idEmpresa}")
    public ResponseEntity<EmpresaResponse> buscar(@PathVariable Long idEmpresa){
        Empresa empresa = empresaService.buscarEmpresa(idEmpresa);
        EmpresaResponse er = new EmpresaResponse(empresa);
        return  ResponseEntity.ok(er);
    }

    @PutMapping("/atualizar/{id}")
    public ResponseEntity<EmpresaResponse> atualizar(@PathVariable Long id, @RequestBody EmpresaRequest e){
       Empresa empresa = empresaService.atualizarEmpresa(id, e);
       EmpresaResponse er = new EmpresaResponse(empresa);
       return ResponseEntity.ok(er);

    }

    @GetMapping("buscar-transporte/{idEmpresa}")
    public ResponseEntity<List<TransportResponse>> buscarTp(@PathVariable Long idEmpresa){
        List<TransportResponse> t =  empresaService.buscarTransporteporEmpresa(idEmpresa);

        return ResponseEntity.ok(t);

    }
}
