package com.example.transport.service;

import com.example.transport.request.RotasRequest;
import com.example.transport.response.RotasResponse;

import java.util.List;

public interface RotasService {
    RotasResponse cadastrar (RotasRequest r);
    List<RotasResponse> listarTodas();
}
