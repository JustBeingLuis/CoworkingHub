package com.coworking.reservas.service;

import java.time.LocalDate;
import java.util.List;

import com.coworking.reservas.dto.EspacioReporteOptionResponse;
import com.coworking.reservas.dto.EstadoReservaOptionResponse;
import com.coworking.reservas.dto.ReporteOcupacionListadoResponse;
import com.coworking.reservas.dto.ReservaAdminListadoResponse;
import com.coworking.reservas.dto.ReservaAdminRequest;
import com.coworking.reservas.dto.ReservaAdminResponse;
import com.coworking.reservas.dto.ReservaCreateRequest;
import com.coworking.reservas.dto.ReservaListadoResponse;
import com.coworking.reservas.dto.ReservaResponse;
import com.coworking.reservas.dto.UsuarioReservaOptionResponse;

public interface IReservaService {

    ReservaResponse crearReserva(Long usuarioId, ReservaCreateRequest reservaCreateRequest);

    void actualizarReservasFinalizadas();

    ReservaListadoResponse consultarReservasDelUsuario(Long usuarioId, int page, int size);

    ReservaAdminListadoResponse consultarTodasLasReservas(int page, int size);

    ReservaAdminResponse buscarReservaParaAdministracion(Long reservaId);

    ReservaAdminResponse crearReservaComoAdministrador(ReservaAdminRequest reservaAdminRequest);

    ReservaAdminResponse actualizarReservaComoAdministrador(Long reservaId, ReservaAdminRequest reservaAdminRequest);

    void eliminarReservaComoAdministrador(Long reservaId);

    ReservaAdminResponse cancelarReservaComoAdministrador(Long reservaId);

    List<UsuarioReservaOptionResponse> consultarUsuariosParaReservasAdministracion();

    List<EspacioReporteOptionResponse> consultarEspaciosParaReservasAdministracion();

    List<EstadoReservaOptionResponse> consultarEstadosParaReservasAdministracion();

    ReporteOcupacionListadoResponse generarReporteOcupacion(LocalDate fechaInicio, LocalDate fechaFin, String estado,
                                                           String modo, Long espacioId, int page, int size);

    ReservaResponse cancelarReserva(Long usuarioId, Long reservaId);
}
