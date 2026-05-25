package com.example.transport.service.IMPL;

import com.example.transport.service.PdfService;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;


import java.io.ByteArrayOutputStream;
import java.lang.annotation.Documented;
import java.time.LocalDateTime;

@Service
public class PdfServiceIMPL implements PdfService {

    @Override
    public byte[] gerarPdfPassagem(String nomePassageiro, String documento, String origem, String Destino, Integer quantidadeDeAssentos, LocalDateTime dataHoraDaCompra, Integer numeroAssentos) {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document,b);
        document.open();
        document.add(new Paragraph("========================================"));
        document.add(new Paragraph("          PASSAGEM DE VIAGEM            "));
        document.add(new Paragraph("========================================"));
        document.add(new Paragraph("\nPassageiro: " + nomePassageiro));
        document.add(new Paragraph("\nDocumento: " + documento));
        document.add(new Paragraph("\nOrigem: " + origem));
        document.add(new Paragraph("\nDestino: " + Destino));
        document.add(new Paragraph("\nVagas Compradas: " + quantidadeDeAssentos));
        document.add(new Paragraph("\nHora da Compra: " + dataHoraDaCompra));
        document.add(new Paragraph("\nNumero(s) da(s) cadeira(s): " + numeroAssentos));
        document.add(new Paragraph("\nStatus: CONFIRMADA E PAGA"));
        document.add(new Paragraph("\n========================================"));
        document.add(new Paragraph("Obrigado por viajar conosco!"));
        document.close();


        return b.toByteArray();
    }
}
