import React from "react";

const API_BASE = "http://localhost:4002";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // import Tailwind CSS

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
