import { useCallback, useEffect, useRef, useState } from "react";
import { apiServer } from "../../../utils/apiServer";
import NavLote from "./NavLote";
import "./General.css";
import Gastos from "../Gastos/Gastos";
import Pesos from "../Pesos/Pesos";
import Registros from "../Registros/Registros";

function IconoCalendario() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconoCasa() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function formatearFecha(fechaStr) {
  if (!fechaStr) return null;
  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) return fechaStr;
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function DetalleGeneral({ lote }) {
  const estadoActivo = Boolean(lote.estado);
  const estadoTexto = estadoActivo ? "Activo" : "Inactivo";
  const estadoClase = estadoActivo ? "activo" : "inactivo";

  const fechaIngreso = formatearFecha(lote.fecha_ingreso);

  const cantidadInicial = Number(lote.cantidad_inicial ?? 0);
  const cantidadActual = Number(lote.cantidad_actual ?? 0);
  const muertes =
    lote.muertes != null
      ? Number(lote.muertes)
      : Math.max(0, cantidadInicial - cantidadActual);

  const pctMuerteNum =
    cantidadInicial > 0 ? (muertes / cantidadInicial) * 100 : 0;
  const pcrtMuerte = pctMuerteNum.toFixed(2);

  const pesoInicial =
    lote.peso_inicial != null ? Number(lote.peso_inicial).toFixed(3) : "—";
  const pesoActual =
    lote.peso_actual != null ? Number(lote.peso_actual).toFixed(2) : "—";
  const precioPollito =
    lote.precio_pollito_base != null
      ? Number(lote.precio_pollito_base).toFixed(2)
      : "—";
  const costoProduccion =
    lote.costo_produccion != null
      ? Number(lote.costo_produccion).toFixed(2)
      : "—";
  const diasProd =
    lote.dias_produccion != null ? Number(lote.dias_produccion) : 0;
  const loteIdFormateado =
    lote.lote_id != null ? String(lote.lote_id).padStart(3, "0") : "—";

  let barraColor = "#16a34a";
  if (pctMuerteNum > 2) barraColor = "#d97706";
  if (pctMuerteNum > 5) barraColor = "#dc2626";

  return (
    <div id="contenedor-detalle-lote" className="detalle-container">
      {/* HEADER */}
      <div className="detalle-header">
        <div>
          <div className="detalle-titulo">
            Lote #{loteIdFormateado} — {lote.galpon || "Sin galpón"}
          </div>
          <div className="detalle-subtitulo">
            <IconoCasa />
            <span>{lote.galpon || "—"}</span>
            <span>•</span>
            <span>{diasProd} días</span>
          </div>
        </div>
        <div className="detalle-meta">
          <div className={`status-badge ${estadoClase}`}>{estadoTexto}</div>
          <div className="dias-badge">{diasProd} días en producción</div>
        </div>
      </div>

      {/* CANTIDADES */}
      <div className="seccion">
        <div className="seccion-titulo">Cantidades y mortalidad</div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Cantidad inicial</div>
            <div className="stat-value">
              {cantidadInicial.toLocaleString("es-PE")}
            </div>
            <div className="stat-unit">pollitos</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Cantidad actual</div>
            <div className="stat-value">
              {cantidadActual.toLocaleString("es-PE")}
            </div>
            <div className="stat-unit">pollitos</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Mortalidad</div>
            <div className="stat-value danger">
              {muertes.toLocaleString("es-PE")}
            </div>
            <div className="stat-unit">aves</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">% Mortalidad</div>
            <div className="stat-value danger">{pcrtMuerte}%</div>
            <div className="mortalidad-barra">
              <div
                className="mortalidad-barra-fill"
                style={{
                  width: `${Math.min(pctMuerteNum * 5, 100)}%`,
                  background: barraColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* COSTOS Y PESOS */}
      <div className="seccion">
        <div className="seccion-titulo">Costos y pesos</div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Precio pollito base</div>
            <div className="stat-value">S/ {precioPollito}</div>
            <div className="stat-unit">por unidad</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Costo de producción</div>
            <div className="stat-value">S/ {costoProduccion}</div>
            <div className="stat-unit">acumulado</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Peso inicial</div>
            <div className="stat-value">{pesoInicial}</div>
            <div className="stat-unit">kg</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Peso actual</div>
            <div className="stat-value">{pesoActual}</div>
            <div className="stat-unit">kg</div>
          </div>
        </div>
      </div>

      {/* FECHAS */}
      <div className="seccion">
        <div className="seccion-titulo">Fechas importantes</div>
        <div className="fechas-row">
          <div className="fecha-card">
            <div className="fecha-icon-wrap entrada">
              <IconoCalendario />
            </div>
            <div>
              <div className="fecha-label">Fecha de ingreso</div>
              <div className="fecha-value">{fechaIngreso || "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* INFORMACIÓN GENERAL */}
      <div className="seccion">
        <div className="seccion-titulo">Información general</div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">ID del lote</span>
            <span className="info-value">#{loteIdFormateado}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Galpón asignado</span>
            <span className="info-value">{lote.galpon || "—"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Estado</span>
            <span className={`info-value estado-texto ${estadoClase}`}>
              {estadoTexto}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Días en producción</span>
            <span className="info-value">{diasProd} días</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function General({ idLote, onVolver }) {
  const [infoLote, setInfoLote] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tabActiva, setTabActiva] = useState("general");

  const [toast, setToast] = useState({
    visible: false,
    mensaje: "",
    esError: false,
  });

  const toastTimerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const mostrarToast = useCallback((mensaje, esError = false) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, mensaje, esError });
    toastTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setToast((prev) => ({ ...prev, visible: false }));
      }
    }, 3200);
  }, []);

  useEffect(() => {
    let active = true;

    async function cargarDetalle() {
      if (!idLote) {
        setCargando(false);
        setError("ID de lote no especificado");
        mostrarToast("ID de lote no especificado", true);
        return;
      }

      setCargando(true);
      setError(null);

      try {
        const datos = await apiServer(`lotes/${idLote}`);
        if (!active) return;
        const detalle = datos?.data ?? datos;
        if (!detalle || typeof detalle !== "object") {
          throw new Error("Respuesta vacía del servidor");
        }
        setInfoLote(detalle);
      } catch (err) {
        if (!active) return;
        console.error("Error al cargar detalle del lote:", err);
        setError("Verifica que el ID sea correcto o intenta más tarde.");
        mostrarToast("Error al cargar el detalle del lote", true);
      } finally {
        if (active) setCargando(false);
      }
    }

    cargarDetalle();
    return () => {
      active = false;
    };
  }, [idLote, mostrarToast]);

  return (
    <main className="main-container">
      <NavLote
        idLote={idLote}
        tabActiva={tabActiva}
        onCambiarTab={setTabActiva}
        onVolver={onVolver}
      />

      {tabActiva === "general" && (
        <>
          {cargando && (
            <div id="estado-carga" className="skeleton-detalle">
              <div className="skeleton-header">
                <div className="skeleton-title" />
                <div className="skeleton-badge" />
              </div>
              <div className="skeleton-stats">
                <div className="skeleton-stat" />
                <div className="skeleton-stat" />
                <div className="skeleton-stat" />
                <div className="skeleton-stat" />
              </div>
              <div className="skeleton-section" />
              <div className="skeleton-section" />
            </div>
          )}

          {!cargando && error && (
            <div id="estado-error" className="estado-vacio">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h3>No se pudo cargar el lote</h3>
              <p>{error}</p>
              {typeof onVolver === "function" && (
                <button type="button" className="btn-volver" onClick={onVolver}>
                  ← Volver a lotes
                </button>
              )}
            </div>
          )}

          {!cargando && !error && infoLote && <DetalleGeneral lote={infoLote} />}
        </>
      )}

      {tabActiva === "gastos" && (
        <div className="estado-vacio">
          <Gastos idLote={idLote} />
        </div>
      )}

      {tabActiva === "pesajes" && (
        <div className="estado-vacio">
          Mostrar el historial de pesajes del lote seleccionado
          <Pesos idLote={idLote} />
        </div>
      )}

      {tabActiva === "registros" && (
        <div className="estado-vacio">
          Mostrar historial de registros del lote seleccionado
          <Registros idLote={idLote} />
        </div>
      )}

      {/* ===== TOAST ===== */}
      <div
        className={`toast ${toast.visible ? "show" : ""} ${
          toast.esError ? "error" : ""
        }`}
      >
        <svg
          className="toast-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>{toast.mensaje}</span>
      </div>
    </main>
  );
}