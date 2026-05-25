package com.example.transport.request;

public record EmpresaRequest(
         Long id,
         String email,
         String password,
         String telefone,
         String endereco,
         String cnpj,
         String razaoSocial,
         Long transportId,
         Long compraId,
         Long userId
) {
}
