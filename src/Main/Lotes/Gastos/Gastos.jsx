import { useCallback, useEffect, useState } from "react";
import { apiServer } from "../../../utils/apiServer";
import "./Gastos.css";

function formatearFecha(fechaStr) {
  if (!fechaStr) return "—";
  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) return fechaStr;
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function extraerLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.array)) return data.array;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function CardGasto({ gasto }) {
  const monto = Number(gasto.monto_total ?? 0).toFixed(2);
  const tipo = gasto.tipo_gasto || "General";
  const tipoClase = tipo.toLowerCase().replace(/\s+/g, "-");

  return (
    <article className="gasto-card">
      <div className="gasto-card-top">
        <span className={`gasto-tipo-badge ${tipoClase}`}>{tipo}</span>
        <span className="gasto-id">#{String(gasto.id_gasto ?? "").padStart(3, "0")}</span>
      </div>

      <h4 className="gasto-concepto">{gasto.concepto || "Sin concepto"}</h4>

      <div className="gasto-card-footer">
        <span className="gasto-fecha">{formatearFecha(gasto.fecha)}</span>
        <span className="gasto-monto">S/ {monto}</span>
      </div>
    </article>
  );
}

function Gastos({ idLote }) {
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarGastos = useCallback(async () => {
    if (!idLote) {
      setCargando(false);
      setError("ID de lote no especificado.");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const datos = await apiServer(`gastos/${idLote}`);
      setGastos(extraerLista(datos));
    } catch (err) {
      console.error("Error al cargar gastos del lote:", err);
      setError("No se pudieron obtener los gastos del lote.");
    } finally {
      setCargando(false);
    }
  }, [idLote]);

  useEffect(() => {
    cargarGastos();
  }, [cargarGastos]);

  const totalGastos = gastos.reduce(
    (acc, item) => acc + Number(item.monto_total ?? 0),
    0
  );

  return (
    <section className="gastos-wrapper">
      <div className="gastos-header">
        <div>
          <h3 className="gastos-titulo">Historial de gastos</h3>
          <p className="gastos-subtitulo">
            Detalle de egresos registrados para el lote #{idLote}
          </p>
        </div>

        <div className="gastos-resumen">
          <div className="resumen-pill">
            <span className="resumen-label">Registros</span>
            <strong className="resumen-valor">{gastos.length}</strong>
          </div>
          <div className="resumen-pill destacado">
            <span className="resumen-label">Total gastado</span>
            <strong className="resumen-valor">
              S/ {totalGastos.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </div>
        </div>
      </div>

      {cargando && (
        <div className="gastos-grid">
          <div className="gasto-skeleton" />
          <div className="gasto-skeleton" />
          <div className="gasto-skeleton" />
        </div>
      )}

      {!cargando && error && (
        <div className="gastos-mensaje error">
          <p>{error}</p>
          <button type="button" className="btn-reintentar" onClick={cargarGastos}>
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && gastos.length === 0 && (
        <div className="gastos-mensaje">
          <p>Aún no hay gastos registrados para este lote.</p>
        </div>
      )}

      {!cargando && !error && gastos.length > 0 && (
        <div className="gastos-grid">
          {gastos.map((gasto, index) => (
            <CardGasto
              key={gasto.id_gasto ?? `${gasto.id_lote}-${index}`}
              gasto={gasto}
            />
          ))}
        </div>
      )}

      
    </section>

  );
}

export default Gastos;