package com.coworking.reservas.service;

import com.coworking.reservas.dto.ReservaCreateRequest;
import com.coworking.reservas.dto.ReservaResponse;

public interface IReservaService {

    ReservaResponse crearReserva(Long usuarioId, ReservaCreateRequest reservaCreateRequest);
}
