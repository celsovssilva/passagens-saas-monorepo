package com.example.transport.controller;

import com.example.transport.entity.Viagem;
import com.example.transport.request.ViagemRequest;
import com.example.transport.response.PassageiroResponse;
import com.example.transport.response.ViagemResponse;
import com.example.transport.service.ViagemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/viagem")
public class ViagemController {
    @Autowired
    ViagemService viagemService;

    @PostMapping("/agendar")
    public ResponseEntity<ViagemResponse> agendarViagem(@RequestBody ViagemRequest viagem){
        return ResponseEntity.ok(viagemService.agendarViagem(viagem));
    }

    @GetMapping("/buscar/{id}")
    public List<ViagemResponse> buscarViagem(@PathVariable Long id){
        return viagemService.buscarViagemPorId(id);
    }

    @DeleteMapping("/deletar/{idViagem}")
    public void deletarViagem(@PathVariable Long idViagem){
        viagemService.deleteViagem(idViagem);
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<ViagemResponse> cadastrar(@RequestBody ViagemRequest request){
        return ResponseEntity.ok(viagemService.cadastrarViagem(request));
    }

    @GetMapping("/listar-passageiros/{viagemId}")
    public ResponseEntity<List<PassageiroResponse>> listarPassageirosViagem(@PathVariable Long viagemId){
        return ResponseEntity.ok( viagemService.buscarPassageirosporViagem(viagemId));
    }
    @GetMapping("/pesquisar")
    public ResponseEntity<List<ViagemResponse>> pesquisar(@RequestParam String origem,@RequestParam String destino,
                                                          @RequestParam @DateTimeFormat(iso= DateTimeFormat.ISO.DATE_TIME)
                                                          LocalDateTime data){
        return ResponseEntity.ok(viagemService.buscarViagem(origem, destino, data));
    }
    @GetMapping("/listar-todas")
    public ResponseEntity<List<ViagemResponse>> listarTodasViagens() {
        return ResponseEntity.ok(viagemService.listarTodasAsViagensRealizadas());
    }
}
