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


    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL)
    private List<Passagem> passagens;

    private LocalDateTime dataCompra;

    @Enumerated(EnumType.STRING)
    private MetodoPagamento metodoPagamento;
    @ManyToOne
    @JoinColumn(name = "viagem_id")
    private Viagem viagem;

    private String comprovantePix;
    private String pixCopiaECola;


}