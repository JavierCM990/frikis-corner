document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactoForm");
    const result = document.getElementById("contactResult");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("contactEmail").value.trim();
        const asunto = document.getElementById("contactAsunto").value.trim();
        const mensaje = document.getElementById("contactMensaje").value.trim();

        try {
            const resp = await fetch("../backend/api/enviarConsulta.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, asunto, mensaje })
            });

            const data = await resp.json();

            if (!resp.ok) {
                result.textContent = data.error || "Error al enviar la consulta";
                result.style.color = "red";
                return;
            }

            result.textContent = data.mensaje;
            result.style.color = "green";
            form.reset();

        } catch (err) {
            result.textContent = "Error de conexión al enviar la consulta";
            result.style.color = "red";
            console.error(err);
        }
    });
});
