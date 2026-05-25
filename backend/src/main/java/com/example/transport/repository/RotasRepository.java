package com.example.transport.repository;

import com.example.transport.entity.Rotas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RotasRepository extends JpaRepository<Rotas,Long> {
}
