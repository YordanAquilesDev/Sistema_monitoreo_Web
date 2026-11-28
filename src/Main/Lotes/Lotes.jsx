import { useCallback, useEffect, useRef, useState } from "react";
import { apiServer } from "../../utils/apiServer";
import CardLote from "./CardLote";
import General from "./General/General";
import "./Lotes.css";

const obtenerHoyISO = () => new Date().toISOString().split("T")[0];

const FORM_INICIAL = {
    id_galpon: "",
    galpon: "",
    fecha_ingreso: obtenerHoyISO(),
    cantidad_inicial: "",
    precio_pollito_base: "",
    peso_inicial: "",
};

function extraerLista(respuesta) {
    const payload = respuesta?.data ?? respuesta;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.array)) return payload.array;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

function obtenerEtiquetaGalpon(galpon, idx) {
    const id = galpon?.id_galpon ?? galpon?.id ?? idx + 1;
    const base = galpon?.nombre ?? galpon?.galpon ?? `Galpón #${id}`;
    const detalles = [
        galpon?.capacidad != null ? `Cap. ${galpon.capacidad}` : null,
        galpon?.tipo_ventilacion ? galpon.tipo_ventilacion : null,
        galpon?.estado === false ? "Inactivo" : null,
    ].filter(Boolean);

    return detalles.length > 0 ? `${base} (${detalles.join(" · ")})` : base;
}

function construirPayloadLote(form, galponSeleccionado) {
    const cantidadInicial = parseInt(form.cantidad_inicial, 10) || 0;
    const pesoInicial = parseFloat(form.peso_inicial) || 0;
    const idGalponNum = form.id_galpon !== "" ? Number(form.id_galpon) : 0;

    const galponPayload = {
        id_galpon: galponSeleccionado?.id_galpon ?? (Number.isNaN(idGalponNum) ? 0 : idGalponNum),
        capacidad: Number(galponSeleccionado?.capacidad) || 0,
        area: Number(galponSeleccionado?.area) || 0,
        tipo_ventilacion: galponSeleccionado?.tipo_ventilacion ?? "NATURAL",
        estado: galponSeleccionado?.estado ?? true,
    };

    return {
        galpon: galponPayload,
        fecha_ingreso: form.fecha_ingreso || obtenerHoyISO(),
        cantidad_inicial: cantidadInicial,
        cantidad_actual: cantidadInicial,
        precio_pollito_base: parseFloat(form.precio_pollito_base) || 0,
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
    const [cargandoGalpones, setCargandoGalpones] = useState(false);
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
        setForm({ ...FORM_INICIAL, fecha_ingreso: obtenerHoyISO() });
        setGuardando(false);
        document.body.style.overflow = "";
    }, []);

    const cargarGalpones = useCallback(async () => {
        setCargandoGalpones(true);
        try {
            const resGalpones = await apiServer("galpones");
            if (!mountedRef.current) return;
            if (resGalpones && resGalpones.success === false) {
                throw new Error(resGalpones.message || "No se pudieron cargar los galpones.");
            }
            setGalpones(extraerLista(resGalpones));
        } catch (err) {
            if (!mountedRef.current) return;
            console.error("Error al cargar galpones:", err);
            mostrarToast(err.message || "No se pudieron cargar los galpones", true);
        } finally {
            if (mountedRef.current) setCargandoGalpones(false);
        }
    }, [mostrarToast]);

    const abrirModal = async () => {
        setForm({ ...FORM_INICIAL, fecha_ingreso: obtenerHoyISO() });
        setModalAbierto(true);
        document.body.style.overflow = "hidden";

        if (galpones.length === 0) {
            await cargarGalpones();
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

    const manejarSeleccionGalpon = (e) => {
        const valorSeleccionado = e.target.value;
        const galponEncontrado = galpones.find(
            (g, idx) => String(g.id_galpon ?? g.id ?? idx) === valorSeleccionado
        );

        const nombreGalpon = galponEncontrado
            ? (galponEncontrado.nombre ?? galponEncontrado.galpon ?? `Galpón #${galponEncontrado.id_galpon ?? valorSeleccionado}`)
            : "";

        setForm((prev) => ({
            ...prev,
            id_galpon: valorSeleccionado,
            galpon: nombreGalpon,
        }));
    };

    const guardarNuevoLote = async (e) => {
        e.preventDefault();
        const payload = construirPayloadLote(form);
        console.log(payload);

        if (!form.id_galpon || payload.cantidad_inicial <= 0) {
            mostrarToast("Selecciona un galpón e ingresa una cantidad inicial mayor a 0", true);
            return;
        }

        const galponSeleccionado = galpones.find(
            (g, idx) => String(g.id_galpon ?? g.id ?? idx) === String(form.id_galpon)
        );
        if (galponSeleccionado && galponSeleccionado.capacidad > 0 && payload.cantidad_inicial > galponSeleccionado.capacidad) {
            mostrarToast(`La cantidad excede la capacidad del galpón (${galponSeleccionado.capacidad})`, true);
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
                                <label className="form-label" htmlFor="id_galpon">Galpón *</label>
                                <select
                                    id="id_galpon"
                                    name="id_galpon"
                                    className="form-select"
                                    value={form.id_galpon}
                                    onChange={manejarSeleccionGalpon}
                                    disabled={cargandoGalpones}
                                    required
                                    autoFocus
                                >
                                    <option value="">
                                        {cargandoGalpones ? "Cargando galpones..." : "Seleccione un galpón"}
                                    </option>
                                    {galpones.map((g, idx) => {
                                        const valorId = String(g.id_galpon ?? g.id ?? idx);
                                        return (
                                            <option key={valorId} value={valorId}>
                                                {obtenerEtiquetaGalpon(g, idx)}
                                            </option>
                                        );
                                    })}
                                </select>
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