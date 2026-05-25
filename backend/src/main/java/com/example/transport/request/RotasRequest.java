package com.example.transport.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public record RotasRequest(
        @NotBlank(message = "A origem é obrigatória")
        String origem,

        @NotBlank(message = "A UF de origem é obrigatória")
        @Size(min = 2, max = 2, message = "UF deve ter 2 caracteres")
        String ufOrigem,

        @NotBlank(message = "O destino é obrigatório")
        String destino,

        @NotBlank(message = "A UF de destino é obrigatória")
        @Size(min = 2, max = 2, message = "UF deve ter 2 caracteres")
        String ufDestino,

        @NotNull(message = "O valor da passagem é obrigatório")
        @Positive(message = "O valor deve ser maior que zero")
        Double valorBase,

        @NotNull(message = "O horário padrão é obrigatório")
        LocalTime horarioPadrao
){

}
