import { useCallback, useEffect, useState } from "react";
import { apiServer } from "../../../utils/apiServer";
import "./Registros.css";

function extraerLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.array)) return data.array;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function formatearFecha(fechaValor) {
  if (!fechaValor) return "—";
  const d = new Date(fechaValor);
  if (Number.isNaN(d.getTime())) return String(fechaValor);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function CardRegistro({ registro }) {
  const muertes = Number(registro.muertes ?? 0);
  const idFormateado =
    registro.id_regitro != null
      ? String(registro.id_regitro).padStart(3, "0")
      : "—";

  let nivelClase = "normal";
  if (muertes >= 15) nivelClase = "critico";
  else if (muertes > 0) nivelClase = "alerta";

  return (
    <article className={`registro-card ${nivelClase}`}>
      <div className="registro-card-top">
        <span className="registro-id">Registro #{idFormateado}</span>
        <span className="registro-fecha">{formatearFecha(registro.fecha)}</span>
      </div>

      <div className="registro-muertes-box">
        <span className="registro-muertes-label">Muertes registradas</span>
        <div className="registro-muertes-valor-wrap">
          <span className={`registro-muertes-valor ${nivelClase}`}>
            {muertes.toLocaleString("es-PE")}
          </span>
          <span className="registro-muertes-unidad">aves</span>
        </div>
      </div>

      <div className="registro-obs">
        <span className="registro-obs-label">Observaciones</span>
        <p className="registro-obs-texto">
          {registro.observaciones?.trim()
            ? registro.observaciones
            : "Sin observaciones registradas."}
        </p>
      </div>
    </article>
  );
}

function Registros({ idLote }) {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarRegistros = useCallback(async () => {
    if (!idLote) {
      setCargando(false);
      setError("ID de lote no especificado.");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const datos = await apiServer(`registros/${idLote}`);
      setRegistros(extraerLista(datos));
    } catch (err) {
      console.error("Error al cargar registros del lote:", err);
      setError("No se pudieron obtener los registros del lote.");
    } finally {
      setCargando(false);
    }
  }, [idLote]);

  useEffect(() => {
    cargarRegistros();
  }, [cargarRegistros]);

  const totalMuertes = registros.reduce(
    (acc, item) => acc + Number(item.muertes ?? 0),
    0
  );

  const promedioMuertes =
    registros.length > 0 ? (totalMuertes / registros.length).toFixed(1) : "0.0";

  return (
    <section className="registros-wrapper">
      <div className="registros-header">
        <div>
          <h3 className="registros-titulo">Historial de registros diarios</h3>
          <p className="registros-subtitulo">
            Control de novedades y mortalidad para el lote #{idLote}
          </p>
        </div>

        <div className="registros-resumen">
          <div className="registro-pill">
            <span className="registro-pill-label">Días registrados</span>
            <strong className="registro-pill-valor">{registros.length}</strong>
          </div>
          <div className="registro-pill">
            <span className="registro-pill-label">Promedio / día</span>
            <strong className="registro-pill-valor">{promedioMuertes}</strong>
          </div>
          <div className="registro-pill alerta">
            <span className="registro-pill-label">Total muertes</span>
            <strong className="registro-pill-valor">
              {totalMuertes.toLocaleString("es-PE")}
            </strong>
          </div>
        </div>
      </div>

      {cargando && (
        <div className="registros-grid">
          <div className="registro-skeleton" />
          <div className="registro-skeleton" />
          <div className="registro-skeleton" />
        </div>
      )}

      {!cargando && error && (
        <div className="registros-mensaje error">
          <p>{error}</p>
          <button
            type="button"
            className="btn-reintentar-registro"
            onClick={cargarRegistros}
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && registros.length === 0 && (
        <div className="registros-mensaje">
          <p>Aún no hay registros diarios para este lote.</p>
        </div>
      )}

      {!cargando && !error && registros.length > 0 && (
        <div className="registros-grid">
          {registros.map((registro, index) => (
            <CardRegistro
              key={registro.id_regitro ? `${registro.id_regitro}-${index}` : index}
              registro={registro}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Registros;