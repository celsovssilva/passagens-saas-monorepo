package com.example.transport.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class Viagem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rota_id")
    private Rotas rota;

    @ManyToOne
    @JoinColumn(name = "transport_id")
    private Transport transport;

    private LocalDateTime dataSaida;

    private Integer capacidade;
    private Integer vagasDisponiveis;

    @OneToMany(mappedBy = "viagem")
    private List<Passagem> passagens;
    @ManyToMany
    private List<Passageiro> passageiro ;

    public void devolverVagas(int quantidade) {
        if (this.vagasDisponiveis == null) {
            this.vagasDisponiveis = this.capacidade;
        }
        this.vagasDisponiveis += quantidade;

            if (this.vagasDisponiveis > this.capacidade) {
            this.vagasDisponiveis = this.capacidade;
        }
    }
}