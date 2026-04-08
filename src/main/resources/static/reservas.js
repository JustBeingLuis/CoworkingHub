const logoutButton = document.getElementById("reservas-logout-button");
const reservasMessage = document.getElementById("reservas-message");
const sessionSummary = document.getElementById("reservas-session-summary");
const reservasSummary = document.getElementById("reservas-summary");
const reservasGrid = document.getElementById("reservas-grid");

const TOKEN_KEY = "coworking_access_token";
const LOGIN_URL = "/index.html";

logoutButton.addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.assign(LOGIN_URL);
});

reservasGrid.addEventListener("click", async (event) => {
    const cancelButton = event.target.closest("[data-reserva-id]");

    if (!cancelButton || cancelButton.disabled) {
        return;
    }

    const reservaId = Number(cancelButton.dataset.reservaId);

    if (!Number.isInteger(reservaId)) {
        return;
    }

    await cancelarReserva(reservaId, cancelButton);
});

hydrateReservasView();

async function hydrateReservasView() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.replace(LOGIN_URL);
        return;
    }

    await Promise.all([loadPerfil(), loadReservas(false)]);
}

async function loadPerfil() {
    const token = localStorage.getItem(TOKEN_KEY);

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
                localStorage.removeItem(TOKEN_KEY);
                window.location.replace(LOGIN_URL);
            }
            return;
        }

        sessionSummary.innerHTML = `
            <strong>${escapeHtml(data.nombre || "")}</strong>
            <span>Correo: ${escapeHtml(data.correo || "")}</span>
            <span>Rol: ${escapeHtml(data.rol || "")}</span>
        `;
    } catch (error) {
        sessionSummary.innerHTML = `
            <strong>No fue posible cargar tu sesion</strong>
            <span>Verifica la conexion con el backend e intenta nuevamente.</span>
        `;
    }
}

async function loadReservas(showFeedback = true) {
    const token = localStorage.getItem(TOKEN_KEY);

    try {
        const response = await fetch("/api/reservas/mias", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ([]));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem(TOKEN_KEY);
                window.location.replace(LOGIN_URL);
                return;
            }

            showMessage(reservasMessage, data.message || "No fue posible consultar tus reservas.", "error");
            return;
        }

        renderReservasSummary(data);
        renderReservasGrid(data);

        if (showFeedback) {
            if (data.length > 0) {
                showMessage(reservasMessage, `Se cargaron ${data.length} reservas asociadas a tu cuenta.`, "success");
            } else {
                showMessage(reservasMessage, "Todavia no tienes reservas registradas.", "");
            }
        } else {
            showMessage(reservasMessage, "", "");
        }
    } catch (error) {
        showMessage(reservasMessage, "No fue posible conectar con el backend.", "error");
    }
}

async function cancelarReserva(reservaId, button) {
    const token = localStorage.getItem(TOKEN_KEY);
    toggleLoading(button, true, "Cancelando...");

    try {
        const response = await fetch(`/api/reservas/${reservaId}/cancelar`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem(TOKEN_KEY);
                window.location.replace(LOGIN_URL);
                return;
            }

            showMessage(reservasMessage, data.message || "No fue posible cancelar la reserva.", "error");
            return;
        }

        await loadReservas(false);
        showMessage(
            reservasMessage,
            `La reserva de ${data.nombreEspacio || "tu espacio"} para el ${formatDate(data.fecha)} fue cancelada correctamente.`,
            "success"
        );
    } catch (error) {
        showMessage(reservasMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(button, false);
    }
}

function renderReservasSummary(reservas) {
    const activas = reservas.filter((reserva) => !["CANCELADA", "FINALIZADA"].includes((reserva.estado || "").toUpperCase()));
    const cancelables = reservas.filter((reserva) => reserva.puedeCancelarse).length;

    reservasSummary.innerHTML = `
        <article class="summary-card">
            <span>Total de reservas</span>
            <strong>${reservas.length}</strong>
        </article>
        <article class="summary-card">
            <span>Reservas activas</span>
            <strong>${activas.length}</strong>
        </article>
        <article class="summary-card">
            <span>Cancelables hoy</span>
            <strong>${cancelables}</strong>
        </article>
    `;
}

function renderReservasGrid(reservas) {
    if (!reservas || reservas.length === 0) {
        reservasGrid.innerHTML = `
            <article class="empty-state">
                <h3>Aun no tienes reservas</h3>
                <p>Cuando registres una reserva, aparecera aqui con su estado y horario.</p>
            </article>
        `;
        return;
    }

    reservasGrid.innerHTML = reservas.map((reserva) => {
        const estado = (reserva.estado || "").toUpperCase();
        const badgeClass = getReservationBadgeClass(estado);
        const note = reserva.puedeCancelarse
            ? "Puedes cancelarla porque aun faltan al menos 6 horas para su inicio."
            : reserva.motivoNoCancelable || "Esta reserva ya no admite cancelacion.";

        return `
            <article class="reservation-card">
                <div class="reservation-card-header">
                    <div>
                        <h3>${escapeHtml(reserva.nombreEspacio || "")}</h3>
                        <p class="reservation-subtitle">${escapeHtml(reserva.tipoEspacio || "Espacio")}</p>
                    </div>
                    <span class="space-badge ${badgeClass}">${escapeHtml(estado || "RESERVA")}</span>
                </div>

                <div class="reservation-meta">
                    <div class="space-meta-item">
                        <span>Fecha</span>
                        <strong>${formatDate(reserva.fecha)}</strong>
                    </div>
                    <div class="space-meta-item">
                        <span>Horario</span>
                        <strong>${formatTime(reserva.horaInicio)} - ${formatTime(reserva.horaFin)}</strong>
                    </div>
                    <div class="space-meta-item">
                        <span>Creada</span>
                        <strong>${formatDateTime(reserva.fechaCreacion)}</strong>
                    </div>
                </div>

                <p class="reservation-note">${escapeHtml(note)}</p>

                <div class="reservation-actions">
                    <button
                        type="button"
                        class="secondary-button reservation-cancel-button"
                        data-reserva-id="${reserva.id}"
                        ${reserva.puedeCancelarse ? "" : "disabled"}
                    >
                        ${reserva.puedeCancelarse ? "Cancelar reserva" : "No cancelable"}
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

function getReservationBadgeClass(estado) {
    if (estado === "CANCELADA") {
        return "status-badge--cancelled";
    }

    if (estado === "FINALIZADA") {
        return "status-badge--finished";
    }

    if (estado === "CONFIRMADA") {
        return "status-badge--confirmed";
    }

    return "status-badge--pending";
}

function formatDate(value) {
    if (!value) {
        return "Sin fecha";
    }

    const date = new Date(`${value}T00:00:00`);

    return new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }).format(date);
}

function formatDateTime(value) {
    if (!value) {
        return "Sin fecha";
    }

    const date = new Date(value);

    return new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

function formatTime(value) {
    return String(value || "").slice(0, 5);
}

function showMessage(target, message, type) {
    target.textContent = message;
    target.className = type ? `form-message ${type}` : "form-message";
}

function toggleLoading(button, isLoading, loadingText) {
    if (!button.dataset.defaultText) {
        button.dataset.defaultText = button.textContent.trim();
    }

    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : button.dataset.defaultText;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}
