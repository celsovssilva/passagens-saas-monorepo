package com.example.transport.service;

import com.example.transport.response.CidadeIBGE;
import com.example.transport.response.EstadoIBGE;

import java.util.List;

public interface LocalidadeService {
    List<EstadoIBGE> buscarTodosEstados();
    List<CidadeIBGE> buscarCidadesPorEstado(String uf);
    boolean validarCidade(String uf,String nomeCidade);
}
