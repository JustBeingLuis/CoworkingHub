const registroForm = document.getElementById("registro-form");
const loginForm = document.getElementById("login-form");
const registroButton = document.getElementById("submit-button");
const loginButton = document.getElementById("login-button");
const perfilButton = document.getElementById("perfil-button");
const logoutButton = document.getElementById("logout-button");
const registroMessage = document.getElementById("registro-message");
const loginMessage = document.getElementById("login-message");
const perfilMessage = document.getElementById("perfil-message");
const sessionSummary = document.getElementById("session-summary");

const TOKEN_KEY = "coworking_access_token";

registroForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correoRegistro").value.trim().toLowerCase();
    const password = document.getElementById("passwordRegistro").value;
    const confirmacionPassword = document.getElementById("confirmacionPassword").value;

    if (!nombre || !correo || !password || !confirmacionPassword) {
        showMessage(registroMessage, "Todos los campos del registro son obligatorios.", "error");
        return;
    }

    if (password.length < 8) {
        showMessage(registroMessage, "La contrasena debe tener minimo 8 caracteres.", "error");
        return;
    }

    if (password !== confirmacionPassword) {
        showMessage(registroMessage, "La confirmacion de la contrasena no coincide.", "error");
        return;
    }

    toggleLoading(registroButton, true, "Creando cuenta...");

    try {
        const response = await fetch("/api/usuarios/registro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nombre, correo, password })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            showMessage(registroMessage, data.message || "No fue posible crear la cuenta.", "error");
            return;
        }

        registroForm.reset();
        document.getElementById("correoLogin").value = data.correo;
        showMessage(registroMessage, `Cuenta creada para ${data.nombre}. Ya puedes iniciar sesion.`, "success");
    } catch (error) {
        showMessage(registroMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(registroButton, false);
    }
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const correo = document.getElementById("correoLogin").value.trim().toLowerCase();
    const password = document.getElementById("passwordLogin").value;

    if (!correo || !password) {
        showMessage(loginMessage, "Debes completar correo y contrasena.", "error");
        return;
    }

    toggleLoading(loginButton, true, "Ingresando...");

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ correo, password })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            showMessage(loginMessage, data.message || "No fue posible iniciar sesion.", "error");
            return;
        }

        localStorage.setItem(TOKEN_KEY, data.accessToken);
        loginForm.reset();
        renderSessionSummary(data.usuario);
        showMessage(loginMessage, `Bienvenido, ${data.usuario.nombre}. Tu sesion ya esta activa.`, "success");
        showMessage(perfilMessage, "", "");
    } catch (error) {
        showMessage(loginMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(loginButton, false);
    }
});

perfilButton.addEventListener("click", async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        renderSessionSummary();
        showMessage(perfilMessage, "No hay una sesion activa en este navegador.", "error");
        return;
    }

    toggleLoading(perfilButton, true, "Actualizando...");

    try {
        const response = await fetch("/api/auth/perfil", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSession();
            }

            showMessage(perfilMessage, data.message || "No fue posible consultar la sesion actual.", "error");
            return;
        }

        renderSessionSummary(data);
        showMessage(perfilMessage, "La informacion de tu cuenta fue actualizada correctamente.", "success");
    } catch (error) {
        showMessage(perfilMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(perfilButton, false);
    }
});

logoutButton.addEventListener("click", () => {
    clearSession();
    showMessage(loginMessage, "", "");
    showMessage(registroMessage, "", "");
    showMessage(perfilMessage, "La sesion se cerro correctamente.", "success");
});

hydrateSessionState();

function hydrateSessionState() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        renderSessionSummary();
        return;
    }

    perfilButton.click();
}

function renderSessionSummary(usuario) {
    if (!usuario) {
        sessionSummary.innerHTML = `
            <strong>Sin sesion activa</strong>
            <span>Inicia sesion para acceder a tus reservas y a tu cuenta.</span>
        `;
        return;
    }

    sessionSummary.innerHTML = `
        <strong>${usuario.nombre}</strong>
        <span>Correo: ${usuario.correo}</span>
        <span>Rol: ${usuario.rol}</span>
        <span>Cuenta activa: ${usuario.activo ? "Si" : "No"}</span>
    `;
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    renderSessionSummary();
}

function showMessage(target, message, type) {
    target.textContent = message;
    target.className = type ? `form-message ${type}` : "form-message";
}

function toggleLoading(button, isLoading, loadingText) {
    if (!button.dataset.defaultText) {
        button.dataset.defaultText = button.textContent;
    }

    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : button.dataset.defaultText;
}
