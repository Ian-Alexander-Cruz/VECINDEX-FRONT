const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const ERRORES = ["Token requerido", "Token inválido o expirado"]

export async function solicitarAPI(ruta, opciones = {}) {
    const config = opciones;
    const encabezados = new Headers(config.headers || {});

    if (config.body && !(config.body instanceof FormData) && !encabezados.has("Content-Type")) {
        encabezados.set("Content-Type", "application/json");
    }

    const respuesta = await fetch(`${API_URL}${ruta}`, {
        ...config,
        headers: encabezados,
        credentials: "include"
    });
    const tipoContenido = respuesta.headers.get("content-type") || "";
    const datos = tipoContenido.includes("application/json") ? await respuesta.json() : await respuesta.text();

    if (!respuesta.ok) {
        const mensaje = datos?.error || `Error en la solicitud: ${respuesta.status}`
        if (ERRORES.includes(mensaje) && !(ruta === "/api/usuario/perfil" && !config.method) && typeof window !== "undefined") {
            window.location.href = "/login"
        }
        throw new Error(mensaje);
    }

    return datos;
}
