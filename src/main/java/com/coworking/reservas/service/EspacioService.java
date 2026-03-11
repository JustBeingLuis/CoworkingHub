package com.coworking.reservas.service;

import com.coworking.reservas.domain.Espacio;
import com.coworking.reservas.dto.EspacioRequest;
import com.coworking.reservas.dto.EspacioResponse;
import com.coworking.reservas.exception.ResourceNotFoundException;
import com.coworking.reservas.repository.EspacioRepository;
import com.coworking.reservas.repository.TipoEspacioRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EspacioService {

    private final EspacioRepository espacioRepository;
    private final TipoEspacioRepository tipoEspacioRepository;

    public EspacioService(EspacioRepository espacioRepository, TipoEspacioRepository tipoEspacioRepository) {
        this.espacioRepository = espacioRepository;
        this.tipoEspacioRepository = tipoEspacioRepository;
    }

    @Transactional(readOnly = true)
    public List<EspacioResponse> findAll() {
        return espacioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EspacioResponse findById(Long id) {
        return toResponse(getEspacio(id));
    }

    @Transactional
    public EspacioResponse create(EspacioRequest request) {
        Espacio espacio = new Espacio();
        applyRequest(request, espacio);
        return toResponse(espacioRepository.save(espacio));
    }

    @Transactional
    public EspacioResponse update(Long id, EspacioRequest request) {
        Espacio espacio = getEspacio(id);
        applyRequest(request, espacio);
        return toResponse(espacioRepository.save(espacio));
    }

    @Transactional
    public void delete(Long id) {
        Espacio espacio = getEspacio(id);
        espacioRepository.delete(espacio);
    }

    private Espacio getEspacio(Long id) {
        return espacioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Espacio with id " + id + " was not found"));
    }

    private void applyRequest(EspacioRequest request, Espacio espacio) {
        if (!tipoEspacioRepository.existsById(request.getTipoId())) {
            throw new ResourceNotFoundException("TipoEspacio with id " + request.getTipoId() + " was not found");
        }

        espacio.setNombre(request.getNombre());
        espacio.setTipoId(request.getTipoId());
        espacio.setCapacidad(request.getCapacidad());
        espacio.setPrecioPorHora(request.getPrecioPorHora());
        espacio.setActivo(request.getActivo());
    }

    private EspacioResponse toResponse(Espacio espacio) {
        return new EspacioResponse(
                espacio.getId(),
                espacio.getNombre(),
                espacio.getTipoId(),
                espacio.getCapacidad(),
                espacio.getPrecioPorHora(),
                espacio.getActivo()
        );
    }
}
