package com.example.transport.service;

import com.example.transport.request.RotasRequest;
import com.example.transport.response.RotasResponse;

public interface RotasService {
    RotasResponse cadastrar (RotasRequest r);
}
