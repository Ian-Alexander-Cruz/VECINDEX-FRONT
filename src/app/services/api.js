const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vecindex-web.onrender.com";

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
        throw new Error(
            datos?.error || `Error en la solicitud: ${respuesta.status}`
        );
    }

    return datos;
}
