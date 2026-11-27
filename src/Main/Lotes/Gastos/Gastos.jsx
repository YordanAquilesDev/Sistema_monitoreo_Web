import { useCallback, useEffect, useState } from "react";
import { apiServer } from "../../../utils/apiServer";
import "./Gastos.css";

const TIPOS_GASTO = ["ALIMENTO", "TRANSPORTE", "MEDICINA"];

function fechaHoyInput() {
  const hoy = new Date();
  const offset = hoy.getTimezoneOffset();
  const local = new Date(hoy.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
}

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

function formatoMoneda(valor) {
  const num = Number(valor ?? 0);
  return `S/ ${num.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function extraerLista(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.array)) return res.array;
  return [];
}

function CardGasto({ gasto }) {
  const tipo = String(gasto.tipo_gasto || "GENERAL").toUpperCase();
  const claseTipo = tipo.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <article className="gst-card">
      <div className="gst-card-top">
        <span className={`gst-badge ${claseTipo}`}>{tipo}</span>
        <span className="gst-id">
          #{String(gasto.id_gasto ?? 0).padStart(3, "0")}
        </span>
      </div>

      <h4 className="gst-concepto">{gasto.concepto || "Sin concepto"}</h4>

      <div className="gst-card-bottom">
        <span className="gst-fecha">{formatearFecha(gasto.fecha)}</span>
        <strong className="gst-monto">{formatoMoneda(gasto.monto_total)}</strong>
      </div>
    </article>
  );
}

function ModalNuevoGasto({ idLote, onCerrar, onCreado }) {
  const [form, setForm] = useState({
    tipo_gasto: "ALIMENTO",
    fecha: fechaHoyInput(),
    monto_total: "",
    concepto: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !enviando) onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enviando, onCerrar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorForm("");

    const montoNum = Number(form.monto_total);
    if (!form.concepto.trim()) {
      setErrorForm("Ingresa un concepto para el gasto.");
      return;
    }
    if (!form.monto_total || Number.isNaN(montoNum) || montoNum <= 0) {
      setErrorForm("Ingresa un monto válido mayor a 0.");
      return;
    }
    if (!form.fecha) {
      setErrorForm("Selecciona una fecha.");
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        id_lote: Number(idLote),
        tipo_gasto: form.tipo_gasto.toUpperCase(),
        fecha: form.fecha,
        monto_total: montoNum,
        concepto: form.concepto.trim(),
      };

      const res = await apiServer("gastos", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res && typeof res === "object" && res.success === false) {
        throw new Error(res.message || "No se pudo registrar el gasto.");
      }

      onCreado(res?.data ?? payload);
      onCerrar();
    } catch (err) {
      setErrorForm(err?.message || "Error al guardar el gasto en el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="gst-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-gasto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !enviando) onCerrar();
      }}
    >
      <div className="gst-modal">
        <div className="gst-modal-head">
          <div>
            <span className="gst-modal-tag">LOTE #{idLote}</span>
            <h3 id="titulo-modal-gasto">Registrar nuevo gasto</h3>
          </div>
          <button
            type="button"
            className="gst-modal-close"
            onClick={onCerrar}
            disabled={enviando}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="gst-form">
          <div className="gst-field">
            <label htmlFor="tipo_gasto">Tipo de gasto</label>
            <div className="gst-tipo-selector">
              {TIPOS_GASTO.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  className={`gst-tipo-chip ${
                    form.tipo_gasto === tipo ? "is-selected" : ""
                  }`}
                  onClick={() => setForm((prev) => ({ ...prev, tipo_gasto: tipo }))}
                  disabled={enviando}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          <div className="gst-row-2">
            <div className="gst-field">
              <label htmlFor="monto_total">Monto total (S/)</label>
              <input
                id="monto_total"
                name="monto_total"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.monto_total}
                onChange={handleChange}
                disabled={enviando}
                required
              />
            </div>

            <div className="gst-field">
              <label htmlFor="fecha">Fecha</label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                value={form.fecha}
                onChange={handleChange}
                disabled={enviando}
                required
              />
            </div>
          </div>

          <div className="gst-field">
            <label htmlFor="concepto">Concepto / detalle</label>
            <input
              id="concepto"
              name="concepto"
              type="text"
              maxLength={255}
              placeholder="Ej. Alimento inicio 5 sacos, flete, vacuna..."
              value={form.concepto}
              onChange={handleChange}
              disabled={enviando}
              required
            />
          </div>

          {errorForm && <div className="gst-form-error">{errorForm}</div>}

          <div className="gst-modal-actions">
            <button
              type="button"
              className="gst-btn-secundario"
              onClick={onCerrar}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="gst-btn-primario"
              disabled={enviando}
            >
              {enviando ? "Guardando..." : "Guardar gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Gastos({ idLote }) {
  const [gastos, setGastos] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarGastos = useCallback(async () => {
    if (!idLote) {
      setCargando(false);
      setError("ID de lote no especificado.");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const res = await apiServer(`gastos/${idLote}`);
      if (res && typeof res === "object" && res.success === false) {
        throw new Error(res.message || "No se pudieron obtener los gastos.");
      }
      setGastos(extraerLista(res));
    } catch (err) {
      setError(err?.message || "No se pudieron obtener los gastos del lote.");
    } finally {
      setCargando(false);
    }
  }, [idLote]);

  useEffect(() => {
    cargarGastos();
  }, [cargarGastos]);

  const gastosFiltrados =
    filtroTipo === "TODOS"
      ? gastos
      : gastos.filter(
          (g) => String(g.tipo_gasto || "").toUpperCase() === filtroTipo
        );

  const totalGastos = gastosFiltrados.reduce(
    (acc, item) => acc + Number(item.monto_total ?? 0),
    0
  );

  return (
    <section className="gst-shell">
      {/* Cabecera + resumen + CTA nuevo gasto */}
      <div className="gst-top">
        <div>
          <h3 className="gst-titulo">Gastos del lote #{idLote}</h3>
          <p className="gst-subtitulo">
            Control de egresos por alimento, transporte y medicina
          </p>
        </div>

        <div className="gst-top-right">
          <div className="gst-metrica">
            <span>Registros</span>
            <strong>{gastosFiltrados.length}</strong>
          </div>
          <div className="gst-metrica is-destacada">
            <span>Total</span>
            <strong>{formatoMoneda(totalGastos)}</strong>
          </div>
          <button
            type="button"
            className="gst-btn-primario"
            onClick={() => setModalAbierto(true)}
            disabled={!idLote}
          >
            + Nuevo gasto
          </button>
        </div>
      </div>

      {/* Filtros rápidos por tipo */}
      <div className="gst-filtros" role="group" aria-label="Filtrar por tipo de gasto">
        {["TODOS", ...TIPOS_GASTO].map((tipo) => (
          <button
            key={tipo}
            type="button"
            className={`gst-filtro-btn ${filtroTipo === tipo ? "is-active" : ""}`}
            onClick={() => setFiltroTipo(tipo)}
          >
            {tipo === "TODOS" ? "Todos" : tipo}
          </button>
        ))}
      </div>

      {cargando && (
        <div className="gst-grid">
          <div className="gst-sk" />
          <div className="gst-sk" />
          <div className="gst-sk" />
        </div>
      )}

      {!cargando && error && (
        <div className="gst-vacio is-error">
          <p>{error}</p>
          <button type="button" className="gst-btn-secundario" onClick={cargarGastos}>
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && gastosFiltrados.length === 0 && (
        <div className="gst-vacio">
          <p>
            {filtroTipo === "TODOS"
              ? "Aún no hay gastos registrados para este lote."
              : `No hay gastos de tipo ${filtroTipo} para este lote.`}
          </p>
          <button
            type="button"
            className="gst-btn-primario"
            onClick={() => setModalAbierto(true)}
          >
            + Registrar primer gasto
          </button>
        </div>
      )}

      {!cargando && !error && gastosFiltrados.length > 0 && (
        <div className="gst-grid">
          {gastosFiltrados.map((gasto, idx) => (
            <CardGasto
              key={gasto.id_gasto ?? `${gasto.tipo_gasto}-${idx}`}
              gasto={gasto}
            />
          ))}
        </div>
      )}

      {modalAbierto && (
        <ModalNuevoGasto
          idLote={idLote}
          onCerrar={() => setModalAbierto(false)}
          onCreado={() => cargarGastos()}
        />
      )}
    </section>
  );
}