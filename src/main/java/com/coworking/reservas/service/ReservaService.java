package com.coworking.reservas.service;

import java.time.LocalDateTime;
import com.coworking.reservas.domain.Espacio;
import com.coworking.reservas.domain.EstadoReserva;
import com.coworking.reservas.domain.Reserva;
import com.coworking.reservas.domain.Usuario;
import com.coworking.reservas.dto.ReservaCreateRequest;
import com.coworking.reservas.dto.ReservaResponse;
import com.coworking.reservas.exception.ResourceNotFoundException;
import com.coworking.reservas.repository.EspacioRepository;
import com.coworking.reservas.repository.EstadoReservaRepository;
import com.coworking.reservas.repository.ReservaRepository;
import com.coworking.reservas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReservaService implements IReservaService {

    private static final String ESTADO_RESERVA_POR_DEFECTO = "CONFIRMADA";

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EspacioRepository espacioRepository;

    @Autowired
    private EstadoReservaRepository estadoReservaRepository;

    @Override
    public ReservaResponse crearReserva(Long usuarioId, ReservaCreateRequest reservaCreateRequest) {
        validarReserva(reservaCreateRequest);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro el usuario autenticado para registrar la reserva."
                ));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new IllegalArgumentException("Tu cuenta no esta habilitada para crear reservas.");
        }

        Espacio espacio = espacioRepository.findByIdAndActivoTrue(reservaCreateRequest.getEspacioId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro un espacio activo con el id " + reservaCreateRequest.getEspacioId()
                ));

        if (!reservaRepository.findConflictosByEspacioFechaYHorario(
                espacio.getId(),
                reservaCreateRequest.getFecha(),
                reservaCreateRequest.getHoraInicio(),
                reservaCreateRequest.getHoraFin()
        ).isEmpty()) {
            throw new IllegalArgumentException(
                    "El espacio ya tiene una reserva en conflicto para el rango horario seleccionado."
            );
        }

        EstadoReserva estadoReserva = estadoReservaRepository.findByNombreIgnoreCase(ESTADO_RESERVA_POR_DEFECTO)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro el estado de reserva '" + ESTADO_RESERVA_POR_DEFECTO + "'."
                ));

        Reserva reserva = new Reserva();
        reserva.setFecha(reservaCreateRequest.getFecha());
        reserva.setHoraInicio(reservaCreateRequest.getHoraInicio());
        reserva.setHoraFin(reservaCreateRequest.getHoraFin());
        reserva.setFechaCreacion(LocalDateTime.now());
        reserva.setUsuario(usuario);
        reserva.setEspacio(espacio);
        reserva.setEstado(estadoReserva);

        Reserva reservaGuardada = reservaRepository.save(reserva);
        return mapToResponse(reservaGuardada);
    }

    private void validarReserva(ReservaCreateRequest reservaCreateRequest) {
        if (!reservaCreateRequest.getHoraInicio().isBefore(reservaCreateRequest.getHoraFin())) {
            throw new IllegalArgumentException("La hora de inicio debe ser anterior a la hora de fin.");
        }
    }

    private ReservaResponse mapToResponse(Reserva reserva) {
        return new ReservaResponse(
                reserva.getId(),
                reserva.getEspacio().getId(),
                reserva.getEspacio().getNombre(),
                reserva.getFecha(),
                reserva.getHoraInicio(),
                reserva.getHoraFin(),
                reserva.getEstado().getNombre()
        );
    }
}
