package com.example.transport.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
public class Pagamentos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Enumerated(EnumType.STRING)
    private MetodoPagamento metodo;
    @Enumerated(EnumType.STRING)
    private StatusPagamento status;

    private Double valorPago;
    private LocalDateTime dataProcessamento;
    private String transacaoId;
    private String quatroUltDigitos;

    @OneToOne
    @JoinColumn(name="compra_id")
    private Compra compra;
}
