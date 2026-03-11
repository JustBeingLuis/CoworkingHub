package com.coworking.reservas.dto;

import java.math.BigDecimal;

public record EspacioResponse(
        Long id,
        String nombre,
        Long tipoId,
        Integer capacidad,
        BigDecimal precioPorHora,
        Boolean activo
) {
}

