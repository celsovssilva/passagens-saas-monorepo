package com.example.transport.controller;

import com.example.transport.entity.Passageiro;
import com.example.transport.repository.UserRepository;
import com.example.transport.request.PassageiroRequest;
import com.example.transport.response.PassageiroResponse;
import com.example.transport.service.PassageiroService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("api/passageiro")
public class PassageiroController {
    @Autowired
    private PassageiroService passageiroService;
    @Autowired
    private UserRepository userRepository;

        @PostMapping("/cadastrar")
        public ResponseEntity<PassageiroResponse> cadastrarPassageiro(@RequestBody @Valid PassageiroRequest passageiro){
            Passageiro passageiro1 = passageiroService.cadastrarPassageiro(passageiro);
            PassageiroResponse passageiroResponse = new PassageiroResponse(passageiro1);
            return ResponseEntity.ok(passageiroResponse);
        }

        @GetMapping("/buscar/{idPassageiro}")
    public ResponseEntity<PassageiroResponse> buscarPassageiros(@PathVariable Long idPassageiro){
            Optional<Passageiro> passageiro = passageiroService.buscarPassageiros(idPassageiro);
            PassageiroResponse p = new PassageiroResponse(passageiro.get());

            return ResponseEntity.ok(p);

        }

        @PutMapping("/atualizar/{idPassageiro}")
        public ResponseEntity<PassageiroResponse> atualizarPassageiro(@PathVariable Long idPassageiro,@RequestBody PassageiroRequest passageiro){

            return ResponseEntity.ok(passageiroService.atualizarPassageiro(idPassageiro,passageiro));
        }

        @DeleteMapping("deletar/{idPassageiro}")
    public void deletarPassageiro(@PathVariable Long idPassageiro){
            passageiroService.removerPassageiro(idPassageiro);
        }
    }
