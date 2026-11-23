export default function CardLote({ lote, index = 0, onSeleccionar }) {
  if (!lote) return null;

  const {
    lote_id,
    galpon,
    dias_produccion = 0,
    estado = false,
    precio_pollito_base = 0,
    costo_produccion = 0,
    peso_inicial = 0,
    peso_actual = 0,
    fecha_ingreso,
    muertes = 0,
    cantidad_inicial = 0,
    cantidad_actual = 0,
  } = lote;

  const porcentajeAves =
    cantidad_inicial > 0
      ? Math.max(0, Math.min(100, Math.round((cantidad_actual / cantidad_inicial) * 100)))
      : 0;

  const fechaTexto = fecha_ingreso
    ? new Date(fecha_ingreso).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  return (
    <article
      className="lote-card"
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={() => typeof onSeleccionar === "function" && onSeleccionar(lote)}
    >
      <div className="card-body">
        <div className="card-header-row">
          <span className="card-id">LOTE #{lote_id}</span>
          <span className={`badge ${estado ? "activo" : "inactivo"}`}>
            {estado ? "Activo" : "Inactivo"}
          </span>
        </div>

        <h3 className="card-name">{galpon || "Galpón sin asignar"}</h3>

        <div className="lote-info-grid">
          <div className="info-item">
            <span className="info-label">Días prod.</span>
            <span className="info-value">{dias_produccion} días</span>
          </div>
          <div className="info-item">
            <span className="info-label">Ingreso</span>
            <span className="info-value">{fechaTexto}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Peso actual</span>
            <span className="info-value">{Number(peso_actual).toFixed(3)} kg</span>
          </div>
          <div className="info-item">
            <span className="info-label">Muertes</span>
            <span className="info-value">{Number(muertes).toLocaleString("es-ES")}</span>
          </div>
        </div>

        <div className="lote-aves-section">
          <div className="aves-header">
            <span className="aves-label">
              <strong>{Number(cantidad_actual).toLocaleString("es-ES")}</strong> /{" "}
              {Number(cantidad_inicial).toLocaleString("es-ES")} aves
            </span>
            <span className="porcentaje-texto">{porcentajeAves}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${porcentajeAves}%` }}
            />
          </div>
        </div>

        <div className="lote-costos-row">
          <span>Pollito: S/ {Number(precio_pollito_base).toFixed(2)}</span>
          <span>Costo: S/ {Number(costo_produccion).toFixed(2)}</span>
          <span>Peso ini: {Number(peso_inicial).toFixed(3)} kg</span>
        </div>
      </div>
    </article>
  );
}