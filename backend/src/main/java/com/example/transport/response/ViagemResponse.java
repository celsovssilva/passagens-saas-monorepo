package com.example.transport.response;

import com.example.transport.entity.Viagem;

import java.time.LocalDateTime;

public record ViagemResponse(
        Long id,
        String origem,
        String destino,
        String ufOrigem,
        String ufDestino,
        String transporteModelo,
        LocalDateTime dataSaida,
        Double valor,
        Integer vagasDisponiveis
) {

    public ViagemResponse(Viagem v) {
        this(
                v.getId(),
                v.getRota().getOrigem(),
                v.getRota().getDestino(),
                v.getRota().getUfOrigem(),
                v.getRota().getUfDestino(),
                v.getTransport().getModelo(),
                v.getDataSaida(),
                v.getRota().getValor(),
                v.getVagasDisponiveis()
        );
    }
}
