package com.example.transport.repository;

import com.example.transport.entity.Viagem;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ViagemRepository extends JpaRepository<Viagem, Long> {
    @Query("SELECT v FROM Viagem v WHERE v.rota.origem = ?1 AND v.rota.destino = ?2 AND v.dataSaida = ?3")
    List<Viagem> buscarPorDataERota(String origem, String destino, LocalDateTime dataSaida);
    @Modifying
    @Transactional
    @Query("DELETE FROM Viagem v WHERE v.id = :id")
    void deletarPorId(Long id);

}
