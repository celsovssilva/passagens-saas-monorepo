package com.example.transport.response;

import com.example.transport.entity.Transport;
import lombok.Data;


public record TransportResponse(
        String modelo,
        Integer capacidade,
        String status
        ) {
    public TransportResponse(Transport t) {
        this(t.getModelo(), t.getVagas(), t.getStatus());
    }

}
