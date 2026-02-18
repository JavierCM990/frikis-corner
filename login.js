document.addEventListener("DOMContentLoaded", () => {

    console.log("login.js cargado");

    // Mostrar formulario de registro
    const mostrarRegistroBtn = document.getElementById("mostrarRegistro");
    const registroBox = document.getElementById("registroBox");
    mostrarRegistroBtn.addEventListener("click", (e) => {
        e.preventDefault();
        registroBox.style.display = registroBox.style.display === "block" ? "none" : "block";
    });

    // Cargar equipos en select
    cargarEquipos();

    // ===== LOGIN =====
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const resp = await fetch("../backend/api/login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await resp.json();

            if (!resp.ok) {
                alert(data.error || "Error al iniciar sesión");
                return;
            }

            // Guardar usuario en localStorage
            localStorage.setItem("usuario", JSON.stringify(data));

            // Redirigir a inicio
            window.location.href = "index.html";

        } catch (error) {
            console.error(error);
            alert("Error de conexión al iniciar sesión");
        }
    });

    // ===== REGISTRO =====
    const registroForm = document.getElementById("registroForm");
    registroForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("regNombre").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;
        const equipo_id = document.getElementById("regEquipo").value || null;

        try {
            const resp = await fetch("../backend/api/registro.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, email, password, equipo_id })
            });

            const data = await resp.json();

            if (!resp.ok) {
                alert(data.error || "Error en el registro");
                return;
            }

            alert("Registro correcto, ya puedes iniciar sesión");
            registroForm.reset();
            registroBox.style.display = "none";

        } catch (error) {
            console.error(error);
            alert("Error de conexión al registrar usuario");
        }
    });
});

// ===== CARGAR EQUIPOS EN SELECT =====
async function cargarEquipos() {
    const select = document.getElementById("regEquipo");
    select.innerHTML = `<option value="">Equipo favorito (opcional)</option>`;

    try {
        const resp = await fetch("../backend/api/equipos.php");
        const equipos = await resp.json();

        equipos.forEach(eq => {
            const opt = document.createElement("option");
            opt.value = eq.id;
            opt.textContent = eq.nombre;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error(error);
        alert("Error cargando equipos");
    }
}
