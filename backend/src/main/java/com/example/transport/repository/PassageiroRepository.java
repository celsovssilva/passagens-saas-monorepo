package com.example.transport.repository;

import com.example.transport.entity.Passageiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PassageiroRepository extends JpaRepository<Passageiro,Long> {
    Optional<Passageiro> findByCpf(String cpf);;

}
