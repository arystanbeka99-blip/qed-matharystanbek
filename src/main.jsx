import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Регистрация Service Worker — обязательное условие, чтобы сайт
// можно было "установить" как приложение (PWA), в том числе через TWA
// на пути в Google Play.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("Service Worker не зарегистрирован:", err.message);
    });
  });
}
