import { useCallback, useEffect, useState } from "react";
import { apiServer } from "../../../utils/apiServer";
import "./Pesos.css";

function extraerLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.array)) return data.array;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function parsearFechaYDias(textoFecha) {
  if (!textoFecha) {
    return { fechaTexto: "—", diasTexto: null };
  }

  // Ejemplo esperado del DTO: "FECHA:  2026-11-01DIAS:  25"
  const partes = textoFecha.split(/DIAS:\s*/i);
  const fechaLimpia = partes[0].replace(/^FECHA:\s*/i, "").trim();
  const diasLimpio = partes[1] ? partes[1].trim() : null;

  return {
    fechaTexto: fechaLimpia || textoFecha,
    diasTexto: diasLimpio ? `${diasLimpio} días` : null,
  };
}

function CardPeso({ registro, index, total }) {
  const peso =
    registro.peso_obtenido != null
      ? Number(registro.peso_obtenido).toFixed(3)
      : "—";
  const { fechaTexto, diasTexto } = parsearFechaYDias(registro.fecha);
  const numeroControl = total - index;

  return (
    <article className="peso-card">
      <div className="peso-card-top">
        <div className="peso-badges">
          <span className="peso-lote-badge">{registro.lote || "Lote"}</span>
          {diasTexto && <span className="peso-dias-badge">{diasTexto}</span>}
        </div>
        <span className="peso-numero">Control #{numeroControl}</span>
      </div>

      <div className="peso-principal">
        <span className="peso-valor">{peso}</span>
        <span className="peso-unidad">kg</span>
      </div>

      <div className="peso-fecha-fila">
        <span className="peso-fecha-label">Registro</span>
        <span className="peso-fecha-valor">{fechaTexto}</span>
      </div>

      {registro.observaciones && (
        <div className="peso-obs">
          <span className="peso-obs-label">Observaciones</span>
          <p className="peso-obs-texto">{registro.observaciones}</p>
        </div>
      )}
    </article>
  );
}

function Pesos({ idLote }) {
  const [pesos, setPesos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarPesos = useCallback(async () => {
    if (!idLote) {
      setCargando(false);
      setError("ID de lote no especificado.");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const datos = await apiServer(`pesos/${idLote}`);
      setPesos(extraerLista(datos));
    } catch (err) {
      console.error("Error al cargar historial de pesos:", err);
      setError("No se pudo obtener el historial de pesos del lote.");
    } finally {
      setCargando(false);
    }
  }, [idLote]);

  useEffect(() => {
    cargarPesos();
  }, [cargarPesos]);

  const ultimoPeso =
    pesos.length > 0 && pesos[0]?.peso_obtenido != null
      ? Number(pesos[0].peso_obtenido).toFixed(3)
      : "—";

  const promedioPeso =
    pesos.length > 0
      ? (
          pesos.reduce((acc, item) => acc + Number(item.peso_obtenido ?? 0), 0) /
          pesos.length
        ).toFixed(3)
      : "—";

  return (
    <section className="pesos-wrapper">
      <div className="pesos-header">
        <div>
          <h3 className="pesos-titulo">Historial de pesos</h3>
          <p className="pesos-subtitulo">
            Seguimiento de peso obtenido para el lote #{idLote}
          </p>
        </div>

        <div className="pesos-resumen">
          <div className="peso-pill">
            <span className="peso-pill-label">Registros</span>
            <strong className="peso-pill-valor">{pesos.length}</strong>
          </div>
          <div className="peso-pill">
            <span className="peso-pill-label">Promedio</span>
            <strong className="peso-pill-valor">
              {promedioPeso !== "—" ? `${promedioPeso} kg` : "—"}
            </strong>
          </div>
          <div className="peso-pill destacado">
            <span className="peso-pill-label">Último peso</span>
            <strong className="peso-pill-valor">
              {ultimoPeso !== "—" ? `${ultimoPeso} kg` : "—"}
            </strong>
          </div>
        </div>
      </div>

      {cargando && (
        <div className="pesos-grid">
          <div className="peso-skeleton" />
          <div className="peso-skeleton" />
          <div className="peso-skeleton" />
        </div>
      )}

      {!cargando && error && (
        <div className="pesos-mensaje error">
          <p>{error}</p>
          <button
            type="button"
            className="btn-reintentar-peso"
            onClick={cargarPesos}
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && pesos.length === 0 && (
        <div className="pesos-mensaje">
          <p>Aún no hay registros de peso para este lote.</p>
        </div>
      )}

      {!cargando && !error && pesos.length > 0 && (
        <div className="pesos-grid">
          {pesos.map((registro, index) => (
            <CardPeso
              key={`${registro.lote ?? idLote}-${index}`}
              registro={registro}
              index={index}
              total={pesos.length}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Pesos;