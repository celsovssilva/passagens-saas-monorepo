package com.example.transport.entity;

import com.example.transport.response.PassagemResponse;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Compra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    private double valor;
    @Enumerated(EnumType.STRING)
    private StatusPagamento status;


    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Passagem> passagens;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "viagem_id")
    private Viagem viagem;

    private LocalDateTime dataCompra;

    @Enumerated(EnumType.STRING)
    private MetodoPagamento metodoPagamento;

    private String comprovantePix;
    private String pixCopiaECola;


}