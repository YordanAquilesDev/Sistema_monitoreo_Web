import { useCallback, useEffect, useRef, useState } from "react";
import { listarGalpones, registrarGalpon } from "./galponeService";
import CardGalpon from "./CardGalpon";
import "./Galpones.css";

const FORM_INICIAL = {
  capacidad: "",
  area: "",
  tipo_ventilacion: "",
  estado: true,
};

function Galpones() {
  const [galpones, setGalpones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);

  const [toast, setToast] = useState({ visible: false, mensaje: "", esError: false });
  const timerRef = useRef(null);

  const mostrarToast = useCallback((mensaje, esError = false) => {
    clearTimeout(timerRef.current);
    setToast({ visible: true, mensaje, esError });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      setGalpones(await listarGalpones());
    } catch (err) {
      setErrorCarga(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cerrarModal = useCallback(() => {
    setModalAbierto(false);
    setForm(FORM_INICIAL);
    setGuardando(false);
  }, []);

  useEffect(() => {
    if (!modalAbierto) return;
    const onEscape = (e) => e.key === "Escape" && cerrarModal();
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [modalAbierto, cerrarModal]);

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    if (!form.capacidad || !form.area || !form.tipo_ventilacion) {
      mostrarToast("Completa todos los campos obligatorios.", true);
      return;
    }

    setGuardando(true);
    try {
      await registrarGalpon(form);
      cerrarModal();
      await cargar();
      mostrarToast("Galpón registrado correctamente.");
    } catch (err) {
      mostrarToast(err.message || "No se pudo guardar el galpón.", true);
      setGuardando(false);
    }
  };

  const subtitulo = cargando
    ? "Cargando..."
    : errorCarga
    ? "Error al consultar galpones"
    : galpones.length === 0
    ? "No hay galpones registrados"
    : `${galpones.length} galp${galpones.length === 1 ? "ón" : "ones"} en tu granja`;

  return (
    <main className="main-container">
      <div className="toolbar">
        <div className="toolbar-info">
          <h1 className="page-title">Galpones</h1>
          <p className="page-subtitle">{subtitulo}</p>
        </div>
        <button type="button" className="btn-nuevo" onClick={() => setModalAbierto(true)}>
          + Nuevo galpón
        </button>
      </div>

      {cargando && (
        <div className="skeleton-grid">
          <div className="skeleton-card"><div className="skeleton-img" /><div className="skeleton-body" /></div>
          <div className="skeleton-card"><div className="skeleton-img" /><div className="skeleton-body" /></div>
          <div className="skeleton-card"><div className="skeleton-img" /><div className="skeleton-body" /></div>
        </div>
      )}

      {!cargando && errorCarga && (
        <div className="estado-vacio">
          <h3>No se pudieron cargar los galpones</h3>
          <p>{errorCarga}</p>
          <button type="button" className="btn-cancelar" onClick={cargar}>
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !errorCarga && galpones.length === 0 && (
        <div className="estado-vacio">
          <h3>No hay galpones registrados</h3>
          <p>Crea tu primer galpón para comenzar a gestionar tu granja.</p>
        </div>
      )}

      {!cargando && !errorCarga && galpones.length > 0 && (
        <div className="cards-grid">
          {galpones.map((galpon, i) => (
            <CardGalpon key={galpon.id_galpon ?? i} galpon={galpon} index={i} />
          ))}
        </div>
      )}

      {modalAbierto && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && cerrarModal()}
        >
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Crear nuevo galpón</h2>
              <button
                type="button"
                className="btn-cerrar-modal"
                aria-label="Cerrar"
                onClick={cerrarModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={manejarSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="capacidad">Capacidad</label>
                  <input
                    type="number"
                    id="capacidad"
                    name="capacidad"
                    className="form-input"
                    placeholder="5000"
                    min="1"
                    value={form.capacidad}
                    onChange={manejarCambio}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="area">Área (m²)</label>
                  <input
                    type="number"
                    step="0.01"
                    id="area"
                    name="area"
                    className="form-input"
                    placeholder="1200.50"
                    min="0.01"
                    value={form.area}
                    onChange={manejarCambio}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tipo_ventilacion">
                  Tipo de ventilación
                </label>
                <select
                  id="tipo_ventilacion"
                  name="tipo_ventilacion"
                  className="form-select"
                  value={form.tipo_ventilacion}
                  onChange={manejarCambio}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="NATURAL">Natural</option>
                  <option value="FORZADA">Forzada</option>
                  <option value="MIXTA">Mixta</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    name="estado"
                    checked={form.estado}
                    onChange={manejarCambio}
                  />{" "}
                  Galpón activo
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-guardar" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={`toast ${toast.visible ? "show" : ""} ${toast.esError ? "error" : ""}`}>
        <span>{toast.mensaje}</span>
      </div>
    </main>
  );
}

export default Galpones;