package com.example.transport.service.IMPL;

import com.example.transport.entity.*;
import com.example.transport.repository.*;
import com.example.transport.request.ViagemRequest;
import com.example.transport.response.PassageiroResponse;
import com.example.transport.response.ViagemResponse;
import com.example.transport.service.ViagemService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class ViagemServiceIMPL implements ViagemService {
    @Autowired
    private ViagemRepository viagemRepository;
    @Autowired
    private TransportRepository transportRepository;
    @Autowired
    private UserRepository user;
    @Autowired
    private RotasRepository rotasRepository;
    @Autowired
    private  PassagemRepository passagemRespository;
    @Override
    @Transactional
    public ViagemResponse agendarViagem(ViagemRequest viagemRequest) {

        Viagem viagem = viagemRepository.findById(viagemRequest.id())
                .orElseThrow(() -> new RuntimeException("Viagem não encontrada"));
        if (viagem.getVagasDisponiveis() < viagemRequest.capacidade()) {
            throw new RuntimeException("Não há assentos suficientes. Vagas disponíveis: " + viagem.getVagasDisponiveis());
        }
        User u = user.findById(viagemRequest.userId())
                .orElseThrow(()-> new RuntimeException("User não encontrado"));
        Passagem passagem = new Passagem();
        passagem.setDataHoraDaCompra(LocalDateTime.now());
        passagem.setCpf(viagemRequest.cpf());
        passagem.setNomePassageiro(viagemRequest.nomePassageiro());
        passagem.setTransport(viagem.getTransport());
        passagem.setUser(u);
        passagem.setViagem(viagem);

      viagem.setVagasDisponiveis( viagem.getCapacidade() - viagem.getVagasDisponiveis());
        passagemRespository.save(passagem);
        return new ViagemResponse(viagem);
    }

    @Override
    public List<ViagemResponse> buscarViagemPorId(Long id) {
      List<Viagem> v = Collections.singletonList(viagemRepository.findById(id)
              .orElseThrow(() -> new RuntimeException("viagem não encontrada")));

        return v.stream().map(ViagemResponse::new).toList();
    }

    @Transactional
    @Override
    public ViagemResponse cadastrarViagem(ViagemRequest dados) {


        if (dados.rotaId() == null) {
            throw new IllegalArgumentException("O ID da rota não pode ser nulo.");
        }
        Rotas rota = rotasRepository.findById(dados.rotaId())
                .orElseThrow(() -> new RuntimeException("Rota não encontrada"));


        if (dados.transportId() == null) {
            throw new IllegalArgumentException("O ID do transporte não pode ser nulo.");
        }

        Transport transport = transportRepository.findById(dados.transportId())
                .orElseThrow(() -> new RuntimeException("Veículo de transporte não encontrado"));


        Viagem novaViagem = new Viagem();
        novaViagem.setRota(rota);
        novaViagem.setTransport(transport);
        novaViagem.setDataSaida(dados.dataSaida());
        novaViagem.setCapacidade(dados.capacidade());
        novaViagem.setVagasDisponiveis(dados.vagasDisponiveis());
        viagemRepository.save(novaViagem);
        return new ViagemResponse(novaViagem);
    }

    @Override
    public List<PassageiroResponse> buscarPassageirosporViagem(Long viagemId) {
        Viagem v = viagemRepository.findById(viagemId)
                .orElseThrow(() -> new RuntimeException("Viagem não encontrada"));

        return v.getPassageiro().stream()
                .map(p -> new PassageiroResponse(
                        p.getNome(),
                        p.getUser().getEmail(),
                        p.getPhone(),
                        p.getIdade()
                ))
                .toList();
    }

    @Override
    public void deleteViagem(Long idViagem) {

        viagemRepository.deletarPorId(idViagem);

    }

    @Override
    public List<ViagemResponse> listarTodasAsViagensRealizadas() {
        List<Viagem> v = viagemRepository.findAll();

        return v.stream().map(ViagemResponse::new).toList();
    }

    @Override
    public List<ViagemResponse> buscarViagem(String origem, String destino, LocalDateTime data) {
        List<Viagem> viagensEncontradas = viagemRepository.buscarPorDataERota(origem,destino,data);
        return viagensEncontradas.stream()
                .map(ViagemResponse::new).toList();
    }
}
