import { useCallback, useEffect, useRef, useState } from "react";
import { apiServer } from "../../utils/apiServer";
import CardGalpon from "./CardGalpon";
import "./Galpones.css";

function Galpones() {
  const [listaGalpones, setListaGalpones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    capacidad: "",
    areaM2: "",
    tipoVentilacion: "",
  });

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

  const cargarGalpones = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await apiServer("galpones");
      if (!mountedRef.current) return;
      const items = Array.isArray(data) ? data : (data?.array ?? []);
      setListaGalpones(items);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error("Error al cargar galpones:", err);
      setError(err.message || "No se pudieron obtener los datos.");
    } finally {
      if (mountedRef.current) setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarGalpones();
  }, [cargarGalpones]);

  const abrirModal = () => setModalAbierto(true);

  const cerrarModal = useCallback(() => {
    setModalAbierto(false);
    setForm({ nombre: "", capacidad: "", areaM2: "", tipoVentilacion: "" });
    setGuardando(false);
  }, []);

  useEffect(() => {
    if (!modalAbierto) return;
    const manejarEscape = (e) => {
      if (e.key === "Escape") cerrarModal();
    };
    window.addEventListener("keydown", manejarEscape);
    return () => window.removeEventListener("keydown", manejarEscape);
  }, [modalAbierto, cerrarModal]);

  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    const nombre = form.nombre.trim();
    const capacidad = parseInt(form.capacidad, 10);
    const areaM2 = parseFloat(form.areaM2);
    const tipoVentilacion = form.tipoVentilacion;

    if (!nombre || !capacidad || !areaM2 || !tipoVentilacion) {
      mostrarToast("Completa todos los campos obligatorios", true);
      return;
    }

    setGuardando(true);
    try {
      await apiServer("galpones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, capacidad, areaM2, tipoVentilacion }),
      });

      if (!mountedRef.current) return;
      cerrarModal();
      await cargarGalpones();
      mostrarToast("Galpón creado correctamente");
    } catch (err) {
      if (!mountedRef.current) return;
      console.error("Error al crear galpón:", err);
      mostrarToast("Error al crear el galpón. Intenta de nuevo.", true);
      setGuardando(false);
    }
  };

  const textoContador = cargando
    ? "Cargando..."
    : error
    ? "Error de conexión"
    : listaGalpones.length === 0
    ? "No hay galpones registrados"
    : `${listaGalpones.length} galp${listaGalpones.length === 1 ? "ón" : "ones"} en tu granja`;

  return (
    <main className="main-container">
      {/* ===== TOOLBAR ===== */}
      <div className="toolbar">
        <div className="toolbar-info">
          <h1 className="page-title">Galpones</h1>
          <p className="page-subtitle">{textoContador}</p>
        </div>
        <button type="button" className="btn-nuevo" onClick={abrirModal}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo galpón
        </button>
      </div>

      {/* ===== ESTADO DE CARGA (SKELETON) ===== */}
      {cargando && (
        <div className="skeleton-grid">
          <div className="skeleton-card"><div className="skeleton-img"></div><div className="skeleton-body"></div></div>
          <div className="skeleton-card"><div className="skeleton-img"></div><div className="skeleton-body"></div></div>
          <div className="skeleton-card"><div className="skeleton-img"></div><div className="skeleton-body"></div></div>
        </div>
      )}

      {/* ===== ERROR ===== */}
      {!cargando && error && (
        <div className="estado-vacio">
          <h3>Error al cargar galpones</h3>
          <p>{error}</p>
        </div>
      )}

      {/* ===== ESTADO VACÍO ===== */}
      {!cargando && !error && listaGalpones.length === 0 && (
        <div className="estado-vacio">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <h3>No hay galpones registrados</h3>
          <p>Crea tu primer galpón para comenzar a gestionar tu granja.</p>
        </div>
      )}

      {/* ===== LISTA DE GALPONES ===== */}
      {!cargando && !error && listaGalpones.length > 0 && (
        <div className="cards-grid">
          {listaGalpones.map((galpon, index) => (
            <CardGalpon key={galpon.id ?? index} galpon={galpon} index={index} />
          ))}
        </div>
      )}

      {/* ===== MODAL FORMULARIO ===== */}
      {modalAbierto && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrarModal();
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Crear nuevo galpón</h2>
              <button type="button" className="btn-cerrar-modal" aria-label="Cerrar" onClick={cerrarModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={manejarSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="nombre">Nombre del galpón</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className="form-input"
                  placeholder="Ej: Galpón Norte A"
                  value={form.nombre}
                  onChange={manejarCambioInput}
                  required
                  autoFocus
                  autoComplete="off"
                />
              </div>

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
                    onChange={manejarCambioInput}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="areaM2">Área (m²)</label>
                  <input
                    type="number"
                    step="0.01"
                    id="areaM2"
                    name="areaM2"
                    className="form-input"
                    placeholder="1200.50"
                    min="0.01"
                    value={form.areaM2}
                    onChange={manejarCambioInput}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tipoVentilacion">Tipo de ventilación</label>
                <select
                  id="tipoVentilacion"
                  name="tipoVentilacion"
                  className="form-select"
                  value={form.tipoVentilacion}
                  onChange={manejarCambioInput}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="Natural">Natural</option>
                  <option value="Forzada">Forzada</option>
                  <option value="Mixta">Mixta</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-guardar" disabled={guardando}>
                  {guardando ? (
                    <span className="btn-spinner">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4m0 12v4m-6.36-6.36l2.83 2.83m8.48-8.48l2.83 2.83M2 12h4m12 0h4m-2.83-6.36l-2.83 2.83m-8.48 8.48l-2.83 2.83" />
                      </svg>
                    </span>
                  ) : (
                    <span className="btn-text">Guardar</span>
                  )}
                </button>
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== TOAST ===== */}
      <div className={`toast ${toast.visible ? "show" : ""} ${toast.esError ? "error" : ""}`}>
        <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>{toast.mensaje}</span>
      </div>
    </main>
  );
}

export default Galpones;