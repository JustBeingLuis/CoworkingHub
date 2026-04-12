package com.coworking.reservas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UsuarioAdminCreateRequest {

    @NotBlank(message = "El nombre es obligatorio.")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres.")
    private String nombre;

    @NotBlank(message = "El correo es obligatorio.")
    @Email(message = "El correo no tiene un formato valido.")
    @Size(max = 150, message = "El correo no puede superar los 150 caracteres.")
    private String correo;

    @NotBlank(message = "La contrasena es obligatoria.")
    @Size(min = 8, message = "La contrasena debe tener minimo 8 caracteres.")
    private String password;

    @NotNull(message = "Debes indicar si el usuario esta activo.")
    private Boolean activo;

    @NotNull(message = "Debes seleccionar un rol.")
    private Long rolId;

    public UsuarioAdminCreateRequest() {
    }

    public UsuarioAdminCreateRequest(String nombre, String correo, String password, Boolean activo, Long rolId) {
        this.nombre = nombre;
        this.correo = correo;
        this.password = password;
        this.activo = activo;
        this.rolId = rolId;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Long getRolId() {
        return rolId;
    }

    public void setRolId(Long rolId) {
        this.rolId = rolId;
    }
}
