package com.coworking.reservas.controller;

import java.util.List;

import com.coworking.reservas.dto.EspacioReporteOptionResponse;
import com.coworking.reservas.dto.EstadoReservaOptionResponse;
import com.coworking.reservas.dto.ReservaAdminListadoResponse;
import com.coworking.reservas.dto.ReservaAdminRequest;
import com.coworking.reservas.dto.ReservaAdminResponse;
import com.coworking.reservas.dto.UsuarioReservaOptionResponse;
import com.coworking.reservas.service.IReservaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reservas")
public class AdminReservaController {

    @Autowired
    private IReservaService reservaService;

    @GetMapping
    public ResponseEntity<ReservaAdminListadoResponse> consultarTodasLasReservas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        ReservaAdminListadoResponse reservas = reservaService.consultarTodasLasReservas(page, size);
        return new ResponseEntity<>(reservas, HttpStatus.OK);
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioReservaOptionResponse>> consultarUsuariosParaReservas() {
        List<UsuarioReservaOptionResponse> usuarios = reservaService.consultarUsuariosParaReservasAdministracion();
        return new ResponseEntity<>(usuarios, HttpStatus.OK);
    }

    @GetMapping("/espacios")
    public ResponseEntity<List<EspacioReporteOptionResponse>> consultarEspaciosParaReservas() {
        List<EspacioReporteOptionResponse> espacios = reservaService.consultarEspaciosParaReservasAdministracion();
        return new ResponseEntity<>(espacios, HttpStatus.OK);
    }

    @GetMapping("/estados")
    public ResponseEntity<List<EstadoReservaOptionResponse>> consultarEstadosParaReservas() {
        List<EstadoReservaOptionResponse> estados = reservaService.consultarEstadosParaReservasAdministracion();
        return new ResponseEntity<>(estados, HttpStatus.OK);
    }

    @GetMapping("/{reservaId}")
    public ResponseEntity<ReservaAdminResponse> consultarReserva(@PathVariable Long reservaId) {
        ReservaAdminResponse reserva = reservaService.buscarReservaParaAdministracion(reservaId);
        return new ResponseEntity<>(reserva, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ReservaAdminResponse> crearReserva(@Valid @RequestBody ReservaAdminRequest request) {
        ReservaAdminResponse reserva = reservaService.crearReservaComoAdministrador(request);
        return new ResponseEntity<>(reserva, HttpStatus.CREATED);
    }

    @PutMapping("/{reservaId}")
    public ResponseEntity<ReservaAdminResponse> actualizarReserva(@PathVariable Long reservaId,
                                                                  @Valid @RequestBody ReservaAdminRequest request) {
        ReservaAdminResponse reserva = reservaService.actualizarReservaComoAdministrador(reservaId, request);
        return new ResponseEntity<>(reserva, HttpStatus.OK);
    }

    @PatchMapping("/{reservaId}/cancelar")
    public ResponseEntity<ReservaAdminResponse> cancelarReserva(@PathVariable Long reservaId) {
        ReservaAdminResponse reserva = reservaService.cancelarReservaComoAdministrador(reservaId);
        return new ResponseEntity<>(reserva, HttpStatus.OK);
    }

    @DeleteMapping("/{reservaId}")
    public ResponseEntity<Void> eliminarReserva(@PathVariable Long reservaId) {
        reservaService.eliminarReservaComoAdministrador(reservaId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
