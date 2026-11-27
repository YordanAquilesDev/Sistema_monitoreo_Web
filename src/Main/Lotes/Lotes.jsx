import { useCallback, useEffect, useRef, useState } from "react";
import { apiServer } from "../../utils/apiServer";
import CardLote from "./CardLote";
import General from "./General/General";
import "./Lotes.css";

const FORM_INICIAL = {
    lote_id: "",
    galpon: "",
    fecha_ingreso: "",
    cantidad_inicial: "",
    precio_pollito_base: "",
    costo_produccion: "",
    peso_inicial: "",
};

const obtenerHoyISO = () => new Date().toISOString().split("T")[0];

function extraerLista(respuesta) {
    const payload = respuesta?.data ?? respuesta;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.array)) return payload.array;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

function construirPayloadLote(form) {
    const cantidadInicial = parseInt(form.cantidad_inicial, 10) || 0;
    const pesoInicial = parseFloat(form.peso_inicial) || 0;

    return {
        lote_id: Number.isNaN(Number(form.lote_id.trim()))
            ? form.lote_id.trim()
            : Number(form.lote_id.trim()),
        galpon: form.galpon.trim(),
        fecha_ingreso: form.fecha_ingreso,
        cantidad_inicial: cantidadInicial,
        cantidad_actual: cantidadInicial,
        precio_pollito_base: parseFloat(form.precio_pollito_base) || 0,
        costo_produccion: parseFloat(form.costo_produccion) || 0,
        peso_inicial: pesoInicial,
        peso_actual: pesoInicial,
        estado: true,
    };
}

export default function Lotes() {
    const [listaLotes, setListaLotes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [galpones, setGalpones] = useState([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [form, setForm] = useState(FORM_INICIAL);
    const [loteSeleccionado, setLoteSeleccionado] = useState(null);

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
            document.body.style.overflow = "";
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

    const cargarLotes = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const respuesta = await apiServer("lotes");
            if (!mountedRef.current) return;
            if (respuesta && respuesta.success === false) {
                throw new Error(respuesta.message || "No se pudieron obtener los lotes.");
            }
            setListaLotes(extraerLista(respuesta));
        } catch (err) {
            if (!mountedRef.current) return;
            console.error("Error al cargar lotes:", err);
            setError(err.message || "No se pudieron obtener los lotes.");
        } finally {
            if (mountedRef.current) setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarLotes();
    }, [cargarLotes]);

    const cerrarModal = useCallback(() => {
        setModalAbierto(false);
        setForm(FORM_INICIAL);
        setGuardando(false);
        document.body.style.overflow = "";
    }, []);

    const abrirModal = async () => {
        setForm({ ...FORM_INICIAL, fecha_ingreso: obtenerHoyISO() });
        setModalAbierto(true);
        document.body.style.overflow = "hidden";

        if (galpones.length > 0) return;

        try {
            const resGalpones = await apiServer("galpones");
            if (!mountedRef.current) return;
            setGalpones(extraerLista(resGalpones));
        } catch (err) {
            console.error("Error al cargar galpones:", err);
        }
    };

    useEffect(() => {
        if (!modalAbierto) return;
        const manejarEscape = (e) => {
            if (e.key === "Escape") cerrarModal();
        };
        window.addEventListener("keydown", manejarEscape);
        return () => window.removeEventListener("keydown", manejarEscape);
    }, [modalAbierto, cerrarModal]);

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const guardarNuevoLote = async (e) => {
        e.preventDefault();
        const payload = construirPayloadLote(form);

        if (!form.lote_id.trim() || !payload.galpon || payload.cantidad_inicial <= 0) {
            mostrarToast("Completa ID de lote, galpón y una cantidad inicial mayor a 0", true);
            return;
        }

        setGuardando(true);
        try {
            const respuesta = await apiServer("lotes/nuevo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!mountedRef.current) return;
            if (respuesta && respuesta.success === false) {
                throw new Error(respuesta.message || "No se pudo guardar el lote");
            }

            cerrarModal();
            await cargarLotes();
            mostrarToast(respuesta?.message || "Lote registrado correctamente");
        } catch (err) {
            if (!mountedRef.current) return;
            console.error("Error al guardar lote:", err);
            mostrarToast(err.message || "No se pudo guardar el lote", true);
            setGuardando(false);
        }
    };

    const handleSeleccionar = (lote) => setLoteSeleccionado(lote);
    const handleVolver = () => setLoteSeleccionado(null);

    if (loteSeleccionado) {
        return <General idLote={loteSeleccionado.lote_id} onVolver={handleVolver} />;
    }

    const textoContador = cargando
        ? "Cargando..."
        : error
            ? "Error de conexión"
            : listaLotes.length === 0
                ? "No hay lotes registrados"
                : `${listaLotes.length} ${listaLotes.length === 1 ? "lote" : "lotes"} en monitoreo`;

    return (
        <main className="main-container">
            <div className="toolbar">
                <div className="toolbar-info">
                    <h1 className="page-title">Monitoreo de Lotes</h1>
                    <p className="page-subtitle">{textoContador}</p>
                </div>
                <button type="button" className="btn-nuevo" onClick={abrirModal}>
                    <svg
                        className="icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nuevo lote
                </button>
            </div>

            {cargando && (
                <div className="skeleton-grid">
                    <div className="skeleton-card"><div className="skeleton-body" /></div>
                    <div className="skeleton-card"><div className="skeleton-body" /></div>
                    <div className="skeleton-card"><div className="skeleton-body" /></div>
                </div>
            )}

            {!cargando && error && (
                <div className="estado-vacio">
                    <h3>Error al cargar lotes</h3>
                    <p>{error}</p>
                    <button type="button" className="btn-nuevo" onClick={cargarLotes}>
                        Reintentar
                    </button>
                </div>
            )}

            {!cargando && !error && listaLotes.length === 0 && (
                <div className="estado-vacio">
                    <h3>No hay lotes registrados</h3>
                    <p>Crea tu primer lote para comenzar el monitoreo.</p>
                </div>
            )}

            {!cargando && !error && listaLotes.length > 0 && (
                <div className="cards-container">
                    {listaLotes.map((lote, index) => (
                        <CardLote
                            key={lote.lote_id ?? index}
                            lote={lote}
                            index={index}
                            onSeleccionar={handleSeleccionar}
                        />
                    ))}
                </div>
            )}

            {modalAbierto && (
                <div
                    className="modal-overlay"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) cerrarModal();
                    }}
                >
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Registrar nuevo lote</h2>
                            <button
                                type="button"
                                className="btn-cerrar-modal"
                                aria-label="Cerrar"
                                onClick={cerrarModal}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form className="form-grid" onSubmit={guardarNuevoLote}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="lote_id">Código / ID lote *</label>
                                <input
                                    type="text"
                                    id="lote_id"
                                    name="lote_id"
                                    className="form-input"
                                    placeholder="Ej. 101 o LOTE-001"
                                    value={form.lote_id}
                                    onChange={manejarCambio}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="galpon">Galpón *</label>
                                {galpones.length > 0 ? (
                                    <select
                                        id="galpon"
                                        name="galpon"
                                        className="form-select"
                                        value={form.galpon}
                                        onChange={manejarCambio}
                                        required
                                    >
                                        <option value="">Seleccione un galpón</option>
                                        {galpones.map((g, idx) => {
                                            const nombreGalpon = g.nombre ?? g.galpon ?? `Galpón ${idx + 1}`;
                                            return (
                                                <option key={g.id ?? g.id_galpon ?? idx} value={nombreGalpon}>
                                                    {nombreGalpon}
                                                </option>
                                            );
                                        })}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        id="galpon"
                                        name="galpon"
                                        className="form-input"
                                        placeholder="Ej. Galpón Norte A"
                                        value={form.galpon}
                                        onChange={manejarCambio}
                                        required
                                    />
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="cantidad_inicial">Cantidad inicial *</label>
                                <input
                                    type="number"
                                    id="cantidad_inicial"
                                    name="cantidad_inicial"
                                    className="form-input"
                                    min="1"
                                    placeholder="5000"
                                    value={form.cantidad_inicial}
                                    onChange={manejarCambio}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="fecha_ingreso">Fecha de ingreso *</label>
                                <input
                                    type="date"
                                    id="fecha_ingreso"
                                    name="fecha_ingreso"
                                    className="form-input"
                                    value={form.fecha_ingreso}
                                    onChange={manejarCambio}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="precio_pollito_base">Precio pollito (S/)</label>
                                <input
                                    type="number"
                                    id="precio_pollito_base"
                                    name="precio_pollito_base"
                                    className="form-input"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={form.precio_pollito_base}
                                    onChange={manejarCambio}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="costo_produccion">Costo producción (S/)</label>
                                <input
                                    type="number"
                                    id="costo_produccion"
                                    name="costo_produccion"
                                    className="form-input"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={form.costo_produccion}
                                    onChange={manejarCambio}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label" htmlFor="peso_inicial">Peso inicial (kg)</label>
                                <input
                                    type="number"
                                    id="peso_inicial"
                                    name="peso_inicial"
                                    className="form-input"
                                    step="0.001"
                                    min="0"
                                    placeholder="0.042"
                                    value={form.peso_inicial}
                                    onChange={manejarCambio}
                                />
                            </div>

                            <div className="modal-footer full-width">
                                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-guardar" disabled={guardando}>
                                    {guardando ? "Guardando..." : "Guardar lote"}
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