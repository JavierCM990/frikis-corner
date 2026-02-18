const selectEquipo = document.getElementById("selectEquipo");
const infoEquipo = document.getElementById("infoEquipo");
const listaCompeticiones = document.getElementById("listaCompeticiones");
const listaPartidos = document.getElementById("listaPartidos");
const proximoPartido = document.getElementById("proximoPartido");

let equipos = [];
let partidosBase = [];

/* ===========================
   FUNCION AUXILIAR: ELIMINAR DUPLICADOS
=========================== */
function eliminarDuplicados(partidos) {
  const vistos = new Set();
  const unicos = [];
  for (const p of partidos) {
    if (!vistos.has(p.id)) {
      vistos.add(p.id);
      unicos.push(p);
    }
  }
  return unicos;
}

/* ===========================
   CARGA INICIAL
=========================== */
cargarEquipos();
cargarTodosPartidos();

/* ===========================
   CARGAR EQUIPOS
=========================== */
async function cargarEquipos() {
  const resp = await fetch("../backend/api/equipos.php");
  equipos = await resp.json();

  selectEquipo.innerHTML = `<option value="">-- Selecciona un equipo --</option>`;
  equipos.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = e.nombre;
    selectEquipo.appendChild(opt);
  });
}

/* ===========================
   CARGAR TODOS LOS PARTIDOS
=========================== */
async function cargarTodosPartidos() {
  const resp = await fetch("../backend/api/todosPartidos.php");
  partidosBase = eliminarDuplicados(await resp.json());
}

/* ===========================
   EVENTO AL CAMBIAR EQUIPO
=========================== */
selectEquipo.addEventListener("change", () => {
  limpiarVista();
  if (selectEquipo.value) {
    cargarDetalle(selectEquipo.value);
  }
});

/* ===========================
   LIMPIAR VISTA
=========================== */
function limpiarVista() {
  infoEquipo.innerHTML = "";
  listaCompeticiones.innerHTML = "";
  listaPartidos.innerHTML = "";
  proximoPartido.innerHTML = "";
}

/* ===========================
   CARGAR DETALLE DEL EQUIPO
=========================== */
async function cargarDetalle(id) {
  const resp = await fetch(`../backend/api/equipoDetalle.php?id=${id}`);
  const data = await resp.json();
  if (!data.info) return;

  const ubicacion = data.info.zona || "";
  infoEquipo.innerHTML = `
        <h3>${data.info.nombre}</h3>
        <p><strong>Ubicación:</strong> ${ubicacion}</p>
    `;

  // Competiciones
  listaCompeticiones.innerHTML = "";
  if (ubicacion.toLowerCase() === "cartagena") {
    listaCompeticiones.innerHTML += `<li>Liga Cartagena</li>`;
    listaCompeticiones.innerHTML += `<li>Copa Región de Murcia</li>`;
  } else if (ubicacion.toLowerCase().includes("murcia")) {
    listaCompeticiones.innerHTML += `<li>Liga Región de Murcia</li>`;
    listaCompeticiones.innerHTML += `<li>Copa Región de Murcia</li>`;
  }

  // Últimos 5 partidos (sin duplicados)
  const ultimos5 = eliminarDuplicados(data.ultimos).slice(0, 5);

  listaPartidos.innerHTML = "";
  ultimos5.forEach(p => {
    const li = document.createElement("li");
    li.classList.add("list-group-item");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = `${p.local} ${p.goles_local ?? '-'} - ${p.goles_visita ?? '-'} ${p.visita} (${p.fecha})`;
    a.addEventListener("click", e => verPartido(e, p.id));
    li.appendChild(a);
    listaPartidos.appendChild(li);
  });

  // Próximo partido
  proximoPartido.innerHTML = "";
  if (data.proximo) {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = `${data.proximo.local} vs ${data.proximo.visita} (${data.proximo.fecha})`;
    a.addEventListener("click", e => verPartido(e, data.proximo.id));
    proximoPartido.appendChild(a);
  } else {
    proximoPartido.textContent = "No hay próximos partidos";
  }
}

/* ===========================
   MODAL PARTIDO
=========================== */
async function verPartido(event, id) {
  event.preventDefault();

  const resp = await fetch(`../backend/api/detallesPartidos.php?id=${id}`);
  const data = await resp.json();
  if (!data.partido) return;

  const fechaPartido = new Date(data.partido.fecha);
  const ahora = new Date();
  const esFuturo = fechaPartido > ahora;

  let localStats = { tiros: 0, tiros_puerta: 0, tarjetas_rojas: 0 };
  let visitaStats = { tiros: 0, tiros_puerta: 0, tarjetas_rojas: 0 };

  if (!esFuturo && data.estadisticas?.length) {
    localStats = data.estadisticas[0] || localStats;
    visitaStats = data.estadisticas[1] || visitaStats;
  }

  const totalTiros = localStats.tiros + visitaStats.tiros || 1;
  const totalTirosPuerta = localStats.tiros_puerta + visitaStats.tiros_puerta || 1;

  const body = document.getElementById("contenidoModal");
  body.innerHTML = `
    <h5>${data.partido.local} vs ${data.partido.visitante}</h5>
    <p><strong>Fecha:</strong> ${data.partido.fecha}</p>
    <p><strong>Resultado:</strong> ${esFuturo ? "No disputado" : `${data.partido.goles_local} - ${data.partido.goles_visita}`}</p>

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
      <span>${localStats.tarjetas_rojas}</span>
      <span>${visitaStats.tarjetas_rojas}</span>
    </div>
  `;

  new bootstrap.Modal(document.getElementById("modalPartido")).show();
}
