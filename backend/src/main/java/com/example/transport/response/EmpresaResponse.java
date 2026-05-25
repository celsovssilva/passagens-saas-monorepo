package com.example.transport.response;

import com.example.transport.entity.Empresa;

public record EmpresaResponse(
        String email,
        String telefone,
        String endereco,
        String cnpj,
        String razaoSocial
) {
    public EmpresaResponse(Empresa e) {
        this
                (
                        e.getUser().getEmail(),
                        e.getCnpj(),
                        e.getTelefone(),
                        e.getRazaoSocial(),
                        e.getEndereco()

                );

    }
}
