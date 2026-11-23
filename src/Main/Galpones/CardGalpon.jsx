import "./CardGalpon.css";

export default function CardGalpon({ galpon, onSeleccionar }) {
  if (!galpon) return null;

  const idGalpon = galpon.id_galpon ?? galpon.id ?? "";
  const nombre = galpon.nombre?.trim();
  const capacidad = galpon.capacidad ?? 0;
  const area = galpon.area ?? galpon.areaM2 ?? null;
  const tipoVentilacion =
    galpon.tipo_ventilacion ?? galpon.tipoVentilacion ?? "";
  const estaActivo = Boolean(galpon.estado ?? galpon.activo);

  const handleClick = () => {
    if (typeof onSeleccionar === "function") {
      onSeleccionar(galpon);
    }
  };

  const handleKeyDown = (e) => {
    if (!onSeleccionar) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSeleccionar(galpon);
    }
  };

  return (
    <article
      className={`galpon-card ${estaActivo ? "is-activo" : "is-inactivo"}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onSeleccionar ? "button" : undefined}
      tabIndex={onSeleccionar ? 0 : undefined}
    >
      <header className="galpon-card__header">
        <div>
          {nombre && <span className="galpon-card__code">#{idGalpon}</span>}
          <h3>{nombre || `Galpón #${idGalpon}`}</h3>
        </div>
        <span className={`badge ${estaActivo ? "badge--ok" : "badge--off"}`}>
          {estaActivo ? "Activo" : "Inactivo"}
        </span>
      </header>

      <dl className="galpon-card__specs">
        <div>
          <dt>Capacidad</dt>
          <dd>{Number(capacidad).toLocaleString("es-ES")}</dd>
        </div>
        <div>
          <dt>Área</dt>
          <dd>
            {area != null && area !== ""
              ? `${Number(area).toLocaleString("es-ES")} m²`
              : "—"}
          </dd>
        </div>
        <div>
          <dt>Ventilación</dt>
          <dd>{tipoVentilacion || "No especificado"}</dd>
        </div>
      </dl>
    </article>
  );
}