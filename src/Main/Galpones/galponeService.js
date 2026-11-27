import { apiServer } from "../../utils/apiServer";

const RUTA = "galpones";

function extraerData(respuesta) {
  if (respuesta && typeof respuesta === "object" && "success" in respuesta) {
    if (!respuesta.success) {
      throw new Error(respuesta.message || "Operación rechazada por el servidor.");
    }
    return respuesta.data;
  }
  return respuesta;
}

export async function listarGalpones() {
  const respuesta = await apiServer(RUTA);
  const data = extraerData(respuesta);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.array)) return data.array;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function registrarGalpon(form) {
  const payload = {
    capacidad: Number(form.capacidad),
    area: Number(form.area),
    tipo_ventilacion: form.tipo_ventilacion,
    estado: Boolean(form.estado),
  };

  const respuesta = await apiServer(RUTA, {
    method: "POST",
    body: payload,
  });

  return extraerData(respuesta);
}