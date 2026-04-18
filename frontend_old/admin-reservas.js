const adminReservasLogoutButton = document.getElementById("admin-reservas-logout-button");
const adminReservasSessionSummary = document.getElementById("admin-reservas-session-summary");
const adminReservasMessage = document.getElementById("admin-reservas-message");
const adminReservasSummary = document.getElementById("admin-reservas-summary");
const adminReservasGrid = document.getElementById("admin-reservas-grid");
const adminReservasPagination = document.getElementById("admin-reservas-pagination");
const adminReservationForm = document.getElementById("admin-reservation-form");
const adminReservationFormTitle = document.getElementById("admin-reservation-form-title");
const adminReservationUser = document.getElementById("admin-reservation-user");
const adminReservationSpace = document.getElementById("admin-reservation-space");
const adminReservationDate = document.getElementById("admin-reservation-date");
const adminReservationStartTime = document.getElementById("admin-reservation-start-time");
const adminReservationEndTime = document.getElementById("admin-reservation-end-time");
const adminReservationStatus = document.getElementById("admin-reservation-status");
const adminReservationSubmit = document.getElementById("admin-reservation-submit");
const adminReservationReset = document.getElementById("admin-reservation-reset");
const adminReservationFormMessage = document.getElementById("admin-reservation-form-message");

const TOKEN_KEY = "coworking_access_token";
const LOGIN_URL = "/index.html";
const DASHBOARD_URL = "/dashboard.html";
const ADMIN_RESERVAS_PAGE_SIZE = 6;

let currentAdminReservasPage = 0;
let currentEditingReservationId = null;

adminReservasLogoutButton.addEventListener("click", () => {
    clearSession();
    window.location.assign(LOGIN_URL);
});

adminReservationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveReservationAsAdmin();
});

adminReservationReset.addEventListener("click", () => {
    resetAdminReservationForm();
});

adminReservasGrid.addEventListener("click", async (event) => {
    const cancelButton = event.target.closest("[data-cancel-reservation-id]");
    const editButton = event.target.closest("[data-edit-reservation-id]");
    const deleteButton = event.target.closest("[data-delete-reservation-id]");

    if (editButton) {
        const reservationId = Number(editButton.dataset.editReservationId);

        if (Number.isInteger(reservationId)) {
            await loadReservationIntoForm(reservationId);
        }
        return;
    }

    if (deleteButton && !deleteButton.disabled) {
        const reservationId = Number(deleteButton.dataset.deleteReservationId);

        if (Number.isInteger(reservationId)) {
            await deleteReservationAsAdmin(reservationId, deleteButton);
        }
        return;
    }

    if (!cancelButton || cancelButton.disabled) {
        return;
    }

    const reservationId = Number(cancelButton.dataset.cancelReservationId);

    if (Number.isInteger(reservationId)) {
        await cancelReservationAsAdmin(reservationId, cancelButton);
    }
});

adminReservasPagination.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-page-target]");

    if (!button || button.disabled) {
        return;
    }

    const targetPage = Number(button.dataset.pageTarget);

    if (!Number.isInteger(targetPage) || targetPage < 0 || targetPage === currentAdminReservasPage) {
        return;
    }

    await loadAdminReservas(targetPage, false);
});

hydrateAdminReservasView();

async function hydrateAdminReservasView() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.replace(LOGIN_URL);
        return;
    }

    const perfilValido = await loadSessionAndAuthorize();

    if (!perfilValido) {
        return;
    }

    await loadReservationOptions();
    await loadAdminReservas(currentAdminReservasPage, false);
}

async function loadSessionAndAuthorize() {
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
                clearSession();
                window.location.replace(LOGIN_URL);
            }
            return false;
        }

        if (String(data.rol || "").toUpperCase() !== "ADMIN") {
            window.location.replace(DASHBOARD_URL);
            return false;
        }

        adminReservasSessionSummary.innerHTML = `
            <strong>${escapeHtml(data.nombre || "")}</strong>
            <span>Correo: ${escapeHtml(data.correo || "")}</span>
            <span>Rol: ${escapeHtml(data.rol || "")}</span>
        `;
        return true;
    } catch (error) {
        adminReservasSessionSummary.innerHTML = `
            <strong>No fue posible cargar tu sesion</strong>
            <span>Verifica la conexion con el backend e intenta nuevamente.</span>
        `;
        return false;
    }
}

async function loadReservationOptions() {
    const token = localStorage.getItem(TOKEN_KEY);

    try {
        const [usersResponse, spacesResponse, statesResponse] = await Promise.all([
            fetch("/api/admin/reservas/usuarios", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch("/api/admin/reservas/espacios", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch("/api/admin/reservas/estados", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        const users = await usersResponse.json().catch(() => ([]));
        const spaces = await spacesResponse.json().catch(() => ([]));
        const states = await statesResponse.json().catch(() => ([]));

        if (!usersResponse.ok || !spacesResponse.ok || !statesResponse.ok) {
            if ([usersResponse.status, spacesResponse.status, statesResponse.status].includes(401)
                    || [usersResponse.status, spacesResponse.status, statesResponse.status].includes(403)) {
                clearSession();
                window.location.replace(
                    [usersResponse.status, spacesResponse.status, statesResponse.status].includes(403)
                        ? DASHBOARD_URL
                        : LOGIN_URL
                );
                return;
            }

            showMessage(adminReservationFormMessage, "No fue posible cargar las opciones del formulario.", "error");
            return;
        }

        adminReservationUser.innerHTML = `
            <option value="">Selecciona un usuario</option>
            ${users.map((user) => `
                <option value="${user.id}">
                    ${escapeHtml(user.nombre || "")} - ${escapeHtml(user.correo || "")}${user.activo ? "" : " (inactivo)"}
                </option>
            `).join("")}
        `;

        adminReservationSpace.innerHTML = `
            <option value="">Selecciona un espacio</option>
            ${spaces.map((space) => `
                <option value="${space.id}">
                    ${escapeHtml(space.nombre || "")} - ${escapeHtml(space.tipoNombre || "Tipo")}${space.activo ? "" : " (inactivo)"}
                </option>
            `).join("")}
        `;

        adminReservationStatus.innerHTML = `
            <option value="">Selecciona un estado</option>
            ${states.map((state) => `
                <option value="${state.id}">${escapeHtml(formatStatusLabel(state.nombre || ""))}</option>
            `).join("")}
        `;
    } catch (error) {
        showMessage(adminReservationFormMessage, "No fue posible conectar con el backend.", "error");
    }
}

async function loadAdminReservas(page = currentAdminReservasPage, showFeedback = true) {
    const token = localStorage.getItem(TOKEN_KEY);

    try {
        const params = new URLSearchParams({
            page: String(page),
            size: String(ADMIN_RESERVAS_PAGE_SIZE)
        });

        const response = await fetch(`/api/admin/reservas?${params.toString()}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSession();
                window.location.replace(response.status === 403 ? DASHBOARD_URL : LOGIN_URL);
                return;
            }

            showMessage(adminReservasMessage, data.message || "No fue posible consultar las reservas.", "error");
            return;
        }

        if (page > 0 && (!data.pagina?.content || data.pagina.content.length === 0) && Number(data.pagina?.totalElements || 0) > 0) {
            await loadAdminReservas(page - 1, false);
            return;
        }

        currentAdminReservasPage = data.pagina?.pageNumber ?? page;
        renderReservasSummary(data.resumen || {});
        renderReservasGrid(Array.isArray(data.pagina?.content) ? data.pagina.content : []);
        renderPagination(adminReservasPagination, data.pagina || buildEmptyPageData(page, ADMIN_RESERVAS_PAGE_SIZE), "reservas");

        if (showFeedback) {
            const total = Number(data.resumen?.totalReservas || data.pagina?.totalElements || 0);
            const current = Number(data.pagina?.numberOfElements || 0);
            const message = total > 0
                ? `Mostrando ${current} reserva(s) de ${total}.`
                : "Todavia no hay reservas registradas en el sistema.";
            showMessage(adminReservasMessage, message, total > 0 ? "success" : "");
        } else {
            showMessage(adminReservasMessage, "", "");
        }
    } catch (error) {
        showMessage(adminReservasMessage, "No fue posible conectar con el backend.", "error");
    }
}

function renderReservasSummary(resumen) {
    adminReservasSummary.innerHTML = `
        <article class="summary-card">
            <span>Total de reservas</span>
            <strong>${Number(resumen.totalReservas || 0)}</strong>
        </article>
        <article class="summary-card">
            <span>Reservas activas</span>
            <strong>${Number(resumen.reservasActivas || 0)}</strong>
        </article>
        <article class="summary-card">
            <span>Reservas canceladas</span>
            <strong>${Number(resumen.reservasCanceladas || 0)}</strong>
        </article>
    `;
}

function renderReservasGrid(reservas) {
    if (!reservas || reservas.length === 0) {
        adminReservasGrid.innerHTML = `
            <article class="empty-state">
                <h3>No hay reservas registradas</h3>
                <p>Cuando los usuarios creen reservas, apareceran aqui para administracion.</p>
            </article>
        `;
        return;
    }

    adminReservasGrid.innerHTML = reservas.map((reserva) => {
        const estado = (reserva.estado || "").toUpperCase();
        const badgeClass = getReservationBadgeClass(estado);

        return `
            <article class="reservation-card">
                <div class="reservation-card-header">
                    <div>
                        <h3>${escapeHtml(reserva.nombreEspacio || "")}</h3>
                        <p class="reservation-subtitle">${escapeHtml(reserva.tipoEspacio || "Espacio")}</p>
                    </div>
                    <span class="space-badge ${badgeClass}">${escapeHtml(estado || "RESERVA")}</span>
                </div>

                <p class="reservation-note">
                    <strong>${escapeHtml(reserva.usuarioNombre || "")}</strong>
                    <span class="reservation-note-inline">${escapeHtml(reserva.usuarioCorreo || "")}</span>
                </p>

                <div class="reservation-meta reservation-meta--admin">
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
                    <div class="space-meta-item">
                        <span>Reserva</span>
                        <strong>#${reserva.id}</strong>
                    </div>
                </div>

                <div class="reservation-actions reservation-actions--admin">
                    <button
                        type="button"
                        class="secondary-button reservation-cancel-button"
                        data-edit-reservation-id="${reserva.id}"
                    >
                        Editar
                    </button>
                    ${estado === "CONFIRMADA" ? `
                        <button
                            type="button"
                            class="secondary-button reservation-cancel-button"
                            data-cancel-reservation-id="${reserva.id}"
                        >
                            Cancelar
                        </button>
                    ` : ""}
                    <button
                        type="button"
                        class="secondary-button reservation-cancel-button"
                        data-delete-reservation-id="${reserva.id}"
                    >
                        Eliminar
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

async function loadReservationIntoForm(reservationId) {
    const token = localStorage.getItem(TOKEN_KEY);
    toggleLoading(adminReservationSubmit, true, "Cargando...");

    try {
        const response = await fetch(`/api/admin/reservas/${reservationId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSession();
                window.location.replace(response.status === 403 ? DASHBOARD_URL : LOGIN_URL);
                return;
            }

            showMessage(adminReservationFormMessage, data.message || "No fue posible cargar la reserva.", "error");
            return;
        }

        currentEditingReservationId = data.id;
        adminReservationFormTitle.textContent = `Editar reserva #${data.id}`;
        adminReservationUser.value = data.usuarioId || "";
        adminReservationSpace.value = data.espacioId || "";
        adminReservationStatus.value = data.estadoId || "";
        adminReservationDate.value = data.fecha || "";
        adminReservationStartTime.value = formatTime(data.horaInicio);
        adminReservationEndTime.value = formatTime(data.horaFin);
        adminReservationSubmit.textContent = "Guardar cambios";
        adminReservationSubmit.dataset.defaultText = "Guardar cambios";

        showMessage(adminReservationFormMessage, `Editando la reserva #${data.id}.`, "success");
        adminReservationUser.focus();
    } catch (error) {
        showMessage(adminReservationFormMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(adminReservationSubmit, false);
    }
}

async function saveReservationAsAdmin() {
    const token = localStorage.getItem(TOKEN_KEY);
    const isEditing = Number.isInteger(currentEditingReservationId);
    const payload = buildReservationPayload();

    if (!payload) {
        return;
    }

    const url = isEditing ? `/api/admin/reservas/${currentEditingReservationId}` : "/api/admin/reservas";
    const method = isEditing ? "PUT" : "POST";

    toggleLoading(adminReservationSubmit, true, isEditing ? "Guardando..." : "Creando...");

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSession();
                window.location.replace(response.status === 403 ? DASHBOARD_URL : LOGIN_URL);
                return;
            }

            showMessage(adminReservationFormMessage, data.message || "No fue posible guardar la reserva.", "error");
            return;
        }

        await loadAdminReservas(currentAdminReservasPage, false);
        if (isEditing) {
            await loadReservationIntoForm(data.id);
        } else {
            resetAdminReservationForm(false);
        }

        showMessage(
            adminReservasMessage,
            isEditing
                ? `La reserva #${data.id} fue actualizada correctamente.`
                : `La reserva #${data.id} fue creada correctamente.`,
            "success"
        );
    } catch (error) {
        showMessage(adminReservationFormMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(adminReservationSubmit, false);
    }
}

async function cancelReservationAsAdmin(reservationId, button) {
    if (!window.confirm("Esta reserva se cancelara inmediatamente. Deseas continuar?")) {
        return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    toggleLoading(button, true, "Cancelando...");

    try {
        const response = await fetch(`/api/admin/reservas/${reservationId}/cancelar`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSession();
                window.location.replace(response.status === 403 ? DASHBOARD_URL : LOGIN_URL);
                return;
            }

            showMessage(adminReservasMessage, data.message || "No fue posible cancelar la reserva.", "error");
            return;
        }

        await loadAdminReservas(currentAdminReservasPage, false);
        showMessage(
            adminReservasMessage,
            `La reserva #${data.id} fue cancelada correctamente.`,
            "success"
        );
    } catch (error) {
        showMessage(adminReservasMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(button, false);
    }
}

async function deleteReservationAsAdmin(reservationId, button) {
    if (!window.confirm("Esta reserva se eliminara definitivamente del sistema. Deseas continuar?")) {
        return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    toggleLoading(button, true, "Eliminando...");

    try {
        const response = await fetch(`/api/admin/reservas/${reservationId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));

            if (response.status === 401 || response.status === 403) {
                clearSession();
                window.location.replace(response.status === 403 ? DASHBOARD_URL : LOGIN_URL);
                return;
            }

            showMessage(adminReservasMessage, data.message || "No fue posible eliminar la reserva.", "error");
            return;
        }

        if (currentEditingReservationId === reservationId) {
            resetAdminReservationForm(false);
        }

        await loadAdminReservas(currentAdminReservasPage, false);
        showMessage(adminReservasMessage, `La reserva #${reservationId} fue eliminada correctamente.`, "success");
    } catch (error) {
        showMessage(adminReservasMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(button, false);
    }
}

function buildReservationPayload() {
    const usuarioId = Number(adminReservationUser.value);
    const espacioId = Number(adminReservationSpace.value);
    const estadoId = Number(adminReservationStatus.value);
    const fecha = adminReservationDate.value;
    const horaInicio = adminReservationStartTime.value;
    const horaFin = adminReservationEndTime.value;

    if (!Number.isInteger(usuarioId) || usuarioId < 1) {
        showMessage(adminReservationFormMessage, "Debes seleccionar un usuario valido.", "error");
        return null;
    }

    if (!Number.isInteger(espacioId) || espacioId < 1) {
        showMessage(adminReservationFormMessage, "Debes seleccionar un espacio valido.", "error");
        return null;
    }

    if (!Number.isInteger(estadoId) || estadoId < 1) {
        showMessage(adminReservationFormMessage, "Debes seleccionar un estado valido.", "error");
        return null;
    }

    if (!fecha) {
        showMessage(adminReservationFormMessage, "Debes indicar la fecha de la reserva.", "error");
        return null;
    }

    if (!horaInicio || !horaFin) {
        showMessage(adminReservationFormMessage, "Debes indicar la hora de inicio y la hora de fin.", "error");
        return null;
    }

    if (horaInicio >= horaFin) {
        showMessage(adminReservationFormMessage, "La hora de inicio debe ser anterior a la hora de fin.", "error");
        return null;
    }

    return {
        usuarioId,
        espacioId,
        estadoId,
        fecha,
        horaInicio,
        horaFin
    };
}

function renderPagination(target, pageData, itemLabel) {
    const totalPages = Math.max(Number(pageData.totalPages || 0), 1);
    const currentPage = Number(pageData.pageNumber || 0) + 1;
    const hasItems = Number(pageData.totalElements || 0) > 0;

    if (!hasItems) {
        target.innerHTML = "";
        return;
    }

    target.innerHTML = `
        <div class="pagination-info">
            <strong>Pagina ${currentPage} de ${totalPages}</strong>
            <span>${pageData.totalElements} ${itemLabel} en total</span>
        </div>
        <div class="pagination-actions">
            <button
                type="button"
                class="secondary-button pagination-button"
                data-page-target="${Math.max(currentPage - 2, 0)}"
                ${pageData.first ? "disabled" : ""}
            >
                Anterior
            </button>
            <button
                type="button"
                class="secondary-button pagination-button"
                data-page-target="${currentPage}"
                ${pageData.last ? "disabled" : ""}
            >
                Siguiente
            </button>
        </div>
    `;
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

function buildEmptyPageData(pageNumber, pageSize) {
    return {
        content: [],
        pageNumber,
        pageSize,
        totalElements: 0,
        totalPages: 0,
        numberOfElements: 0,
        first: true,
        last: true
    };
}

function resetAdminReservationForm(clearMessage = true) {
    currentEditingReservationId = null;
    adminReservationFormTitle.textContent = "Nueva reserva";
    adminReservationForm.reset();
    adminReservationSubmit.textContent = "Crear reserva";
    adminReservationSubmit.dataset.defaultText = "Crear reserva";

    if (clearMessage) {
        showMessage(adminReservationFormMessage, "", "");
    }
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
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

function formatStatusLabel(value) {
    const normalized = String(value || "").toUpperCase();

    if (normalized === "CONFIRMADA") {
        return "Confirmada";
    }

    if (normalized === "CANCELADA") {
        return "Cancelada";
    }

    if (normalized === "FINALIZADA") {
        return "Finalizada";
    }

    return value;
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
