package com.example.transport.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Passagem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime dataHoraDaCompra;
    private Integer quantidadeDeAssentos;
    private  Integer numeroAssentos;
    private String nomePassageiro;
    @CPF(message = "CPF inválido")
    private String cpf;

    @ManyToOne
    private User user;
    @ManyToOne
    private Viagem viagem;
    @ManyToOne
    private Transport transport;
    @ManyToOne
    @JoinColumn(name = "compra_id")
    private Compra compra;


}
