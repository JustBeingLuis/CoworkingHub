package com.coworking.reservas.controller;

import com.coworking.reservas.dto.EspacioRequest;
import com.coworking.reservas.dto.EspacioResponse;
import com.coworking.reservas.service.EspacioService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/espacios")
public class EspacioController {

    private final EspacioService espacioService;

    public EspacioController(EspacioService espacioService) {
        this.espacioService = espacioService;
    }

    @GetMapping
    public List<EspacioResponse> getAll() {
        return espacioService.findAll();
    }

    @GetMapping("/{id}")
    public EspacioResponse getById(@PathVariable Long id) {
        return espacioService.findById(id);
    }

    @PostMapping
    public ResponseEntity<EspacioResponse> create(@Valid @RequestBody EspacioRequest request) {
        EspacioResponse response = espacioService.create(request);
        return ResponseEntity.created(URI.create("/api/espacios/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public EspacioResponse update(@PathVariable Long id, @Valid @RequestBody EspacioRequest request) {
        return espacioService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        espacioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

