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

    @Override
    public ViagemResponse cadastrarViagem(ViagemRequest viagemRequest) {
        Rotas rota = rotasRepository.findById(viagemRequest.rotaId())
                .orElseThrow(()-> new RuntimeException("rota não encontrada"));


        Transport transport= transportRepository.findById(viagemRequest.transportId())
                .orElseThrow(()-> new RuntimeException("transporte não encontrada"));
        Viagem v = new Viagem();
        v.setRota(rota);
        v.setDataSaida(viagemRequest.dataSaida());
        v.setTransport(transport);
        v.setCapacidade(viagemRequest.capacidade());
        v.setVagasDisponiveis(viagemRequest.vagasDisponiveis());

        viagemRepository.save(v);
        return new  ViagemResponse(v);
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
