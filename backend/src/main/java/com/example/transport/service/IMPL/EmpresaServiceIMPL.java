package com.example.transport.service.IMPL;

import com.example.transport.entity.Empresa;
import com.example.transport.entity.Role;
import com.example.transport.entity.User;
import com.example.transport.repository.EmpresaRepository;
import com.example.transport.repository.UserRepository;
import com.example.transport.request.EmpresaRequest;
import com.example.transport.response.TransportResponse;
import com.example.transport.service.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmpresaServiceIMPL implements EmpresaService {
    @Autowired
    private EmpresaRepository empresaRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Empresa buscarEmpresa(Long idEmpresa) {
        return empresaRepository.findById(idEmpresa).orElse(null);
    }

    @Override
    public Empresa cadastroEmpresa(EmpresaRequest empresa) {
        Optional<User> user = userRepository.findByEmail(empresa.email());
        if (user.isPresent()) {
            throw new RuntimeException("esse email já está no sistema");
        }
        User newUser = new User();
        newUser.setEmail(empresa.email());
        String senha = passwordEncoder.encode(empresa.password());
        newUser.setPassword(senha);
        newUser.setRole(Role.EMPRESA);
        newUser= userRepository.save(newUser);

        Empresa newEmpresa = new Empresa();
        newEmpresa.setCnpj(empresa.cnpj());
        newEmpresa.setRazaoSocial(empresa.razaoSocial());
        newEmpresa.setEndereco(empresa.endereco());
        newEmpresa.setTelefone(empresa.telefone());

        newEmpresa.setUser(newUser);

        return empresaRepository.save(newEmpresa);
    }

    @Override
    public Empresa atualizarEmpresa(Long id, EmpresaRequest empresa) {
        Empresa newEmpresa = empresaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("empresa inexistente"));
        Optional<User> emailExistente = userRepository.findByEmail(empresa.email());
        if(emailExistente.isPresent() && emailExistente.get().getId().equals(newEmpresa.getId())) {
            throw new RuntimeException("esse email já existe no sistema");
        }else{
            User newUser = (User) newEmpresa.getUser();
            if(newUser != null) {
                newUser.setEmail(empresa.email());
                newUser.setPassword(empresa.password());
            }
        }
        newEmpresa.setCnpj(empresa.cnpj());
        newEmpresa.setRazaoSocial(empresa.razaoSocial());
        newEmpresa.setEndereco(empresa.endereco());
        newEmpresa.setTelefone(empresa.telefone());

        return empresaRepository.save(newEmpresa);
    }

    @Override
    public List<TransportResponse> buscarTransporteporEmpresa(Long idEmpresa) {
        Empresa newEmpresa = empresaRepository.findById(idEmpresa)
                .orElseThrow(() -> new RuntimeException("empresa inexistente"));

        return newEmpresa.getTransporte().stream()
                .map(t -> new TransportResponse(
                        t.getModelo(),
                        t.getVagas(),
                        t.getStatus()
                )).toList();
    }
}
