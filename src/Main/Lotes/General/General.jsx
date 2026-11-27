import { useCallback, useEffect, useState } from "react";
import { apiServer } from "../../../utils/apiServer";
import NavLote from "./NavLote";
import "./General.css";
import Gastos from "../Gastos/Gastos";
import Pesos from "../Pesos/Pesos";
import Registros from "../Registros/Registros";

function formatearFecha(fechaStr) {
  if (!fechaStr) return "—";
  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) return String(fechaStr);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatoMoneda(valor, decimales = 2) {
  if (valor == null || Number.isNaN(Number(valor))) return "—";
  return `S/ ${Number(valor).toLocaleString("es-PE", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })}`;
}

function formatoNumero(valor, decimales = 0) {
  if (valor == null || Number.isNaN(Number(valor))) return "—";
  return Number(valor).toLocaleString("es-PE", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

function DetalleGeneral({ lote }) {
  const activo = Boolean(lote.estado);
  const inicial = Number(lote.cantidad_inicial ?? 0);
  const actual = Number(lote.cantidad_actual ?? 0);
  const muertes =
    lote.muertes != null ? Number(lote.muertes) : Math.max(0, inicial - actual);
  const pctMuerte = inicial > 0 ? (muertes / inicial) * 100 : 0;
  const dias = Number(lote.dias_produccion ?? 0);
  const codigoLote =
    lote.lote_id != null ? String(lote.lote_id).padStart(3, "0") : "—";

  const nivelRiesgo =
    pctMuerte > 5 ? "riesgo-alto" : pctMuerte > 2 ? "riesgo-medio" : "riesgo-ok";

  return (
    <section className="gen-sheet">
      {/* Encabezado tipo ficha operativa */}
      <div className="gen-hero">
        <div className="gen-hero-main">
          <div className="gen-eyebrow">
            <span className="gen-codigo">LOTE #{codigoLote}</span>
            <span className={`gen-estado ${activo ? "is-activo" : "is-inactivo"}`}>
              {activo ? "Activo" : "Inactivo"}
            </span>
          </div>
          <h2 className="gen-titulo">{lote.galpon || "Galpón sin asignar"}</h2>
          <p className="gen-sub">
            Ingreso: <strong>{formatearFecha(lote.fecha_ingreso)}</strong> · Ciclo actual:{" "}
            <strong>{dias} días</strong>
          </p>
        </div>

        <div className="gen-hero-kpi">
          <span className="gen-hero-kpi-label">Aves disponibles</span>
          <strong className="gen-hero-kpi-num">{formatoNumero(actual)}</strong>
          <span className="gen-hero-kpi-sub">de {formatoNumero(inicial)} iniciales</span>
        </div>
      </div>

      {/* Bloque 1: Población y mortalidad */}
      <div className="gen-bloque">
        <div className="gen-bloque-head">
          <h3>Población y mortalidad</h3>
          <span className={`gen-pill-riesgo ${nivelRiesgo}`}>
            Mortalidad {pctMuerte.toFixed(2)}%
          </span>
        </div>

        <div className="gen-metricas-4">
          <article className="gen-card">
            <span className="gen-label">Cantidad inicial</span>
            <strong className="gen-valor">{formatoNumero(inicial)}</strong>
            <span className="gen-meta">pollitos</span>
          </article>

          <article className="gen-card">
            <span className="gen-label">Cantidad actual</span>
            <strong className="gen-valor gen-verde">{formatoNumero(actual)}</strong>
            <span className="gen-meta">aves vivas</span>
          </article>

          <article className="gen-card">
            <span className="gen-label">Bajas acumuladas</span>
            <strong className="gen-valor gen-rojo">{formatoNumero(muertes)}</strong>
            <span className="gen-meta">aves</span>
          </article>

          <article className="gen-card gen-card-barra">
            <div className="gen-barra-top">
              <span className="gen-label">% Mortalidad</span>
              <strong className={`gen-pct ${nivelRiesgo}`}>
                {pctMuerte.toFixed(2)}%
              </strong>
            </div>
            <div className="gen-barra-track">
              <div
                className={`gen-barra-fill ${nivelRiesgo}`}
                style={{ width: `${Math.min(pctMuerte * 6, 100)}%` }}
              />
            </div>
            <span className="gen-meta">Umbral alerta: &gt; 2% · Crítico: &gt; 5%</span>
          </article>
        </div>
      </div>

      {/* Bloque 2: Economía y desarrollo de peso */}
      <div className="gen-bloque">
        <div className="gen-bloque-head">
          <h3>Costos y desarrollo de peso</h3>
        </div>

        <div className="gen-metricas-4">
          <article className="gen-card">
            <span className="gen-label">Precio pollito base</span>
            <strong className="gen-valor">{formatoMoneda(lote.precio_pollito_base)}</strong>
            <span className="gen-meta">por unidad</span>
          </article>

          <article className="gen-card">
            <span className="gen-label">Costo de producción</span>
            <strong className="gen-valor gen-primario">
              {formatoMoneda(lote.costo_produccion)}
            </strong>
            <span className="gen-meta">acumulado del lote</span>
          </article>

          <article className="gen-card">
            <span className="gen-label">Peso inicial</span>
            <strong className="gen-valor">{formatoNumero(lote.peso_inicial, 3)}</strong>
            <span className="gen-meta">kg promedio</span>
          </article>

          <article className="gen-card">
            <span className="gen-label">Peso actual</span>
            <strong className="gen-valor">{formatoNumero(lote.peso_actual, 2)}</strong>
            <span className="gen-meta">kg promedio</span>
          </article>
        </div>
      </div>

      {/* Bloque 3: Ficha técnica */}
      <div className="gen-bloque">
        <div className="gen-bloque-head">
          <h3>Ficha del lote</h3>
        </div>
        <dl className="gen-ficha">
          <div className="gen-ficha-item">
            <dt>Identificador</dt>
            <dd>#{codigoLote}</dd>
          </div>
          <div className="gen-ficha-item">
            <dt>Galpón</dt>
            <dd>{lote.galpon || "—"}</dd>
          </div>
          <div className="gen-ficha-item">
            <dt>Fecha de ingreso</dt>
            <dd>{formatearFecha(lote.fecha_ingreso)}</dd>
          </div>
          <div className="gen-ficha-item">
            <dt>Días de producción</dt>
            <dd>{dias} días</dd>
          </div>
          <div className="gen-ficha-item">
            <dt>Estado operativo</dt>
            <dd className={activo ? "gen-verde" : "gen-muted"}>
              {activo ? "Activo" : "Inactivo"}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export default function General({ idLote, onVolver }) {
  const [infoLote, setInfoLote] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tabActiva, setTabActiva] = useState("general");
  const [toast, setToast] = useState({ visible: false, mensaje: "", esError: false });

  const notificar = useCallback((mensaje, esError = false) => {
    setToast({ visible: true, mensaje, esError });
  }, []);

  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.visible]);

  useEffect(() => {
    if (!idLote) {
      setCargando(false);
      setError("No se recibió un ID de lote válido.");
      return;
    }

    let activo = true;
    setCargando(true);
    setError(null);

    apiServer(`lotes/${idLote}`)
      .then((res) => {
        if (!activo) return;
        if (res && typeof res === "object" && res.success === false) {
          throw new Error(res.message || "No se pudo obtener el lote.");
        }
        const detalle = res?.data ?? res;
        if (!detalle || typeof detalle !== "object") {
          throw new Error("El lote solicitado no devolvió información.");
        }
        setInfoLote(detalle);
      })
      .catch((err) => {
        if (!activo) return;
        const msg = err?.message || "Error al consultar el lote en el servidor.";
        setError(msg);
        notificar(msg, true);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [idLote, notificar]);

  return (
    <main className="gen-shell">
      <NavLote
        idLote={idLote}
        nombreGalpon={infoLote?.galpon}
        tabActiva={tabActiva}
        onCambiarTab={setTabActiva}
        onVolver={onVolver}
      />

      <div className="gen-body">
        {tabActiva === "general" && (
          <>
            {cargando && (
              <div className="gen-skeleton" aria-busy="true">
                <div className="sk-box sk-hero" />
                <div className="sk-grid-4">
                  <div className="sk-box sk-card" />
                  <div className="sk-box sk-card" />
                  <div className="sk-box sk-card" />
                  <div className="sk-box sk-card" />
                </div>
                <div className="sk-box sk-panel" />
              </div>
            )}

            {!cargando && error && (
              <div className="gen-vacio">
                <h3>No se pudo cargar el lote</h3>
                <p>{error}</p>
                {typeof onVolver === "function" && (
                  <button type="button" className="gen-btn-volver" onClick={onVolver}>
                    ← Volver a lotes
                  </button>
                )}
              </div>
            )}

            {!cargando && !error && infoLote && <DetalleGeneral lote={infoLote} />}
          </>
        )}

        {tabActiva === "gastos" && <Gastos idLote={idLote} />}
        {tabActiva === "pesajes" && <Pesos idLote={idLote} />}
        {tabActiva === "registros" && <Registros idLote={idLote} />}

        {["kpi", "advertencias", "monitoreo"].includes(tabActiva) && (
          <div className="gen-vacio">
            <h3>Sección en preparación</h3>
            <p>
              La vista de <strong>{tabActiva}</strong> para el lote #{idLote} aún no está
              conectada.
            </p>
          </div>
        )}
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`gen-toast ${toast.visible ? "is-visible" : ""} ${
          toast.esError ? "is-error" : ""
        }`}
      >
        {toast.mensaje}
      </div>
    </main>
  );
}