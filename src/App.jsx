import { useState } from "react";
import Header from "./utils/Header";
import Home from "./Main/Home/Home";
import Galpones from "./Main/Galpones/Galpones";
import Lotes from "./Main/Lotes/Lotes";
import { probarPost } from "./utils/apiServer";

export default function App() {
  const [seccion, setSeccion] = useState("home");
  probarPost();
  return (
    <>
      <Header seccionActiva={seccion} onNavegar={setSeccion} />

      <main className="contenido">
        {seccion === "home" && <Home onNavegar={setSeccion} />}
        {seccion === "galpones" && <Galpones />}
        {seccion === "lotes" && <Lotes/>}
       
      </main>
    </>
  );
}