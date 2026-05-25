package com.example.transport.response;


import com.example.transport.entity.Passageiro;

public record PassageiroResponse(
        String nome,
        String phone,
        String email,
        Integer idade
) {
    public PassageiroResponse(Passageiro p) {
        this(
                p.getNome(),
                p.getPhone(),
                p.getUser()!= null ? p.getUser().getEmail() : "email não encontrado" ,
                p.getIdade()
        );

    }


}
