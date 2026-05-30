package com.example.transport.service.IMPL;

import com.example.transport.entity.Transport;
import com.example.transport.repository.TransportRepository;
import com.example.transport.request.TransportRequest;
import com.example.transport.response.TransportResponse;
import com.example.transport.service.TransportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransportServiceIMPL implements TransportService {

    @Autowired
    TransportRepository transportRepository;
    @Override
    public Transport buscarPorId(Long id) {
        return transportRepository.findById(id).get();
    }

    @Override
    public Transport cadastrar(TransportRequest p) {
        if(p.capacidade() <= 0){
            throw new RuntimeException("Capacidade deve ser maior que zero");
        }
        Transport transport = new Transport();
        transport.setModelo(p.modelo());
        transport.setVagas(p.capacidade());
        transport.setStatus(p.status());
        return transportRepository.save(transport);
    }

    @Override
    public Transport atualizar(Long id, TransportRequest p) {
        Transport transport = transportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("transport inexistente"));
        transport.setModelo(p.modelo());
        transport.setVagas(p.capacidade());
        transport.setStatus(p.status());
        return transportRepository.save(transport);
    }

    @Override
    public void deletar(Long id) {
        transportRepository.deleteById(id);
    }

    @Override
    public List<TransportResponse> listarTodas() {
        List<Transport> t =transportRepository.findAll();
        return t.stream().map(TransportResponse::new).toList();
    }
}
