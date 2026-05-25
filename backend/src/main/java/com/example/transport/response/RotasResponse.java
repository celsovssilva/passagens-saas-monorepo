package com.example.transport.response;

import com.example.transport.entity.Rotas;

public record RotasResponse(
        Long id,
        String origem,
        String ufOrigem,
        String destino,
        String ufDestino,
        Double valorBase,
        String horarioFormatado
){
    public RotasResponse(Rotas rotas){

        this(
                rotas.getId(),
                rotas.getOrigem(),
                rotas.getUfOrigem(),
                rotas.getDestino(),
                rotas.getUfDestino(),
                rotas.getValor(),
                rotas.getHorario() != null? rotas.getHorario().toString():"00:00"
        );
    }
}
