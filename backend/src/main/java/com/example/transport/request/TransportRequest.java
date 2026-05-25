package com.example.transport.request;

public record TransportRequest(
        String modelo,
        Integer capacidade,
        String status,
        Long empresaId
) {
}
