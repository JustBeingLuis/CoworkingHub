package com.coworking.reservas.repository;

import com.coworking.reservas.domain.Espacio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EspacioRepository extends JpaRepository<Espacio, Long> {
}

