package com.coworking.reservas.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.coworking.reservas.domain.Espacio;
import com.coworking.reservas.domain.Reserva;
import com.coworking.reservas.dto.EspacioCatalogSummaryResponse;
import com.coworking.reservas.dto.EspacioCatalogoResponse;
import com.coworking.reservas.dto.EspacioDisponibleResponse;
import com.coworking.reservas.dto.EspacioDisponibilidadDetalleResponse;
import com.coworking.reservas.dto.HorarioOcupadoResponse;
import com.coworking.reservas.dto.PageResponse;
import com.coworking.reservas.exception.ResourceNotFoundException;
import com.coworking.reservas.repository.EspacioRepository;
import com.coworking.reservas.repository.ReservaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EspacioService implements IEspacioService {

    private static final int MAX_PAGE_SIZE = 24;

    @Autowired
    private EspacioRepository espacioRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Override
    public EspacioCatalogoResponse consultarEspaciosDisponibles(int page, int size) {
        validarPaginacion(page, size);

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.asc("tipo.nombre"),
                        Sort.Order.asc("nombre")
                )
        );

        Page<EspacioDisponibleResponse> espacios = espacioRepository.findByActivoTrue(pageable)
                .map(this::mapToResponse);

        EspacioCatalogSummaryResponse resumen = new EspacioCatalogSummaryResponse(
                espacios.getTotalElements(),
                espacioRepository.sumCapacidadByActivoTrue(),
                espacioRepository.countTiposDisponiblesActivos()
        );

        return new EspacioCatalogoResponse(PageResponse.from(espacios), resumen);
    }

    @Override
    public EspacioDisponibilidadDetalleResponse consultarDisponibilidadPorFechaYHorario(Long espacioId, LocalDate fecha,
                                                                                        LocalTime horaInicio,
                                                                                        LocalTime horaFin) {
        validarConsultaDisponibilidad(fecha, horaInicio, horaFin);

        Espacio espacio = espacioRepository.findByIdAndActivoTrue(espacioId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro un espacio activo con el id " + espacioId
                ));

        List<Reserva> reservas = reservaRepository.findHorariosOcupadosByEspacioAndFecha(espacioId, fecha);
        Boolean rangoDisponible = null;
        String mensajeDisponibilidad;

        if (horaInicio != null && horaFin != null) {
            rangoDisponible = reservas.stream()
                    .noneMatch(reserva -> haySolapamiento(horaInicio, horaFin,
                            reserva.getHoraInicio(), reserva.getHoraFin()));

            mensajeDisponibilidad = rangoDisponible
                    ? "El rango horario consultado esta disponible para este espacio."
                    : "El rango horario consultado entra en conflicto con una reserva existente.";
        } else if (reservas.isEmpty()) {
            mensajeDisponibilidad = "No hay horarios ocupados para la fecha consultada.";
        } else {
            mensajeDisponibilidad = "Estos son los horarios ocupados para la fecha consultada.";
        }

        List<HorarioOcupadoResponse> horariosOcupados = reservas.stream()
                .map(this::mapHorarioOcupado)
                .toList();

        return new EspacioDisponibilidadDetalleResponse(
                espacio.getId(),
                espacio.getNombre(),
                espacio.getTipo().getNombre(),
                espacio.getTipo().getDescripcion(),
                espacio.getCapacidad(),
                espacio.getPrecioPorHora(),
                fecha,
                horaInicio,
                horaFin,
                rangoDisponible,
                mensajeDisponibilidad,
                horariosOcupados.size(),
                horariosOcupados
        );
    }

    private EspacioDisponibleResponse mapToResponse(Espacio espacio) {
        return new EspacioDisponibleResponse(
                espacio.getId(),
                espacio.getNombre(),
                espacio.getTipo().getNombre(),
                espacio.getTipo().getDescripcion(),
                espacio.getCapacidad(),
                espacio.getPrecioPorHora()
        );
    }

    private HorarioOcupadoResponse mapHorarioOcupado(Reserva reserva) {
        return new HorarioOcupadoResponse(
                reserva.getHoraInicio(),
                reserva.getHoraFin(),
                reserva.getEstado().getNombre()
        );
    }

    private void validarConsultaDisponibilidad(LocalDate fecha, LocalTime horaInicio, LocalTime horaFin) {
        if (fecha == null) {
            throw new IllegalArgumentException("Debes indicar una fecha para consultar la disponibilidad.");
        }

        if ((horaInicio == null && horaFin != null) || (horaInicio != null && horaFin == null)) {
            throw new IllegalArgumentException("Debes indicar la hora de inicio y la hora de fin juntas.");
        }

        if (horaInicio != null && !horaInicio.isBefore(horaFin)) {
            throw new IllegalArgumentException("La hora de inicio debe ser anterior a la hora de fin.");
        }
    }

    private void validarPaginacion(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("El numero de pagina no puede ser negativo.");
        }

        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException("El tamano de pagina debe estar entre 1 y " + MAX_PAGE_SIZE + ".");
        }
    }

    private boolean haySolapamiento(LocalTime inicioConsultado, LocalTime finConsultado,
                                    LocalTime inicioReservado, LocalTime finReservado) {
        return inicioConsultado.isBefore(finReservado) && finConsultado.isAfter(inicioReservado);
    }
}
