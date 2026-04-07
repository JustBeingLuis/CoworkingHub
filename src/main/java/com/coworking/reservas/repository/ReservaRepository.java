package com.coworking.reservas.repository;

import java.time.LocalDate;
import java.util.List;

import com.coworking.reservas.domain.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    @Query("""
            select r
            from Reserva r
            join fetch r.estado er
            where r.espacio.id = :espacioId
              and r.fecha = :fecha
              and upper(er.nombre) <> 'CANCELADA'
            order by r.horaInicio asc
            """)
    List<Reserva> findHorariosOcupadosByEspacioAndFecha(@Param("espacioId") Long espacioId,
                                                        @Param("fecha") LocalDate fecha);
}
