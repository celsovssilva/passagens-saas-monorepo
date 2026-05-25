package com.example.transport.request;

import com.example.transport.entity.MetodoPagamento;
import com.example.transport.entity.Passagem;
import com.example.transport.entity.User;
import com.example.transport.response.PassageiroResponse;

import java.time.LocalDateTime;
import java.util.List;

public record CompraRequest(
        Long usuarioId,
       Long viagemId,
        List<PassageiroRequest> passageiro,
       MetodoPagamento metodo,
       String numeroCartao,
       String cvv

) {
}
