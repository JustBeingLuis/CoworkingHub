package com.coworking.reservas.service;

import java.time.LocalDate;
import java.time.LocalTime;

import com.coworking.reservas.dto.EspacioCatalogoResponse;
import com.coworking.reservas.dto.EspacioDisponibilidadDetalleResponse;

public interface IEspacioService {

    EspacioCatalogoResponse consultarEspaciosDisponibles(int page, int size);

    EspacioDisponibilidadDetalleResponse consultarDisponibilidadPorFechaYHorario(Long espacioId, LocalDate fecha,
                                                                                 LocalTime horaInicio,
                                                                                 LocalTime horaFin);
}
