const selectCompeticion = document.getElementById("selectCompeticion");
const selectEquipoFiltro = document.getElementById("selectEquipoFiltro");
const selectFechaFiltro = document.getElementById("selectFechaFiltro");
const tablaClasificacion = document.getElementById("tablaClasificacion");
const listaPartidos = document.getElementById("listaPartidos");
const topGoleadores = document.getElementById("topGoleadores");
const topGoleados = document.getElementById("topGoleados");

let partidosBase = [];
let equipos = [];
let clasificacion = [];
let partidosFiltrados = [];

/* ===========================
   DEDUPLICAR
=========================== */
function deduplicar(partidos) {
    const vistos = new Set();
    return partidos.filter(p => {
        if (vistos.has(p.id)) return false;
        vistos.add(p.id);
        return true;
    });
}

/* ===========================
   CARGA INICIAL
=========================== */
cargarCompeticiones();
cargarEquipos();
cargarTodosPartidos();

/* ===========================
   CARGAR COMPETICIONES
=========================== */
async function cargarCompeticiones() {
    try {
        const resp = await fetch("../backend/api/competiciones.php");
        const data = await resp.json();

        selectCompeticion.innerHTML = `<option value="">-- Selecciona competición --</option>`;
        data.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = c.nombre;
            selectCompeticion.appendChild(opt);
        });
    } catch (err) {
        console.error("Error cargando competiciones:", err);
    }
}

/* ===========================
   CARGAR EQUIPOS
=========================== */
async function cargarEquipos() {
    try {
        const resp = await fetch("../backend/api/equipos.php");
        equipos = await resp.json();
        llenarSelectEquipos(equipos);
    } catch (err) {
        console.error("Error cargando equipos:", err);
    }
}

function llenarSelectEquipos(lista, seleccionado = "") {
    selectEquipoFiltro.innerHTML = `<option value="">Todos los equipos</option>`;
    lista.forEach(e => {
        const opt = document.createElement("option");
        opt.value = e.id;
        opt.textContent = e.nombre;
        selectEquipoFiltro.appendChild(opt);
    });
    if (seleccionado) selectEquipoFiltro.value = seleccionado;
}

/* ===========================
   CARGAR TODOS LOS PARTIDOS
=========================== */
async function cargarTodosPartidos() {
    try {
        const resp = await fetch("../backend/api/todosPartidos.php");
        partidosBase = deduplicar(await resp.json());
        pintarPartidos(partidosBase);
    } catch (err) {
        console.error("Error cargando partidos:", err);
    }
}

/* ===========================
   EVENTOS
=========================== */
selectCompeticion.addEventListener("change", () => {
    if (!selectCompeticion.value) {
        limpiarClasificacionTops();
        partidosFiltrados = [...partidosBase];
        pintarPartidos(partidosFiltrados);
        llenarSelectEquipos(equipos);
    } else {
        cargarDetalleCompeticion(selectCompeticion.value);
    }
});

selectEquipoFiltro.addEventListener("change", aplicarFiltros);
selectFechaFiltro.addEventListener("change", aplicarFiltros);

/* ===========================
   LIMPIAR CLASIFICACIÓN Y TOPS
=========================== */
function limpiarClasificacionTops() {
    tablaClasificacion.innerHTML = "";
    topGoleadores.innerHTML = "";
    topGoleados.innerHTML = "";
}

/* ===========================
   CARGAR DETALLE COMPETICIÓN
=========================== */
async function cargarDetalleCompeticion(id) {
    try {
        const resp = await fetch(`../backend/api/competicionDetalle.php?id=${id}`);
        const data = await resp.json();

        clasificacion = data.clasificacion;
        partidosFiltrados = deduplicar(partidosBase.filter(p => p.competicion_id == id));

        pintarClasificacion(clasificacion);
        mostrarTop("topGoleadores", data.topGoleadores, "gf", "goles");
        mostrarTop("topGoleados", data.topGoleados, "ga", "goles encajados");
        pintarPartidos(partidosFiltrados);

        // Actualizar select de equipos con solo los de esta competición
        const idsCompeticion = new Set();
        partidosFiltrados.forEach(p => {
            idsCompeticion.add(p.local_id);
            idsCompeticion.add(p.visita_id);
        });
        llenarSelectEquipos(equipos.filter(e => idsCompeticion.has(e.id)));

    } catch (err) {
        console.error("Error cargando detalle competición:", err);
    }
}

/* ===========================
   APLICAR FILTROS
=========================== */
function aplicarFiltros() {
    let filtrados = [...partidosBase];

    const competicionId = selectCompeticion.value;
    const equipoId = selectEquipoFiltro.value;
    const fecha = selectFechaFiltro.value;

    if (competicionId) filtrados = filtrados.filter(p => p.competicion_id == competicionId);
    if (equipoId) filtrados = filtrados.filter(p => p.local_id == equipoId || p.visita_id == equipoId);
    if (fecha) filtrados = filtrados.filter(p => p.fecha.startsWith(fecha));

    partidosFiltrados = deduplicar(filtrados);
    pintarPartidos(partidosFiltrados);

    // Actualizar select de equipos manteniendo selección
    const seleccionado = equipoId;
    if (competicionId) {
        const idsCompeticion = new Set();
        partidosFiltrados.forEach(p => {
            idsCompeticion.add(p.local_id);
            idsCompeticion.add(p.visita_id);
        });
        llenarSelectEquipos(equipos.filter(e => idsCompeticion.has(e.id)), seleccionado);
    } else {
        llenarSelectEquipos(equipos, seleccionado);
    }
}

/* ===========================
   PINTAR CLASIFICACIÓN
=========================== */
function pintarClasificacion(clasif) {
    tablaClasificacion.innerHTML = `
        <thead>
            <tr>
                <th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th>
                <th>Pts</th><th>GF</th><th>DG</th>
            </tr>
        </thead>
        <tbody>
            ${clasif.map(e => `
                <tr>
                    <td>${e.nombre}</td>
                    <td>${e.pj}</td>
                    <td>${e.g}</td>
                    <td>${e.e}</td>
                    <td>${e.p}</td>
                    <td>${e.pts}</td>
                    <td>${e.gf}</td>
                    <td>${e.dg}</td>
                </tr>
            `).join("")}
        </tbody>
    `;
}

/* ===========================
   PINTAR PARTIDOS
=========================== */
function pintarPartidos(partidos) {
    listaPartidos.innerHTML = "";

    if (!partidos.length) {
        listaPartidos.innerHTML = `<li class="list-group-item">No hay partidos</li>`;
        return;
    }

    partidos.forEach(p => {
        const li = document.createElement("li");
        li.classList.add("list-group-item");

        const a = document.createElement("a");
        a.href = "#";
        a.textContent = `${p.local} ${p.goles_local ?? '-'} - ${p.goles_visita ?? '-'} ${p.visita} (${p.fecha})`;
        a.addEventListener("click", e => verPartido(e, p.id));

        li.appendChild(a);
        listaPartidos.appendChild(li);
    });
}

/* ===========================
   MODAL PARTIDO
=========================== */
async function verPartido(event, id) {
    event.preventDefault();

    try {
        const resp = await fetch(`../backend/api/detallesPartidos.php?id=${id}`);
        const data = await resp.json();

        if (!data.partido) return;

        const esFuturo = new Date(data.partido.fecha) > new Date();

        const localStats = data.estadisticas?.[0] || { tiros: 0, tiros_puerta: 0, tarjetas_rojas: 0 };
        const visitaStats = data.estadisticas?.[1] || { tiros: 0, tiros_puerta: 0, tarjetas_rojas: 0 };

        const totalTiros = localStats.tiros + visitaStats.tiros || 1;
        const totalTirosPuerta = localStats.tiros_puerta + visitaStats.tiros_puerta || 1;

        document.getElementById("contenidoModal").innerHTML = `
            <h5>${data.partido.local} vs ${data.partido.visitante}</h5>
            <p><strong>Fecha:</strong> ${data.partido.fecha}</p>
            <p><strong>Resultado:</strong> ${esFuturo ? "No disputado aún" : `${data.partido.goles_local} - ${data.partido.goles_visita}`}</p>

            ${esFuturo ? "" : `
                <h6>Tiros</h6>
                <div class="progress mb-2" style="height:25px">
                    <div class="progress-bar bg-success" style="width:${(localStats.tiros / totalTiros) * 100}%">${localStats.tiros}</div>
                    <div class="progress-bar bg-warning" style="width:${(visitaStats.tiros / totalTiros) * 100}%">${visitaStats.tiros}</div>
                </div>

                <h6>Tiros a puerta</h6>
                <div class="progress mb-2" style="height:25px">
                    <div class="progress-bar bg-success" style="width:${(localStats.tiros_puerta / totalTirosPuerta) * 100}%">${localStats.tiros_puerta}</div>
                    <div class="progress-bar bg-warning" style="width:${(visitaStats.tiros_puerta / totalTirosPuerta) * 100}%">${visitaStats.tiros_puerta}</div>
                </div>

                <h6>Tarjetas rojas</h6>
                <div class="d-flex justify-content-between">
                    <span>${data.partido.local}: ${localStats.tarjetas_rojas}</span>
                    <span>${data.partido.visitante}: ${visitaStats.tarjetas_rojas}</span>
                </div>
            `}
        `;

        new bootstrap.Modal(document.getElementById("modalPartido")).show();

    } catch (err) {
        console.error("Error cargando partido:", err);
    }
}

/* ===========================
   MOSTRAR TOPS
=========================== */
function mostrarTop(id, equipos, campo, texto) {
    const cont = document.getElementById(id);
    cont.innerHTML = "";
    equipos.forEach((e, i) => {
        cont.innerHTML += `
            <li class="list-group-item d-flex justify-content-between">
                <span>${i + 1}. ${e.nombre}</span>
                <strong>${e[campo]} ${texto}</strong>
            </li>
        `;
    });
}