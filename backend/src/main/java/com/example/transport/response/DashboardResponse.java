package com.example.transport.response;

public record DashboardResponse (
        long totalPassageiros,
        long totalEmpresas,
        double faturamentoHoje
){}