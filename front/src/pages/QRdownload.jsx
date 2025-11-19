// src/pages/QRDownload.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";

export default function QRDownload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [totales, setTotales] = useState({ ingresos: 0, egresos: 0, disponible: 0 });

  const loadSummary = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const r = await api.get("/summary"); 
      const ok =
        r && r.data && typeof r.data === "object" && r.data.totales
          ? r.data.totales
          : { ingresos: 0, egresos: 0, disponible: 0 };
      setTotales(ok);
    } catch (e) {
      console.error("Error cargando resumen", e);
      setLoadError(e?.response?.data?.error || "No se pudo cargar el resumen");
      if (
        e?.response?.status === 401 ||
        (e?.response?.data?.error || "").toLowerCase().includes("no autenticado")
      ) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Cargando...</div>;
  if (loadError) return <div style={{ padding: 20 }}>Error: {loadError}</div>;

  return (
    <div className="main-content-dashboard">
      {/* ✅ Nuevo HEADER unificado */}
      <Header />

      {/* Tira superior con totales */}
      <section className="summary-card-dashboard">
        <div className="summary-content-dashboard" style={{ alignItems: "center" }}>
          <div className="summary-center-dashboard" style={{ textAlign: "center", gridColumn: "1 / -1" }}>
            <div
              className="available-amount-dashboard"
              style={{
                color: totales.disponible < 0 ? "var(--danger-400)" : "inherit",
              }}
            >
              Disponible: ${Number(totales.disponible).toFixed(2)}
            </div>
            <div className="monthly-stats-dashboard">
              <div>Ingresos mensuales: ${Number(totales.ingresos).toFixed(2)}</div>
              <div>Egresos mensuales: ${Number(totales.egresos).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de QR grande + copy */}
      <section className="qr-hero-section" style={{ marginTop: 16 }}>
        <div className="qr-hero-grid">
          <div className="qr-hero-code" aria-hidden />
          <div className="qr-hero-copy">
            <h2 className="section-title-dashboard center">
              ¿Querés escanear tus tickets para poder subir<br />automáticamente tus gastos o ingresos?
            </h2>
            <h3 className="center">Escaneá el qr y descargá nuestra app Ge$tor</h3>
            <p className="center" style={{ color: "#6b7280" }}>
              Disponible para App Store y Google Play
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
