package com.example.transport.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.hibernate.validator.constraints.br.CPF;

public record PassageiroRequest (
        Long id,
        @NotBlank(message = "O nome é obrigatório")
        String nome,
        String sobrenome,
        String phone,
        String email,
        @NotBlank(message = "CPF é obrigatório")
        @CPF(message = "CPF inválido")
        String cpf,
        String password,
        Integer numeroAssentos,
        Integer quantidadeDeAssentos,
        @Positive(message = "A idade deve ser um numero positivo")
        @Max(value = 120,message = "idade invalida ")
        Integer idade

){
}
