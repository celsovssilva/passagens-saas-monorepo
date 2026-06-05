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
        public PassageiroResponse buscarPassageiros(Long idPassageiro) {
            Passageiro p = passageiroRepository.findByUserId(idPassageiro)
                    .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));
            return new PassageiroResponse(p);
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
        @Transactional
        public PassageiroResponse atualizarPassageiro(Long idPassageiro, PassageiroRequest passageiro) {

            Passageiro p = passageiroRepository.findByUserId(idPassageiro).orElse(null);

            User user;
            if (p == null) {
                // Se realmente não existir nenhum registro de passageiro associado a este user, cria um novo
                p = new Passageiro();

                user = userRepository.findById(idPassageiro)
                        .orElseThrow(() -> new RuntimeException("Usuário base não encontrado no sistema"));
                p.setUser(user);
            } else {
                user = p.getUser();
            }

            // Valida se o e-mail informado já pertence a outro usuário diferente
            Optional<User> emailExist = userRepository.findByEmail(passageiro.email());
            if (emailExist.isPresent() && !emailExist.get().getId().equals(user.getId())) {
                throw new RuntimeException("Esse e-mail já existe no sistema!");
            }
            if (user != null) {
                user.setEmail(passageiro.email());
                if (passageiro.password() != null && !passageiro.password().isBlank()) {
                    String senha = passwordEncoder.encode(passageiro.password());
                    user.setPassword(senha);
                }
                userRepository.save(user);
            }
            p.setNome(passageiro.nome());
            p.setSobrenome(passageiro.sobrenome());
            p.setPhone(passageiro.phone());
            p.setIdade(passageiro.idade());
            return new PassageiroResponse(passageiroRepository.save(p));

        }

    }
