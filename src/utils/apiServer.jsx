
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
        
        const jsonBody= typeof body==="string" ? body: JSON.stringify(body);

        config.body = jsonBody;
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


export async function probarPost() {
    const data ={
        id_galpon: null,
        capacidad: 120,
        area: 123,
        tipo_ventilacion: "NATURAL",
        estado: true
    }
   
   try{
    const res= await apiServer("galpones", {method: "POST",body:data});
    console.log("RESPUESTA", res);
   }catch(error){
    console.log("ERROR", error);
   }
}