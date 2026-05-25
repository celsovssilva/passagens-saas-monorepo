package com.example.transport.service.IMPL;

import com.example.transport.response.CidadeIBGE;
import com.example.transport.response.EstadoIBGE;
import com.example.transport.service.LocalidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class LocalidadeServiceIMPL implements LocalidadeService {
    @Autowired
    RestTemplate restTemplate;
    @Value("${api.ibge.url-estados}")
    private String urlEstados;

    @Override
    public List<EstadoIBGE> buscarTodosEstados() {
        EstadoIBGE[] estado = restTemplate.getForObject(urlEstados,EstadoIBGE[].class);

        return Arrays.asList(estado);
    }

    @Override
    public List<CidadeIBGE> buscarCidadesPorEstado(String uf) {
        String urlCidades = urlEstados + "/" + uf + "/municipios";
        CidadeIBGE[] cidades = restTemplate.getForObject(urlCidades, CidadeIBGE[].class);
        return  Arrays.asList(cidades);
    }

    @Override
    public boolean validarCidade(String uf, String nomeCidade) {
        List<CidadeIBGE> cidadesReais = buscarCidadesPorEstado(uf);
        return cidadesReais.stream().anyMatch(c -> c.nome().equalsIgnoreCase(nomeCidade));
    }
}
