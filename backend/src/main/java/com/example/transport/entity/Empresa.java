package com.example.transport.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Empresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String telefone;
    private String endereco;
    private String cnpj;
    private String razaoSocial;

    @OneToMany
    private List<Transport> transporte;
    @OneToMany
    private List<Compra> compra;
    @ManyToOne
    private User user;

}
