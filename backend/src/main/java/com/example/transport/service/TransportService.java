package com.example.transport.service;

import com.example.transport.entity.Transport;
import com.example.transport.request.TransportRequest;

public interface TransportService {
    Transport buscarPorId(Long id);
    Transport cadastrar(TransportRequest p);
    Transport atualizar(Long id,TransportRequest p);
    void deletar(Long id);

}
