package com.coworking.reservas.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;

public class ReservaAdminRequest {

    @NotNull(message = "Debes seleccionar un usuario.")
    private Long usuarioId;

    @NotNull(message = "Debes seleccionar un espacio.")
    private Long espacioId;

    @NotNull(message = "Debes seleccionar un estado.")
    private Long estadoId;

    @NotNull(message = "Debes indicar la fecha de la reserva.")
    private LocalDate fecha;

    @NotNull(message = "Debes indicar la hora de inicio.")
    private LocalTime horaInicio;

    @NotNull(message = "Debes indicar la hora de fin.")
    private LocalTime horaFin;

    public ReservaAdminRequest() {
    }

    public ReservaAdminRequest(Long usuarioId, Long espacioId, Long estadoId, LocalDate fecha,
                               LocalTime horaInicio, LocalTime horaFin) {
        this.usuarioId = usuarioId;
        this.espacioId = espacioId;
        this.estadoId = estadoId;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Long getEspacioId() {
        return espacioId;
    }

    public void setEspacioId(Long espacioId) {
        this.espacioId = espacioId;
    }

    public Long getEstadoId() {
        return estadoId;
    }

    public void setEstadoId(Long estadoId) {
        this.estadoId = estadoId;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }
}
