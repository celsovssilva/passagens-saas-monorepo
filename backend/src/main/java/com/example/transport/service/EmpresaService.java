package com.example.transport.service;

import com.example.transport.entity.Empresa;
import com.example.transport.request.EmpresaRequest;
import com.example.transport.response.TransportResponse;

import java.util.List;

public interface EmpresaService {
    Empresa buscarEmpresa(Long idEmpresa);
    Empresa cadastroEmpresa(EmpresaRequest empresa);
    Empresa atualizarEmpresa(Long id,EmpresaRequest empresa);
    List<TransportResponse> buscarTransporteporEmpresa(Long idEmpresa);
}
