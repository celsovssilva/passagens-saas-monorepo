package com.example.transport.service.IMPL;

import com.example.transport.config.RabbitMqConfig;
import com.example.transport.entity.*;
import com.example.transport.repository.*;
import com.example.transport.request.CompraRequest;
import com.example.transport.response.CompraResponse;
import com.example.transport.response.PassagemResponse;
import com.example.transport.service.CompraService;
import com.example.transport.service.PdfService;
import jakarta.transaction.Transactional;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class CompraServiceIMPL implements CompraService {
    @Autowired
    CompraRepository compraRepository;
    @Autowired
    ViagemRepository viagemRepository;
    @Autowired
    PassageiroRepository passageiroRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    PdfService pdfService;
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Autowired
    PassagemRepository passagemRepository;


    @Transactional
    @Override
    public CompraResponse comprar(CompraRequest compra) {
        Viagem v = viagemRepository.findById(compra.viagemId())
                .orElseThrow(()-> new RuntimeException("Viagem não encontrada"));

        User comprador = userRepository.findById(compra.usuarioId())
                .orElseThrow(()-> new RuntimeException("usuário não encontrado"));

        int quantidadeDePassagens = compra.passageiro().size();
        Double valorTotal = v.getRota().getValor() * quantidadeDePassagens;

        if(quantidadeDePassagens > v.getCapacidade()) {
            throw new RuntimeException("Não há assentos suficientes");
        }

        Compra compra1 = new Compra();
        compra1.setUser(comprador);
        compra1.setValor(valorTotal);
        compra1.setDataCompra(LocalDateTime.now());
        compra1.setMetodoPagamento(compra.metodo());

        List<Passagem> passagens = compra.passageiro().stream().map(p -> {
            Passagem passagem = new Passagem();
            passagem.setNomePassageiro(p.nome());
            passagem.setCpf(String.valueOf(p.cpf()));
            passagem.setCompra(compra1);
            passagem.setViagem(v);
            passagem.setDataHoraDaCompra(LocalDateTime.now());
            passagem.setQuantidadeDeAssentos(p.quantidadeDeAssentos());
            passagem.setNumeroAssentos(p.numeroAssentos());

            return passagem;
        }).toList();


        compra1.setPassagens(passagens);
        compra1.setValor(v.getRota().getValor() * quantidadeDePassagens);

        if(compra.metodo() == MetodoPagamento.PIX){
            compra1.setStatus(StatusPagamento.PENDENTE);
            compra1.setPixCopiaECola("PIX-COPIA-COLA" + UUID.randomUUID());
        } else if (compra.metodo() == MetodoPagamento.CARTAO_CREDITO) {
            compra1.setStatus(StatusPagamento.APROVADO);
        }

        v.setCapacidade(v.getCapacidade() - quantidadeDePassagens);
        viagemRepository.save(v);
        Compra compra2 = compraRepository.save(compra1);
        passagemRepository.saveAll(passagens);
        if (compra2.getStatus() == StatusPagamento.APROVADO) {
            dispararMensagem(compra2, v, comprador);
        }
        return new CompraResponse(compra2);
    }

    @Override
    public List<CompraResponse> historico(Long userId) {
            List<Compra> compras = compraRepository.findByUserId(userId);
        return compras.stream().map(CompraResponse::new).toList();
    }

    @Override
    public void confirmarPagamento(Long idCompra) {
        Compra c = compraRepository.findById(idCompra)
                .orElseThrow(() -> new RuntimeException("compra inexistente"));
        if(!c.getStatus().equals(StatusPagamento.PENDENTE)) {
            throw  new RuntimeException("Operação inválida. O status atual é" + StatusPagamento.CANCELADO);
        }
        c.setStatus(StatusPagamento.APROVADO);

        Compra compraSalva = compraRepository.save(c);
        Viagem v = compraSalva.getPassagens().get(0).getViagem();
        dispararMensagem(compraSalva, v, compraSalva.getUser());
    }

    @Override
    public void cancelarCompra(Long compraId) {
        Compra compra = compraRepository.findById(compraId)
                .orElseThrow(()-> new RuntimeException("Essa compra não existe"));
        if(StatusPagamento.CANCELADO.equals(compra.getStatus())){
            new RuntimeException("Compra já cancelada");

        }
        if(compra.getPassagens().isEmpty()){
            new RuntimeException("Erro: Compra sem passagens vinculadas.");
        }
        Viagem v = compra.getPassagens().get(0).getViagem();
        int vagasParaDevolver = compra.getPassagens().size();
        v.devolverVagas(vagasParaDevolver);
        compra.setStatus(StatusPagamento.CANCELADO);

        viagemRepository.save(v);
        compraRepository.save(compra);
    }
    private void dispararMensagem(Compra c, Viagem v, User u){
        try {

            if(c.getPassagens() == null || c.getPassagens().isEmpty()){
                System.out.println("sistema não possui passagens");
                return;
            }

            for(Passagem passagemReal : c.getPassagens()){
                String nomePassageiro = passagemReal.getNomePassageiro();
                String Origem = v.getRota().getOrigem();
                String destino = v.getRota().getDestino();
                String documento = passagemReal.getCpf();
                Integer quantidadeDeAssentos= passagemReal.getQuantidadeDeAssentos();
                LocalDateTime dataHoraDaCompra = passagemReal.getDataHoraDaCompra();
                Integer numeroAssentos = passagemReal.getNumeroAssentos();
                byte[] pdfBytes = pdfService.gerarPdfPassagem(nomePassageiro, Origem , documento,destino,quantidadeDeAssentos,dataHoraDaCompra,numeroAssentos);
                PassagemResponse r =  new PassagemResponse(
                        nomePassageiro,
                        u.getEmail(),
                        documento,
                        Origem,
                        destino,
                        quantidadeDeAssentos,
                        dataHoraDaCompra,
                        numeroAssentos);
                rabbitTemplate.convertAndSend(RabbitMqConfig.QUEUE_PASSAGEM, r);
                System.out.println(">>>> [RABBITMQ] Mensagem de passagem enviada com sucesso para a fila! <<<<");
            }

        } catch (Exception e) {
            System.err.println("Erro ao enviar mensagem para o RabbitMQ: " + e.getMessage());
        }
    }
        }

