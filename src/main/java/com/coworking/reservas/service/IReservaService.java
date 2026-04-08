package com.coworking.reservas.service;

import java.util.List;

import com.coworking.reservas.dto.ReservaCreateRequest;
import com.coworking.reservas.dto.ReservaResponse;

public interface IReservaService {

    ReservaResponse crearReserva(Long usuarioId, ReservaCreateRequest reservaCreateRequest);

    List<ReservaResponse> consultarReservasDelUsuario(Long usuarioId);

    ReservaResponse cancelarReserva(Long usuarioId, Long reservaId);
}
