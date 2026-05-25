package com.example.transport.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
public record ViagemRequest(
        Long id,
        Long  rotaId,
        @NotNull(message = "a data de saida é obrigatória")
        @Future(message =" A data de saída deve ser uma data futura")
        LocalDateTime dataSaida,
        Long userId,
        Long transportId,
        Integer capacidade,
        String cpf,
        String nomePassageiro,
        Integer vagasDisponiveis
) {
}