package com.example.transport.repository;

import com.example.transport.entity.Empresa;
import com.example.transport.entity.Passageiro;
import com.example.transport.entity.Transport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransportRepository extends JpaRepository<Transport, Long> {
    List<Transport> findByEmpresaId(Long empresaId);
}
