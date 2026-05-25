package com.example.transport.service;

import com.example.transport.entity.Compra;
import com.example.transport.request.CompraRequest;
import com.example.transport.response.CompraResponse;

import java.util.List;

public interface CompraService {
    CompraResponse comprar(CompraRequest compra);
    List<CompraResponse> historico(Long userId);
    void confirmarPagamento(Long idCompra);
    void cancelarCompra(Long compraId);
}
