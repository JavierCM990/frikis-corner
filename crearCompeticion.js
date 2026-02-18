document.getElementById("formCompeticion").addEventListener("submit", async e => {
    e.preventDefault();

    const usuario = getUsuarioLogueado();
    if (!usuario) return alert("Debes iniciar sesión");

    const resp = await fetch("../backend/api/crearCompeticion.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: nombre.value,
            descripcion: descripcion.value,
            creador: usuario.id
        })
    });

    const data = await resp.json();
    alert(data.ok ? "Competición creada" : data.error);
});
