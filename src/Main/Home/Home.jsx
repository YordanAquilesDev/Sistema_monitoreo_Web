import { useEffect, useState } from "react";
import { apiServer } from "../../utils/apiServer";
import "./Home.css";

const STATS_INICIALES = {
  galpones: "—",
  lotes: "—",
  eficiencia: "—%",
};

const extraerLista = (data) =>
  Array.isArray(data) ? data : data?.array ?? data?.data ?? [];

function animarValor(onTick, destino, sufijo = "", duracion = 900) {
  const inicio = performance.now();
  let frameId;

  const paso = (ahora) => {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    const ease = 1 - Math.pow(1 - progreso, 3);
    const valor = Math.floor(destino * ease).toLocaleString("es-ES") + sufijo;

    onTick(valor);
    if (progreso < 1) frameId = requestAnimationFrame(paso);
  };

  frameId = requestAnimationFrame(paso);
  return () => cancelAnimationFrame(frameId);
}

function Home({ onNavegar }) {
  const [stats, setStats] = useState(STATS_INICIALES);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    const cancelaciones = [];

    const animarStat = (clave, destino, sufijo = "") => {
      const cancelar = animarValor((valor) => {
        if (activo) setStats((prev) => ({ ...prev, [clave]: valor }));
      }, destino, sufijo);
      cancelaciones.push(cancelar);
    };

    async function cargarStats() {
      try {
        const [resGalpones, resLotes] = await Promise.all([
          apiServer("galpones").catch(() => []),
          apiServer("lotes").catch(() => []),
        ]);

        if (!activo) return;

        const galpones = extraerLista(resGalpones);
        const lotes = extraerLista(resLotes);

        const galponesActivos = galpones.filter((g) => Boolean(g.estado)).length;
        const lotesActivos = lotes.filter(
          (l) => l.estado?.toLowerCase() === "activo"
        ).length;
        const eficiencia =
          lotes.length > 0 ? Math.round((lotesActivos / lotes.length) * 100) : 0;

        animarStat("galpones", galponesActivos);
        animarStat("lotes", lotesActivos);
        animarStat("eficiencia", eficiencia, "%");
      } catch {
        if (!activo) return;
        animarStat("lotes", 48);
        animarStat("eficiencia", 98, "%");
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarStats();

    return () => {
      activo = false;
      cancelaciones.forEach((cancelar) => cancelar());
    };
  }, []);

  const irA = (e, destino) => {
    e.preventDefault();
    onNavegar?.(destino);
  };

  return (
    <div className="home-container">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-decoration hero-deco-1" />
        <div className="hero-decoration hero-deco-2" />
        <div className="hero-content">
          <span className="hero-badge">Control Avícola en Tiempo Real</span>
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
            Ir al dashboard
            <span className="btn-arrow">→</span>
          </a>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <div className={`stats-bar ${cargando ? "is-loading" : ""}`}>
        <div className="stat-bar-item">
          <div className="stat-bar-num" id="stat-galpones">
            {stats.galpones}
          </div>
          <div className="stat-bar-label">Galpones activos</div>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h3>Gestión de Galpones</h3>
            <p>
              Controla capacidad, ventilación y estado de cada galpón en tiempo real.
            </p>
            <span className="feature-link">Ver galpones →</span>
          </a>

          <a
            href="#lotes"
            className="feature-card"
            onClick={(e) => irA(e, "lotes")}
          >
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3>Monitoreo de Lotes</h3>
            <p>
              Seguimiento detallado de pesos, mortalidad y rendimiento por lote.
            </p>
            <span className="feature-link">Ver lotes →</span>
          </a>

          <a
            href="#dashboard"
            className="feature-card"
            onClick={(e) => irA(e, "dashboard")}
          >
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3>Dashboard Inteligente</h3>
            <p>
              Visualiza KPIs, tendencias y toma decisiones basadas en datos.
            </p>
            <span className="feature-link">Ver dashboard →</span>
          </a>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>¿Listo para optimizar tu granja?</h2>
          <p>
            Accede al panel de control y empieza a gestionar tu producción hoy mismo.
          </p>
          <a
            href="#dashboard"
            className="btn-cta"
            onClick={(e) => irA(e, "dashboard")}
          >
            Explorar dashboard →
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