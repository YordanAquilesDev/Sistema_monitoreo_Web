import { useRef } from "react";
import "./NavLote.css";

const TABS_LOTE = [
  { id: "general", label: "General" },
  { id: "gastos", label: "Gastos" },
  { id: "kpi", label: "KPI Lote" },
  { id: "pesajes", label: "Pesajes" },
  { id: "registros", label: "Registros" },
  { id: "advertencias", label: "Advertencias" },
  { id: "monitoreo", label: "Monitoreo" },
];

export default function NavLote({
  idLote,
  nombreGalpon,
  tabActiva = "general",
  onCambiarTab,
  onVolver,
}) {
  const tabsRef = useRef([]);

  if (!idLote) {
    return (
      <div className="nav-lote-shell">
        <div className="nav-lote-inner">
          <span className="nav-lote-error">ID de lote no especificado</span>
        </div>
      </div>
    );
  }

  const seleccionarTab = (id) => {
    if (typeof onCambiarTab === "function") {
      onCambiarTab(id);
    }
  };

  const manejarTeclado = (e, index) => {
    const total = TABS_LOTE.length;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const siguiente = (index + 1) % total;
      tabsRef.current[siguiente]?.focus();
      seleccionarTab(TABS_LOTE[siguiente].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const anterior = (index - 1 + total) % total;
      tabsRef.current[anterior]?.focus();
      seleccionarTab(TABS_LOTE[anterior].id);
    }
  };

  return (
    <header className="nav-lote-shell">
      <div className="nav-lote-inner">
        <div className="nav-lote-contexto">
          {typeof onVolver === "function" && (
            <button
              type="button"
              className="nav-lote-volver"
              onClick={onVolver}
              title="Volver al listado de lotes"
            >
              <span aria-hidden="true">←</span>
              <span>Lotes</span>
            </button>
          )}

          <div className="nav-lote-badge">
            <span className="nav-lote-id">#{idLote}</span>
            {nombreGalpon && (
              <span className="nav-lote-galpon">{nombreGalpon}</span>
            )}
          </div>
        </div>

        <nav
          className="nav-lote-track"
          role="tablist"
          aria-label="Secciones del lote"
        >
          {TABS_LOTE.map((tab, index) => {
            const activa = tabActiva === tab.id;
            const esAdvertencia = tab.id === "advertencias";

            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabsRef.current[index] = el;
                }}
                type="button"
                role="tab"
                aria-selected={activa}
                tabIndex={activa ? 0 : -1}
                className={[
                  "nav-lote-tab",
                  activa ? "is-active" : "",
                  esAdvertencia ? "is-warning" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => seleccionarTab(tab.id)}
                onKeyDown={(e) => manejarTeclado(e, index)}
              >
                {esAdvertencia && <span className="nav-lote-dot" aria-hidden="true" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}