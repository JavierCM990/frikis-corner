document.addEventListener("DOMContentLoaded", () => {

    // ================================
    // CARGA NAV Y FOOTER COMUNES
    // ================================
    cargarComun("../seccionesComun/nav.html", "navComun");
    cargarComun("../seccionesComun/footer.html", "footerComun");

    // Esperar a que el nav esté cargado para configurarlo
    setTimeout(configurarNavUsuario, 100);

    mostrarEquipoFavorito();
});

///////////////////////////////////
//// NAV Y FOOTER COMUNES /////////
///////////////////////////////////

function cargarComun(ruta, id) {
    fetch(ruta)
        .then(res => res.text())
        .then(html => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = html;

            if (id === "footerComun") activarScrollTop();
        });
}

///////////////////////////////////
//// BOTÓN SCROLL ARRIBA //////////
///////////////////////////////////

function activarScrollTop() {
    const btn = document.getElementById("btnArriba");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        btn.style.display = window.scrollY > 300 ? "block" : "none";
    });

    btn.onclick = () =>
        window.scrollTo({ top: 0, behavior: "smooth" });
}

///////////////////////////////////
//// SESIÓN USUARIO ///////////////
///////////////////////////////////

function getUsuarioLogueado() {
    const user = localStorage.getItem("usuario");
    return user ? JSON.parse(user) : null;
}

function cerrarSesion() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("equipoFavorito"); // limpieza opcional
    window.location.href = "index.html";
}

///////////////////////////////////
//// NAVBAR DINÁMICO //////////////
///////////////////////////////////

function configurarNavUsuario() {
    const nav = document.getElementById("navUsuario");
    if (!nav) return;

    const usuario = getUsuarioLogueado();

    // USUARIO NO LOGUEADO
    if (!usuario) {
        nav.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="login.html">Iniciar sesión</a>
            </li>
        `;
        return;
    }

    // USUARIO LOGUEADO
    nav.innerHTML = `
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="menuUsuario"
               role="button" data-bs-toggle="dropdown" aria-expanded="false">
                ${usuario.nombre}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="crearCompeticion.html">Registrar competición</a></li>
                <li><a class="dropdown-item" href="registrarResultado.html">Registrar resultado</a></li>
                <li><a class="dropdown-item" href="gestorEquipos.html">Gestor de equipos</a></li>
                <li><hr class="dropdown-divider"></li>
                <li>
                    <a class="dropdown-item text-danger" href="#" onclick="cerrarSesion()">
                        Cerrar sesión
                    </a>
                </li>
            </ul>
        </li>
    `;
}

///////////////////////////////////
//// EQUIPO FAVORITO //////////////
///////////////////////////////////

async function mostrarEquipoFavorito() {
    const cont = document.getElementById("equipoFavorito");
    if (!cont) return;

    const usuario = getUsuarioLogueado();
    if (!usuario || !usuario.equipo_favorito_id) {
        cont.innerHTML = "<p>No has marcado ningún equipo favorito</p>";
        return;
    }

    try {
        const resp = await fetch(
            `../backend/api/equipoDetalle.php?id=${usuario.equipo_favorito_id}`
        );
        const data = await resp.json();

        if (!data.info) {
            cont.innerHTML = "<p>Error cargando equipo favorito</p>";
            return;
        }

        cont.innerHTML = `
            <h5>${data.info.nombre}</h5>

            <strong>Últimos partidos</strong>
            <ul>
                ${data.ultimos.slice(0, 2).map(p =>
            `<li>${p.local} ${p.goles_local} - ${p.goles_visita} ${p.visita}</li>`
        ).join("")}
            </ul>

            <p>
                <strong>Próximo partido:</strong>
                ${data.proximo
                ? `${data.proximo.local} vs ${data.proximo.visita} (${data.proximo.fecha})`
                : "No hay próximo partido"}
            </p>
        `;

    } catch (e) {
        cont.innerHTML = "<p>Error cargando equipo favorito</p>";
    }
}
