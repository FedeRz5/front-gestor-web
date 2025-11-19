import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import Header from "../components/Header";

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// --------- Helpers de fechas ---------
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();       // 0 = dom
  const diff = d.getDate() - day; // ir al domingo
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatRangeWeek(weekStart) {
  const end = addDays(weekStart, 6);
  const opts = { day: "numeric", month: "short" };
  const optsWithYear = { day: "numeric", month: "short", year: "numeric" };

  const sameMonth =
    weekStart.getMonth() === end.getMonth() &&
    weekStart.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${weekStart.toLocaleDateString("es-AR", { day: "numeric" })} – ${end.toLocaleDateString("es-AR", optsWithYear)}`;
  }
  return `${weekStart.toLocaleDateString("es-AR", opts)} – ${end.toLocaleDateString("es-AR", optsWithYear)}`;
}

// --------- Componente principal ---------
export default function Calendario() {
  const navigate = useNavigate();
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date())
  );
  const [events, setEvents] = useState([]);

  const fetchTransactions = async () => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1; // getMonth es 0-11

      const res = await api.get(`/calendar_expenses?year=${year}&month=${month}`);

      const transactionEvents = res.data.map(tx => {
        const baseEvent = {
          id: `${tx.tipo}-${tx.id_transaccion}`,
          start: new Date(tx.fecha),
          end: new Date(new Date(tx.fecha).getTime() + 60 * 60 * 1000), // 1 hora duración
          type: tx.tipo,
        };

        if (tx.tipo === 'ingreso') {
          return {
            ...baseEvent,
            title: `${tx.descripcion || 'Ingreso'} ($${tx.monto})`,
            className: 'calendar-event-ingreso', // Clase para ingresos (verde)
          };
        } else { // gasto
          return {
            ...baseEvent,
            title: `${tx.descripcion || 'Gasto'} ($${tx.monto})`,
            className: 'calendar-event-gasto', // Clase para gastos (rojo/azul)
          };
        }
      });

      setEvents(transactionEvents);
    } catch (error) {
      console.error("Error al cargar las transacciones en el calendario:", error);
    }
  };
  // Cargar gastos como eventos
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Estados y lógica para los modales del Header
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

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  // Al hacer clic en una columna de día, preguntar qué agregar
  const handleDayClick = (day) => {
    const action = window.prompt("¿Qué deseas agregar en este día?\n1. Gasto\n2. Ingreso");
    if (action === "1") {
      setSelectedDate(day);
      setShowGasto(true);
    } else if (action === "2") {
      setSelectedDate(day);
      setShowIngreso(true);
    }
  };

  // Placeholder para editar/borrar evento (se puede implementar después)
  const handleEventClick = (event) => {
    const action = window.prompt(
      `Evento: "${event.title}"\n\nEscribe:\n1 para editar título\n2 para borrar\n\nCualquier otra cosa para cancelar`
    );

    if (action === "1") {
      const newTitle = window.prompt("Nuevo título:", event.title);
      if (!newTitle) return;
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, title: newTitle } : e))
      );
    } else if (action === "2") {
      if (!window.confirm("¿Seguro que querés eliminar este evento?")) return;
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    }
  };

  const goPrevWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const goNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const goToday = () => {
    setCurrentWeekStart(startOfWeek(new Date()));
  };

  // Filtrar eventos que caen en esta semana
  const weekEvents = events.filter((e) =>
    weekDays.some((d) => sameDay(d, e.start))
  );

  return (
    <div className="main-content-dashboard">
      <Header
        setShowIngreso={setShowIngreso}
        setShowGasto={setShowGasto}
        logout={logout}
      />
      <div className="calendar-wrapper">
        {/* Header del Calendario */}
        <div className="calendar-header">
          <div className="calendar-title">
            <h2>Calendario</h2>
            <span className="calendar-week-range">
              {formatRangeWeek(currentWeekStart)}
            </span>
          </div>
          <div className="calendar-controls">
            <button onClick={goToday}>Hoy</button>
            <button onClick={goPrevWeek} aria-label="Semana anterior">
              ◀
            </button>
            <button onClick={goNextWeek} aria-label="Semana siguiente">
              ▶
            </button>
          </div>
        </div>

        {/* Encabezado de días */}
        <div className="calendar-days-header">
          <div className="calendar-days-header-hour-col" />
          {weekDays.map((day, index) => {
            const isToday = sameDay(day, new Date());
            return (
              <div
                key={index}
                className={`calendar-day-header ${isToday ? "today" : ""}`}
              >
                <div className="calendar-day-name">{DAYS[index]}</div>
                <div className="calendar-day-number">
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid principal */}
        <div className="calendar-grid">
          {/* Columnas de días */}
          <div className="calendar-days-grid">
            {weekDays.map((day, dayIndex) => (
              <div 
                key={dayIndex} 
                className="calendar-day-column"
                onClick={() => handleDayClick(day)}
              >
                {/* Eventos de este día */}
                {(() => {
                  const dayEvents = weekEvents
                    .filter((event) => sameDay(event.start, day))
                    .sort((a, b) => a.start - b.start);

                  if (dayEvents.length === 0) {
                    return (
                      <div className="calendar-day-empty">
                        <span>+</span>
                      </div>
                    );
                  }

                  return dayEvents.map((event) => {
                    return (
                      <div
                        key={event.id}
                        className={`calendar-event ${event.className || ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        <div className="calendar-event-title">
                          {event.title}
                        </div>
                        <div className="calendar-event-time">
                          {event.start.toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modales (copiados de Dashboard/Detalle para consistencia) */}
      {showGasto && (
        <div className="modal-expenses" style={{ display: "flex" }}>
          <div className="modal-content-expenses">
            <div className="modal-header-expenses">
              <h3 className="modal-title-expenses">Agregar Gasto</h3>
              <a className="modal-close-expenses" onClick={() => setShowGasto(false)} href="#">×</a>
            </div>
            <form className="modal-form-expenses" onSubmit={submitGasto}>
              <div className="form-group-expenses">
                <label className="form-label-expenses">Descripción</label>
                <input
                  className="form-input-expenses"
                  value={gasto.descripcion}
                  onChange={(e) => setGasto({ ...gasto, descripcion: e.target.value })}
                />
              </div>
              <div className="form-group-expenses">
                <label className="form-label-expenses">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input-expenses"
                  value={gasto.monto}
                  onChange={(e) => setGasto({ ...gasto, monto: e.target.value })}
                />
              </div>
              <div className="form-group-expenses">
                <label className="form-label-expenses">Categoría</label>
                <select
                  className="form-select-expenses"
                  value={gasto.id_tipo}
                  onChange={(e) => setGasto({ ...gasto, id_tipo: e.target.value })}
                >
                  <option value="">Seleccione</option>
                  {tipos.map((t) => (
                    <option key={t.id_tipo} value={t.id_tipo}>{t.nombre_tipo}</option>
                  ))}
                </select>
              </div>
              {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
              <button className="submit-button-expenses" type="submit">Guardar</button>
            </form>
          </div>
        </div>
      )}

      {showIngreso && (
        <div className="modal-expenses" style={{ display: "flex" }}>
          <div className="modal-content-expenses">
            <div className="modal-header-expenses">
              <h3 className="modal-title-expenses">Agregar Ingreso</h3>
              <a className="modal-close-expenses" onClick={() => setShowIngreso(false)} href="#">×</a>
            </div>
            <form className="modal-form-expenses" onSubmit={submitIngreso}>
              <div className="form-group-expenses">
                <label className="form-label-expenses">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input-expenses"
                  value={ingreso.monto}
                  onChange={(e) => setIngreso({ ...ingreso, monto: e.target.value })}
                />
              </div>
              <div className="form-group-expenses">
                <label className="form-label-expenses">Descripción</label>
                <input
                  className="form-input-expenses"
                  value={ingreso.descripcion || ""}
                  onChange={(e) => setIngreso({ ...ingreso, descripcion: e.target.value })}
                />
              </div>
              {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
              <button className="submit-button-expenses" type="submit">Guardar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}