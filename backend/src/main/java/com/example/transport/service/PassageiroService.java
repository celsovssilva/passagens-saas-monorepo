package com.example.transport.service;

import com.example.transport.entity.Passageiro;
import com.example.transport.request.PassageiroRequest;
import com.example.transport.response.PassageiroResponse;
import org.springframework.stereotype.Service;

import java.util.Optional;

public interface PassageiroService {
    public Optional<Passageiro> buscarPassageiros(Long idPassageiro);
    public Passageiro cadastrarPassageiro(PassageiroRequest passageiro);
    public void removerPassageiro(Long idPassageiro);
    public PassageiroResponse atualizarPassageiro(Long idPassageiro, PassageiroRequest passageiro);
}
