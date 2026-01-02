import { createRoot } from "react-dom/client";
import MainRouter from "./MainRouter";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <MainRouter />
);
