document.addEventListener("DOMContentLoaded", () => {

    // ================================
    // NOTICIAS DEPORTIVAS
    // ================================

    async function noticiasDeportivas() {
    const contenedor = document.querySelector('.contenedorCardsNoticias');
    if (!contenedor) return;

    try {
        const resp = await fetch(
            "https://corsproxy.io/?url=https://datosabiertos.regiondemurcia.es/api/action/datastore_search?resource_id=6668b78b-7178-46d0-b9e0-ffee5f264a64&limit=1000"
        );

        if (!resp.ok) throw new Error("Error al cargar noticias");

        const data = await resp.json();
        const records = data.result.records;

        const palabrasClave = [
            "fútbol",
            "deporte",
            "liga",
            "copa",
            "partido",
            "club",
            "gol",
            "competición"
        ];

        const noticiasFiltradas = records.filter(n => {
            const texto = `
                ${n["dc:titulo"] || ""}
                ${n["webct:resumen"] || ""}
            `.toLowerCase();

            return palabrasClave.some(k => texto.includes(k));
        }).slice(0, 6);

        contenedor.innerHTML = "";

        if (!noticiasFiltradas.length) {
            contenedor.innerHTML = "<p>No hay noticias deportivas disponibles</p>";
            return;
        }

        noticiasFiltradas.forEach(noticia => {
            const titulo = noticia["dc:titulo"];
            const imagen = noticia["webct:imagen"];
            const fecha = noticia["webct:fecha"];
            const resumen = noticia["webct:resumen"];

            const div = document.createElement("div");
            div.classList.add("card", "col-12", "col-md-6", "col-lg-4");

            div.innerHTML = `
                <div class="card h-100 shadow-sm">
                    ${imagen ? `
                        <div class="card-img-wrapper">
                            <img src="${imagen}" class="card-img-top" alt="${titulo}">
                        </div>
                    ` : ""}
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${titulo}</h5>
                        <p class="card-text"><strong>Fecha:</strong> ${fecha || "—"}</p>
                        <p class="card-text flex-grow-1">${resumen || ""}</p>
                    </div>
                </div>
            `;

            contenedor.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = "<p>Error al cargar las noticias deportivas</p>";
    }
}


    // ================================
    // CAMPOS DE FÚTBOL
    // ================================

    async function camposFutbol() {

        const contenedor = document.querySelector('.contenedorCards');
        if (!contenedor) return; // Si no existe, no ejecutes nada

        try {
            const resp = await fetch(
                "https://corsproxy.io/?url=https://datosabiertos.regiondemurcia.es/api/action/datastore_search?resource_id=61506eed-7f6b-41eb-9267-d696ef497a47&limit=100&_=" + Date.now()
            );

            if (!resp.ok) throw new Error("Error al cargar campos");

            const data = await resp.json();
            const records = data.result.records;

            const camposFiltrados = records
                .filter(r => r["webct:idcategoria"] == 3)
                .slice(0, 6);

            contenedor.innerHTML = "";

            camposFiltrados.forEach(campo => {
                const foto = campo["webct:foto"] || "";
                const titulo = campo["dc:titulo"] || "Sin nombre";
                const ubicacion = campo["webct:barrio"] || "Sin ubicación";
                const direccion = campo["webct:direccion"] || "";

                const div = document.createElement("div");
                div.classList.add("card", "col-12", "col-md-6", "col-lg-4");

                div.innerHTML = `
                    <div class="card h-100 shadow-sm">
                         ${foto ? `
                            <div class="card-img-wrapper">
                                <img src="${foto}" class="card-img-top" alt="${titulo}">
                            </div>
                        ` : ""}
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${titulo}</h5>
                            <p class="card-text"><strong>Ubicación:</strong> ${ubicacion}</p>
                            <p class="card-text flex-grow-1">${direccion}</p>
                        </div>
                    </div>
                `;

                contenedor.appendChild(div);
            });

        } catch (error) {
            console.error(error);
            contenedor.innerHTML = "<p>Error al cargar los campos de fútbol</p>";
        }
    }


    noticiasDeportivas();
    camposFutbol();

});
