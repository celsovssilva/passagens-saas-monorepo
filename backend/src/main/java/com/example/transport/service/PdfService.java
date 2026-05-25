package com.example.transport.service;

import java.time.LocalDateTime;

public interface PdfService {
    byte[] gerarPdfPassagem( String nomePassageiro, String documento, String origem,String Destino,
                             Integer quantidadeDeAssentos,
                             LocalDateTime dataHoraDaCompra,
                             Integer numeroAssentos);
}
