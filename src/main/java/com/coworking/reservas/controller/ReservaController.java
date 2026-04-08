package com.coworking.reservas.controller;

import com.coworking.reservas.config.UsuarioDetails;
import com.coworking.reservas.dto.ReservaCreateRequest;
import com.coworking.reservas.dto.ReservaResponse;
import com.coworking.reservas.service.IReservaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    @Autowired
    private IReservaService reservaService;

    @PostMapping
    public ResponseEntity<ReservaResponse> crearReserva(@AuthenticationPrincipal UsuarioDetails usuarioDetails,
                                                        @Valid @RequestBody ReservaCreateRequest request) {
        ReservaResponse reservaResponse = reservaService.crearReserva(usuarioDetails.getId(), request);
        return new ResponseEntity<>(reservaResponse, HttpStatus.CREATED);
    }
}
