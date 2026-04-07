package com.coworking.reservas.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.coworking.reservas.dto.EspacioDisponibleResponse;
import com.coworking.reservas.dto.EspacioDisponibilidadDetalleResponse;

public interface IEspacioService {

    List<EspacioDisponibleResponse> consultarEspaciosDisponibles();

    EspacioDisponibilidadDetalleResponse consultarDisponibilidadPorFechaYHorario(Long espacioId, LocalDate fecha,
                                                                                 LocalTime horaInicio,
                                                                                 LocalTime horaFin);
}
