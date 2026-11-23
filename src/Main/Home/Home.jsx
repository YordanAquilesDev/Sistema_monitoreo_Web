import { useEffect, useState } from "react";
import { apiServer } from "../../utils/apiServer";
import "./Home.css";

function Home({ onNavegar }) {
    const [stats, setStats] = useState({
        galpones: "—",
        lotes: "—",
        eficiencia: "—%",
    });

    useEffect(() => {
        let active = true;
        const frameIds = [];

        const animarNumero = (clave, destino, sufijo = "", duracion = 1200) => {
            const inicioTiempo = performance.now();

            const actualizar = (tiempoActual) => {
                if (!active) return;
                const transcurrido = tiempoActual - inicioTiempo;
                const progreso = Math.min(transcurrido / duracion, 1);
                const easeOut = 1 - Math.pow(1 - progreso, 3);
                const actual = Math.floor(destino * easeOut);

                setStats((prev) => ({
                    ...prev,
                    [clave]: actual.toLocaleString("es-ES") + sufijo,
                }));

                if (progreso < 1) {
                    const id = requestAnimationFrame(actualizar);
                    frameIds.push(id);
                }
            };

            const id = requestAnimationFrame(actualizar);
            frameIds.push(id);
        };

        const extraerLista = (data) => {
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.array)) return data.array;
            if (Array.isArray(data?.data)) return data.data;
            return [];
        };

        async function cargarStats() {
            try {
                const [resGalpones, resLotes] = await Promise.all([
                    Promise.resolve(apiServer("galpones")).catch(() => []),
                    Promise.resolve(apiServer("lotes")).catch(() => []),
                ]);

                if (!active) return;
                console.log(resGalpones);
                const galpones = extraerLista(resGalpones);
                const lotes = extraerLista(resLotes);
               

                const galponesActivos = galpones.filter((g) => Boolean(g.estado)).length;
                 console.log("GalPONES" +galponesActivos);

                const lotesActivos = null//lotes.filter(
              //      (l) => l.estado?.toLowerCase() === "activo"
             //   ).length;

                const eficiencia =
                    lotes.length > 0
                        ? Math.round((lotesActivos / lotes.length) * 100)
                        : 0;

                animarNumero("galpones", galponesActivos);
                animarNumero("lotes", lotesActivos);
                animarNumero("eficiencia", eficiencia, "%");
            } catch (error) {
                console.log("Stats estáticas (API no disponible)", error);
                if (!active) return;

                animarNumero("lotes", 48);
                animarNumero("eficiencia", 98, "%");
            }
        }

        cargarStats();

        return () => {
            active = false;
            frameIds.forEach((id) => cancelAnimationFrame(id));
        };
    }, []);

    const irA = (e, destino) => {
        e.preventDefault();
        if (typeof onNavegar === "function") {
            onNavegar(destino);
        }
    };

    return (
        <div className="home-container">
            {/* ===== HERO ===== */}
            <section className="hero">
                <div className="hero-decoration hero-deco-1"></div>
                <div className="hero-decoration hero-deco-2"></div>
                <div className="hero-content">
                    <h1>Gestión Avícola Profesional</h1>
                    <p>
                        Monitoreo completo, control de galpones y seguimiento de lotes con
                        máxima frescura y calidad.
                    </p>
                    <a
                        href="#dashboard"
                        className="btn-hero"
                        onClick={(e) => irA(e, "dashboard")}
                    >
                        <svg
                            className="icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        Ir al dashboard
                    </a>
                </div>
            </section>

            {/* ===== STATS BAR ===== */}
            <div className="stats-bar">
                <div className="stat-bar-item">
                    <div className="stat-bar-num" id="stat-galpones">
                        {stats.galpones}
                    </div>
                    <div className="stat-bar-label">Galpones</div>
                </div>
                <div className="stat-bar-item">
                    <div className="stat-bar-num" id="stat-lotes">
                        {stats.lotes}
                    </div>
                    <div className="stat-bar-label">Lotes activos</div>
                </div>
                <div className="stat-bar-item">
                    <div className="stat-bar-num" id="stat-eficiencia">
                        {stats.eficiencia}
                    </div>
                    <div className="stat-bar-label">Eficiencia</div>
                </div>
            </div>

            {/* ===== FEATURES ===== */}
            <section className="features">
                <div className="section-header">
                    <h2>Todo bajo control</h2>
                    <p className="subtitle">
                        Gestiona cada etapa de tu producción avícola desde un solo lugar.
                    </p>
                </div>

                <div className="cards-container">
                    <a
                        href="#galpones"
                        className="feature-card"
                        onClick={(e) => irA(e, "galpones")}
                    >
                        <div className="feature-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </div>
                        <h3>Gestión de Galpones</h3>
                        <p>
                            Controla capacidad, ventilación y estado de cada galpón en tiempo
                            real.
                        </p>
                        <span className="feature-link">
                            Ver galpones
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </span>
                    </a>

                    <a
                        href="#lotes"
                        className="feature-card"
                        onClick={(e) => irA(e, "lotes")}
                    >
                        <div className="feature-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                        </div>
                        <h3>Monitoreo de Lotes</h3>
                        <p>
                            Seguimiento detallado de pesos, mortalidad y rendimiento por lote.
                        </p>
                        <span className="feature-link">
                            Ver lotes
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </span>
                    </a>

                    <a
                        href="#dashboard"
                        className="feature-card"
                        onClick={(e) => irA(e, "dashboard")}
                    >
                        <div className="feature-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                                <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                        </div>
                        <h3>Dashboard Inteligente</h3>
                        <p>
                            Visualiza KPIs, tendencias y toma decisiones basadas en datos.
                        </p>
                        <span className="feature-link">
                            Ver dashboard
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </span>
                    </a>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>¿Listo para optimizar tu granja?</h2>
                    <p>
                        Accede al panel de control y empieza a gestionar tu producción hoy
                        mismo.
                    </p>
                    <a
                        href="#dashboard"
                        className="btn-cta"
                        onClick={(e) => irA(e, "dashboard")}
                    >
                        <svg
                            className="icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        Explorar dashboard
                    </a>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="footer">
                <p>© 2026 Avícola — Sistema de gestión profesional</p>
            </footer>
        </div>
    );
}

export default Home;