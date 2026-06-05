package com.example.transport.response;

import com.example.transport.entity.Compra;
import java.time.LocalDateTime;

public record CompraResponse(
        Long id,
        String status,
        LocalDateTime dataCompra,
        Integer quantidadeDePassagens,
        String pixCopiaECola,
        String origem,
        String destino
) {

    public CompraResponse(Compra compra) {
        this(
                compra.getId(),
                compra.getStatus().name(),
                compra.getDataCompra(),
                compra.getPassagens() != null ? compra.getPassagens().size() : 0,
                compra.getPixCopiaECola(),
                (compra.getViagem() != null && compra.getViagem().getRota() != null)
                        ? compra.getViagem().getRota().getOrigem()
                        : "Não informada",

                (compra.getViagem() != null && compra.getViagem().getRota() != null)
                        ? compra.getViagem().getRota().getDestino()
                        : "Não informada"
        );
    }
}