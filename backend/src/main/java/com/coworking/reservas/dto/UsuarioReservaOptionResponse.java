package com.coworking.reservas.dto;

public class UsuarioReservaOptionResponse {

    private Long id;
    private String nombre;
    private String correo;
    private Boolean activo;
    private String rolNombre;

    public UsuarioReservaOptionResponse() {
    }

    public UsuarioReservaOptionResponse(Long id, String nombre, String correo, Boolean activo, String rolNombre) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.activo = activo;
        this.rolNombre = rolNombre;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public String getRolNombre() {
        return rolNombre;
    }

    public void setRolNombre(String rolNombre) {
        this.rolNombre = rolNombre;
    }
}
