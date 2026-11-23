import "./Header.css"
function Header({ seccionActiva = "home", onNavegar }) {
  const enlaces = [
    { id: "home", label: "Inicio" },
    { id: "galpones", label: "Galpones" },
    { id: "lotes", label: "Lotes" },
    { id: "dashboard", label: "Dashboard" },
  ];

  const manejarClick = (e, idDestino) => {
    e.preventDefault();
    if (typeof onNavegar === "function") {
      onNavegar(idDestino);
    }
  };

  return (
    <header className="header">
      <div
        className="logo"
        onClick={(e) => manejarClick(e, "home")}
        style={{ cursor: "pointer" }}
      >
        <svg
          className="logo-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
          <path d="M12 6v6l4 2" />
        </svg>
        <span>Avícola</span>
      </div>

      <nav className="nav" aria-label="Navegación principal">
        {enlaces.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={seccionActiva === item.id ? "active" : ""}
            onClick={(e) => manejarClick(e, item.id)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export default Header;