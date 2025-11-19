import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";
import Header from "../components/Header";

const fmt = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function Intereses() {
  const [principal, setPrincipal] = useState(100);
  const [monthly, setMonthly] = useState(100);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(5);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [frequency, setFrequency] = useState("mensual"); // nueva opción

  const { chartData, fv, contributed, interest } = useMemo(() => {
    const periodsPerYear = frequency === "mensual" ? 12 : 1;
    const n = Math.max(0, Math.round(years * periodsPerYear));
    const r = rate / 100 / periodsPerYear;

    const pow = Math.pow(1 + r, n);
    const payment = frequency === "mensual" ? monthly : monthly * 12; // si es anual, se multiplica por 12

    const fvTotal = (principal || 0) * pow + (payment || 0) * ((pow - 1) / (r || 1));
    const contr = (principal || 0) + (payment || 0) * n;
    const inter = Math.max(0, fvTotal - contr);

    const byYear = [];
    for (let y = 1; y <= Math.max(1, Math.round(years)); y++) {
      const m = y * periodsPerYear;
      const powY = Math.pow(1 + r, m);
      const fvY = (principal || 0) * powY + (payment || 0) * ((powY - 1) / (r || 1));
      const contrY = (principal || 0) + (payment || 0) * m;
      const interY = Math.max(0, fvY - contrY);
      byYear.push({ year: String(y), aporte: contrY, interes: interY, total: fvY });
    }

    return { chartData: byYear, fv: fvTotal, contributed: contr, interest: inter };
  }, [principal, monthly, rate, years, frequency]);

  const clear = () => {
    setPrincipal(); setMonthly(); setRate(); setYears(); setStartDate(new Date().toISOString().slice(0,10)); setFrequency("mensual");
  };

  return (
    <div className="main-content-dashboard">
      <Header />
      <div className="summary-card-dashboard">
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h1 className="greeting-title-elegant-large">Calculadora de Interés Compuesto</h1>
          <p className="greeting-text-dashboard" style={{ maxWidth: '60ch', margin: '0.5rem auto' }}>
            Visualiza cómo pueden crecer tus inversiones con aportes {frequency}es y tasa anual compuesta.
          </p>
        </div>

        <div className="dashboard-grid-dashboard" style={{ marginTop: '2rem' }}>
          <div className="transactions-section-dashboard" style={{ padding: '2rem' }}>
            <div className="form-group-expenses">
              <Field label="Inversión inicial">
                <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="form-input-expenses" placeholder="" />
              </Field>
            </div>
            <div className="form-group-expenses">
              <Field label={`Aportes ${frequency}es`}>
                <input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="form-input-expenses" placeholder="" />
              </Field>
            </div>
            <div className="form-group-expenses">
              <Field label="Tasa de interés anual (%)">
                <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="form-input-expenses" placeholder="" />
              </Field>
            </div>
            <div className="form-group-expenses">
              <Field label="Frecuencia de aportes">
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="form-select-expenses">
                  <option value="mensual">Mensual</option>
                  <option value="anual">Anual</option>
                </select>
              </Field>
            </div>
            <div className="form-group-expenses">
              <Field label="Fecha de inicio">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input-expenses" />
              </Field>
            </div>
            <div className="form-group-expenses">
              <Field label="Años de inversión">
                <div style={{ padding: '0 0.25rem' }}>
                  <input type="range" min={3} max={40} value={years} onChange={(e) => setYears(Number(e.target.value))} style={{ width: '100%' }} />
                  <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>{years} años</div>
                </div>
              </Field>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <button onClick={clear} type="button" className="btn-neutral-dashboard" style={{ flex: 1 }}>Limpiar</button>
              <Link to="/ahorros" className="btn-income-dashboard" style={{ flex: 1 }}>Volver a Ahorros</Link>
            </div>
          </div>

          <div className="chart-section-dashboard">
            <div className="section-header-dashboard">
              <h3 className="section-title-dashboard">Resultados del Cálculo</h3>
            </div>
            <div className="chart-container-dashboard" style={{ height: '420px', background: 'var(--bg-primary)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                  <XAxis dataKey="year" stroke="var(--text-secondary)" />
                  <YAxis tickFormatter={(v) => fmt.format(v)} stroke="var(--text-secondary)" />
                  <Tooltip formatter={(v) => fmt.format(v)} labelFormatter={(l) => `Año ${l}`} contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", borderRadius: 'var(--radius-md)' }} />
                  <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                  <Bar dataKey="aporte" name="Aporte acumulado" stackId="a" fill="#38bdf8" />
                  <Bar dataKey="interes" name="Interés acumulado" stackId="a" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: '0.75rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Aporte acumulado</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{fmt.format(contributed)}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: '0.75rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Interés acumulado</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{fmt.format(interest)}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: '0.75rem', gridColumn: 'span 2' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Valor futuro estimado</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{fmt.format(fv)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label>
      <div className="form-label-expenses">{label}</div>
      {children}
    </label>
  );
}