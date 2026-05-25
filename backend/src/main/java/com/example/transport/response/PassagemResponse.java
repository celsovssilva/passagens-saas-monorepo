package com.example.transport.response;

import com.example.transport.entity.Passagem;

import java.time.LocalDateTime;

public record PassagemResponse(
        String nomePassageiro,
        String email,
        String documento,
        String origem,
        String Destino,
        Integer quantidadeDeAssentos,
        LocalDateTime dataHoraDaCompra,
        Integer numeroAssentos
) {
    public PassagemResponse(Passagem passagem){
        this(
            passagem.getNomePassageiro(),
                passagem.getUser().getEmail(),
                passagem.getCpf(),
                passagem.getViagem().getRota().getOrigem(),
                passagem.getViagem().getRota().getDestino(),
                passagem.getQuantidadeDeAssentos(),
                passagem.getDataHoraDaCompra(),
                passagem.getNumeroAssentos()
        );
    }

}
