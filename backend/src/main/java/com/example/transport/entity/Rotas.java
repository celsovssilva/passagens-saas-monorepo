package com.example.transport.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalTime;

@Entity
@AllArgsConstructor @NoArgsConstructor
@Getter @Setter
public class Rotas {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String origem;
    private String destino;
    private String ufOrigem;
    private String ufDestino;
    private LocalTime horario;
    private Double valor;

    public void set() {

    }
}
