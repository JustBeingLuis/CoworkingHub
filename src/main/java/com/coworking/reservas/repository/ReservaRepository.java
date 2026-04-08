package com.coworking.reservas.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

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

    @Query("""
            select r
            from Reserva r
            join fetch r.estado er
            where r.espacio.id = :espacioId
              and r.fecha = :fecha
              and upper(er.nombre) <> 'CANCELADA'
              and :horaInicio < r.horaFin
              and :horaFin > r.horaInicio
            """)
    List<Reserva> findConflictosByEspacioFechaYHorario(@Param("espacioId") Long espacioId,
                                                       @Param("fecha") LocalDate fecha,
                                                       @Param("horaInicio") LocalTime horaInicio,
                                                       @Param("horaFin") LocalTime horaFin);

    @Query("""
            select r
            from Reserva r
            join fetch r.espacio e
            join fetch e.tipo t
            join fetch r.estado er
            where r.usuario.id = :usuarioId
            order by r.fecha desc, r.horaInicio desc
            """)
    List<Reserva> findReservasByUsuarioId(@Param("usuarioId") Long usuarioId);

    @Query("""
            select r
            from Reserva r
            join fetch r.espacio e
            join fetch e.tipo t
            join fetch r.estado er
            join fetch r.usuario u
            where r.id = :reservaId
            """)
    Optional<Reserva> findDetalleById(@Param("reservaId") Long reservaId);
}
