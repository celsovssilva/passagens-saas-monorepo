package com.example.transport.service.IMPL;

import com.example.transport.entity.Passageiro;
import com.example.transport.entity.Role;
import com.example.transport.entity.User;
import com.example.transport.repository.PassageiroRepository;
import com.example.transport.repository.UserRepository;
import com.example.transport.request.PassageiroRequest;
import com.example.transport.response.PassageiroResponse;
import com.example.transport.service.PassageiroService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PassageiroServiceIMPL  implements PassageiroService {

    @Autowired
    private PassageiroRepository passageiroRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Optional<Passageiro> buscarPassageiros(Long idPassageiro) {

        return passageiroRepository.findById(idPassageiro);
    }

    @Override
    @Transactional
    public Passageiro cadastrarPassageiro(PassageiroRequest passageiro) {
        if (passageiroRepository.findByCpf(passageiro.cpf()).isPresent()) {
            throw new RuntimeException("CPF invalido");

        }
        //verifica se o email já existe e não deixa cadastrar
        Optional<User> usuarioExistente = userRepository.findByEmail(passageiro.email());
        if (usuarioExistente.isPresent()) {
            throw new RuntimeException("Este e-mail já está cadastrado no sistema!");
        }

        //cria o usuario
        User user = new User();
        user.setEmail(passageiro.email());
        String senha = passwordEncoder.encode(passageiro.password());
        user.setPassword(senha);
        user.setRole(Role.PASSAGEIRO);
        //cria o passageiro, fazendo a conversão pro dto
        Passageiro p = new Passageiro();
        p.setNome(passageiro.nome());
        p.setSobrenome(passageiro.sobrenome());
        p.setPhone(passageiro.phone());
        p.setIdade(passageiro.idade());
        // vinculo
        p.setUser(user);

        return passageiroRepository.save(p);
    }

    @Override
    public void removerPassageiro(Long idPassageiro) {

        passageiroRepository.deleteById(idPassageiro);
    }

    @Override
    public PassageiroResponse atualizarPassageiro(Long idPassageiro, PassageiroRequest passageiro) {
        //valida se o id existe
        Passageiro p = passageiroRepository.findById(idPassageiro)
                .orElseThrow(() -> new RuntimeException("Passageiro não encontrado"));
        //busca email no banco
        Optional<User> emailExist = userRepository.findByEmail(passageiro.email());
        //se o email existir e não for do mesmo dono, não deixa atualizar
        if (emailExist.isPresent() && !emailExist.get().getId().equals(p.getUser().getId())) {
            throw new RuntimeException("esse email já existe no sistema!");
        } else {
            User user = p.getUser();
            if (user != null) {
                user.setEmail(passageiro.email());
                if (passageiro.password() != null && !passageiro.password().isBlank()) {
                    String senha = passwordEncoder.encode(passageiro.password());
                    user.setPassword(senha);
                }
            }

            p.setNome(passageiro.nome());
            p.setSobrenome(passageiro.sobrenome());
            p.setPhone(passageiro.phone());
            p.setIdade(passageiro.idade());



            return new PassageiroResponse(passageiroRepository.save(p));
        }
    }
}
