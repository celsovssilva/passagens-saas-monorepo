package com.example.transport.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Passageiro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;
    private String nome;
    private String sobrenome;
    @Column(unique = true)
    private String cpf;
    private Integer idade;
    private String phone;

    @OneToOne(cascade = CascadeType.ALL)
    private Transport transports;
    @OneToMany(cascade = CascadeType.ALL)
    private List<Viagem> viages;
    @OneToOne(cascade = CascadeType.ALL)
    private User user;


}
