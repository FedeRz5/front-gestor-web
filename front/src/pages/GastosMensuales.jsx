import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import Header from "../components/Header";
import { Chart } from 'chart.js/auto';

// --- Componente Reutilizable para un Gráfico Mensual ---
function MonthlyChart({ monthData }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // --- Cálculos de totales para el mes ---
  const totalGastos = monthData.data.reduce((sum, value) => sum + value, 0);
  const totalIngresos = monthData.ingresos.reduce((sum, value) => sum + value, 0);
  const diferencia = totalIngresos - totalGastos;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    if (chartRef.current && monthData) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: monthData.labels,
          datasets: [
            { label: 'Gastos Diarios', data: monthData.data, borderColor: 'rgba(220, 38, 38, 1)', fill: false, tension: 0.1 },
            { label: 'Ingresos Diarios', data: monthData.ingresos, borderColor: 'rgba(34, 197, 94, 1)', fill: false, tension: 0.1 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { color: '#cbd5e1', callback: (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value) } },
            x: { ticks: { color: '#cbd5e1', maxTicksLimit: 15 } }
          },
          plugins: { legend: { labels: { color: '#f8fafc' } } }
        }
      });
    }

    // Limpieza al desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [monthData]);

  return (
    <div className="summary-card-dashboard" style={{ marginBottom: '2rem' }}>
      <div className="section-header-dashboard">
        <h3 className="section-title-dashboard">Análisis de {monthData.month}</h3>
      </div>
      {/* --- Sección de Totales --- */}
      <div style={{ padding: '0 1.5rem 1rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #334155', marginBottom: '1rem' }}>
        <div>
          <strong>Total Ingresos:</strong>
          <span style={{ color: 'rgba(34, 197, 94, 1)', marginLeft: '8px', fontWeight: 'bold' }}>{formatCurrency(totalIngresos)}</span>
        </div>
        <div>
          <strong>Total Gastos:</strong>
          <span style={{ color: 'rgba(220, 38, 38, 1)', marginLeft: '8px', fontWeight: 'bold' }}>{formatCurrency(totalGastos)}</span>
        </div>
        <div>
          <strong>Balance:</strong>
          <span style={{ color: diferencia >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(220, 38, 38, 1)', marginLeft: '8px', fontWeight: 'bold' }}>{formatCurrency(diferencia)}</span>
        </div>
      </div>
      <div className="chart-container-dashboard" style={{ height: '40vh' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}

// --- Datos de ejemplo para 12 meses ---
const generateMonthlyData = (month, days) => {
  return {
    month,
    labels: Array.from({ length: days }, (_, i) => `Día ${i + 1}`),
    data: Array.from({ length: days }, () => (Math.random() > 0.7 ? Math.random() * 20000 : 0)), // Gastos aleatorios
    ingresos: Array.from({ length: days }, () => (Math.random() > 0.9 ? Math.random() * 150000 : 0)), // Ingresos aleatorios
  };
};

const mockData = [
  generateMonthlyData('Enero', 31), generateMonthlyData('Febrero', 28),
  generateMonthlyData('Marzo', 31), generateMonthlyData('Abril', 30),
  generateMonthlyData('Mayo', 31), generateMonthlyData('Junio', 30),
  generateMonthlyData('Julio', 31), generateMonthlyData('Agosto', 31),
  generateMonthlyData('Septiembre', 30), generateMonthlyData('Octubre', 31),
  generateMonthlyData('Noviembre', 30), generateMonthlyData('Diciembre', 31),
];

export default function GastosMensuales() {
  const navigate = useNavigate();
  const [monthlyDatasets, setMonthlyDatasets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null); // Ref para el canvas
  const chartInstance = useRef(null); // Ref para la instancia del gráfico

  const logout = async () => {
    await api.post("/logout");
    navigate("/login");
  };

  useEffect(() => {
    const fetchGastos = async () => {
      setLoading(true); // Mostrar 'Cargando...' en cada actualización
      try {
        // NOTA: La API debería devolver un array de objetos, donde cada objeto es un mes.
        // ej: [{ month: 'Enero', labels: [...], ... }, { month: 'Febrero', ... }]
        const res = await api.get("/gastos_anuales_detallados"); // Endpoint sugerido
        // Si la API devuelve un array con datos, úsalos.
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setMonthlyDatasets(res.data);
        } else {
          // Si no hay datos reales, usamos los datos de ejemplo (mock).
          console.log("No se encontraron datos en la API, usando datos de ejemplo para 12 meses.");
          setMonthlyDatasets(mockData);
        }
      } catch (err) {
        // Si la API falla, usamos los datos de ejemplo para no bloquear el desarrollo.
        console.error("Error al cargar datos de la API, usando datos de ejemplo:", err);
        setMonthlyDatasets(mockData);
        setError("No se pudo conectar al servidor. Mostrando datos de ejemplo."); // Opcional: un error no bloqueante
      } finally {
        setLoading(false);
      }
    };

    fetchGastos();
  }, []);

  return (
    <div className="main-content-dashboard">
      <Header logout={logout} />
      {loading ? (
        <p>Cargando gráficos...</p>
      ) : monthlyDatasets.length === 0 ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : monthlyDatasets.length > 0 ? (
        monthlyDatasets.map((monthData, index) => (
          <MonthlyChart key={index} monthData={monthData} />
        ))
      ) : (
        <p>No hay datos para mostrar.</p>
      )}
      {error && !loading && (
        <p style={{ color: '#f59e0b', textAlign: 'center', marginTop: '1rem' }}>{error}</p>
      )}
    </div>
  );
}

const [showIngreso, setShowIngreso] = useState(false);
  const [showGasto, setShowGasto] = useState(false);
  const [tipos, setTipos] = useState([]);
  const [gasto, setGasto] = useState({ descripcion: "", monto: "", id_tipo: "" });
  const [ingreso, setIngreso] = useState({ monto: "", descripcion: "" });
  const [selectedDate, setSelectedDate] = useState(null); // Para saber en qué día agregar
  const [error, setError] = useState("");
  useEffect(() => {
    if (showGasto) {
      api.get("/tipos_gasto").then((r) => setTipos(r.data));
    }
  }, [showGasto]);

  const logout = async () => { await api.post("/logout"); navigate("/login"); };
  const submitGasto = async (e) => {
    e.preventDefault();
    setError("");
    // Validación: monto debe ser numérico y mayor a 0
    const montoNum = Number(gasto.monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }
    try {
      await api.post("/agregar_gasto", { 
        descripcion: gasto.descripcion, 
        monto: gasto.monto, 
        id_tipo: gasto.id_tipo,
        fecha: selectedDate?.toISOString() // Enviar fecha seleccionada
      });
      setShowGasto(false);
      setGasto({ descripcion: "", monto: "", id_tipo: "" });
      await fetchTransactions(); // Volver a cargar los eventos
    } catch (err) {
      setError(err?.response?.data?.error || "Error al guardar gasto");
    }
  };

  const submitIngreso = async (e) => {
    e.preventDefault();
    setError("");
    // Validación: monto debe ser numérico y mayor a 0
    const montoNum = Number(ingreso.monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }
    try {
      await api.post("/agregar_ingreso", { 
        monto: ingreso.monto, 
        descripcion: ingreso.descripcion,
        fecha: selectedDate?.toISOString() // Enviar fecha seleccionada
      });
      setShowIngreso(false);
      setIngreso({ monto: "", descripcion: "" });
      await fetchTransactions(); // Volver a cargar los eventos
    } catch (err) {
      setError(err?.response?.data?.error || "Error al guardar ingreso");
    }
  };