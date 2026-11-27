import { useCallback, useEffect, useState } from "react";
import { apiServer } from "../../../utils/apiServer";
import "./Pesos.css";

function fechaHoyInput() {
  const hoy = new Date();
  const offset = hoy.getTimezoneOffset();
  const local = new Date(hoy.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
}

function extraerData(res) {
  if (res && typeof res === "object" && "success" in res) {
    if (!res.success) {
      throw new Error(res.message || "Operación rechazada por el servidor.");
    }
    return res.data;
  }
  return res;
}

function extraerLista(res) {
  const data = extraerData(res);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.array)) return data.array;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function parsearFechaYDias(textoFecha) {
  if (!textoFecha) {
    return { fechaTexto: "—", diasTexto: null };
  }

  // Formato generado en PesoLoteDTO: "FECHA:  ...DIAS:  ..."
  const partes = String(textoFecha).split(/DIAS:\s*/i);
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

function ModalNuevoPeso({ idLote, onCerrar, onCreado }) {
  const [form, setForm] = useState({
    fecha: fechaHoyInput(),
    peso_obtenido: "",
    observaciones: "",
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

    const pesoNum = Number(form.peso_obtenido);
    if (!form.peso_obtenido || Number.isNaN(pesoNum) || pesoNum <= 0) {
      setErrorForm("Ingresa un peso válido mayor a 0 kg.");
      return;
    }
    if (!form.fecha) {
      setErrorForm("Selecciona la fecha del pesaje.");
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        id_lote: Number(idLote),
        fecha: form.fecha,
        peso_obtenido: pesoNum,
        observaciones: form.observaciones.trim(),
      };

      const res = await apiServer("pesos", {
        method: "POST",
        body: payload,
      });

      extraerData(res);
      onCreado();
      onCerrar();
    } catch (err) {
      setErrorForm(err?.message || "No se pudo registrar el peso.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="peso-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-peso"
      onClick={(e) => {
        if (e.target === e.currentTarget && !enviando) onCerrar();
      }}
    >
      <div className="peso-modal">
        <div className="peso-modal-head">
          <div>
            <span className="peso-modal-tag">LOTE #{idLote}</span>
            <h3 id="titulo-modal-peso">Registrar nuevo peso</h3>
          </div>
          <button
            type="button"
            className="peso-modal-close"
            onClick={onCerrar}
            disabled={enviando}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="peso-form">
          <div className="peso-row-2">
            <div className="peso-field">
              <label htmlFor="peso_obtenido">Peso obtenido (kg) *</label>
              <input
                id="peso_obtenido"
                name="peso_obtenido"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="Ej. 1.450"
                value={form.peso_obtenido}
                onChange={handleChange}
                disabled={enviando}
                required
                autoFocus
              />
            </div>

            <div className="peso-field">
              <label htmlFor="fecha_peso">Fecha *</label>
              <input
                id="fecha_peso"
                name="fecha"
                type="date"
                value={form.fecha}
                onChange={handleChange}
                disabled={enviando}
                required
              />
            </div>
          </div>

          <div className="peso-field">
            <label htmlFor="observaciones_peso">Observaciones</label>
            <textarea
              id="observaciones_peso"
              name="observaciones"
              rows={3}
              maxLength={250}
              placeholder="Ej. Muestreo de 20 aves, buena uniformidad..."
              value={form.observaciones}
              onChange={handleChange}
              disabled={enviando}
            />
          </div>

          {errorForm && <div className="peso-form-error">{errorForm}</div>}

          <div className="peso-modal-actions">
            <button
              type="button"
              className="peso-btn-secundario"
              onClick={onCerrar}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="peso-btn-primario"
              disabled={enviando}
            >
              {enviando ? "Guardando..." : "Guardar peso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Pesos({ idLote }) {
  const [pesos, setPesos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarPesos = useCallback(async () => {
    if (!idLote) {
      setCargando(false);
      setError("ID de lote no especificado.");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const res = await apiServer(`pesos/${idLote}`);
      setPesos(extraerLista(res));
    } catch (err) {
      setError(err?.message || "No se pudo obtener el historial de pesos del lote.");
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
          <button
            type="button"
            className="peso-btn-primario"
            onClick={() => setModalAbierto(true)}
            disabled={!idLote}
          >
            + Nuevo peso
          </button>
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
          <button
            type="button"
            className="peso-btn-primario"
            onClick={() => setModalAbierto(true)}
          >
            + Registrar primer peso
          </button>
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

      {modalAbierto && (
        <ModalNuevoPeso
          idLote={idLote}
          onCerrar={() => setModalAbierto(false)}
          onCreado={cargarPesos}
        />
      )}
    </section>
  );
}

export default Pesos;