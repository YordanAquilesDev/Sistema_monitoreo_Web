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
  tabActiva = "general",
  onCambiarTab,
  onVolver,
}) {
  if (!idLote) {
    return (
      <div className="lote-tabs-container">
        <div className="lote-tabs">
          <span className="tab-error">ID de lote no especificado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="lote-tabs-container">
      <div className="lote-tabs-wrapper">
        {typeof onVolver === "function" && (
          <button
            type="button"
            className="btn-volver-lotes"
            onClick={onVolver}
          >
            ← Lotes
          </button>
        )}

        <nav className="lote-tabs" aria-label="Secciones del lote">
          {TABS_LOTE.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`lote-tab ${tabActiva === tab.id ? "active" : ""}`}
              onClick={() =>
                typeof onCambiarTab === "function" && onCambiarTab(tab.id)
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}