package com.example.transport.service.IMPL;

import com.example.transport.entity.Rotas;
import com.example.transport.repository.RotasRepository;
import com.example.transport.request.RotasRequest;
import com.example.transport.response.RotasResponse;
import com.example.transport.service.LocalidadeService;
import com.example.transport.service.RotasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RotasServiceIMPL implements RotasService {
    @Autowired
    RotasRepository rotasRepository;
    @Autowired
    LocalidadeService localidadeService;
    @Override
    public RotasResponse cadastrar(RotasRequest r) {
        if(!localidadeService.validarCidade(r.ufOrigem(),r.origem()) || !localidadeService.validarCidade(r.ufDestino(),r.destino())){
            throw  new RuntimeException("Localidade Invalida pelo IBGE. Cadastro cancelado");

        }
        Rotas rotas = new Rotas();
        rotas.setOrigem(r.origem());
        rotas.setUfOrigem(r.ufOrigem());
        rotas.setDestino(r.destino());
        rotas.setUfDestino(r.ufDestino());
        rotas.setValor(r.valorBase());
        rotas.setHorario(r.horarioPadrao());
        rotasRepository.save(rotas);
        return new RotasResponse(rotas);
    }

    @Override
    public List<RotasResponse> listarTodas() {
        List<Rotas> r = rotasRepository.findAll();
        return  r.stream().map(RotasResponse::new).collect(Collectors.toList());
     }
}
