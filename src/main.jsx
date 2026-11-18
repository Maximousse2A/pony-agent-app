import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import { requireDemoLogin } from "../application/src/login.js";

const host = document.getElementById("root");
requireDemoLogin(host, () => createRoot(host).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
));
