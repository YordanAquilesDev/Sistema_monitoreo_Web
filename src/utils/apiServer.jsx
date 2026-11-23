
const BASE_URL = "http://localhost:8080/api/v1"
export async function apiServer(enpoint, { method = "GET", body = null, token = null, headers = {} } = {}) {
    const cleanEnpoint = enpoint.startsWith("/") ? enpoint.slice(1) : enpoint;
    const hasBody = body !== null && body !== undefined && method.toUpperCase !== "GET";
    const config = {
        method: method.toUpperCase(),
        headers: {
            ...(hasBody ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
    };
    if (hasBody) {
        config.body = typeof (body === "string" ? body : JSON.stringify(body));
    }

    const respuesta = await fetch(`${BASE_URL}/${cleanEnpoint}`, config);
    const typoContenido = respuesta.headers.get("content-type") || "";
    const data = typoContenido.includes("application/json")
        ? await respuesta.json() :
        await respuesta.text();
    if (!respuesta.ok) {
        const error = new Error(data?.message || `Error HTTP ${respuesta.status}`);
        throw error;
    }
    return data;

}