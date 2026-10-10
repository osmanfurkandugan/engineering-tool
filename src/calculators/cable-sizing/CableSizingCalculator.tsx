import { useState } from 'react';
import { CalculatorShell } from '../../components/CalculatorShell';
import { isPositiveNumber } from '../../shared/validation';
import { calculateCableSizing } from './engine';

export function CableSizingCalculator() {
  const [form, setForm] = useState({
    loadCurrent: 32,
    conductors: '3',
    method: 'B1',
    temp: '30',
    group: '1',
    material: 'Cu',
  });

  const [result, setResult] = useState<{ section: number; iz: number; utilization: number } | null>(null);
  const [status, setStatus] = useState<'pass' | 'fail' | null>(null);

  const handleCalculate = () => {
    const value = Number(form.loadCurrent);
    if (!isPositiveNumber(value)) {
      alert('Please enter a valid load current.');
      return;
    }

    const computed = calculateCableSizing({
      loadCurrent: value,
      conductors: form.conductors as '2' | '3',
      method: form.method as 'A1' | 'B1' | 'C',
      temp: form.temp,
      group: form.group,
      material: form.material as 'Cu' | 'Al',
    });

    if (!computed) {
      alert('Please enter a valid load current.');
      return;
    }

    if (!computed.valid) {
      setResult(null);
      setStatus('fail');
      return;
    }

    setResult({ section: computed.section, iz: computed.iz, utilization: computed.utilization });
    setStatus('pass');
  };

  return (
    <CalculatorShell title="Cable Sizing Calculator" subtitle="Minimum Cross-Section by Current-Carrying Capacity (IEC 60364-5-52)">
      <div className="form-section">
        <div className="form-group">
          <label>Design Load Current (Ib)</label>
          <div className="input-wrapper">
            <input type="number" value={form.loadCurrent} onChange={(e) => setForm((prev) => ({ ...prev, loadCurrent: Number(e.target.value) }))} />
            <span className="unit">A</span>
          </div>
        </div>

        <div className="row">
          <div className="form-group">
            <label>Circuit Type</label>
            <select value={form.conductors} onChange={(e) => setForm((prev) => ({ ...prev, conductors: e.target.value }))}>
              <option value="3">3-phase (3 loaded conductors)</option>
              <option value="2">Single-phase (2 loaded conductors)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Conductor Material</label>
            <select value={form.material} onChange={(e) => setForm((prev) => ({ ...prev, material: e.target.value }))}>
              <option value="Cu">Copper (Cu)</option>
              <option value="Al">Aluminum (Al)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Installation Method (IEC Reference Method)</label>
          <select value={form.method} onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))}>
            <option value="A1">A1 — Conduit in insulated wall</option>
            <option value="B1">B1 — Conduit on wall / in trunking</option>
            <option value="C">C — Clipped direct to surface</option>
          </select>
        </div>

        <div className="row">
          <div className="form-group">
            <label>Ambient Temperature</label>
            <select value={form.temp} onChange={(e) => setForm((prev) => ({ ...prev, temp: e.target.value }))}>
              {[10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((temp) => (
                <option key={temp} value={String(temp)}>{temp} °C</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Circuits Grouped Together</label>
            <select value={form.group} onChange={(e) => setForm((prev) => ({ ...prev, group: e.target.value }))}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((group) => (
                <option key={group} value={String(group)}>{group}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="button" onClick={handleCalculate}>Calculate</button>
      </div>

      {status && (
        <div className="results active">
          <label>Results</label>
          <div className="result-box">
            {status === 'pass' && result ? (
              <>
                <div className="result-item"><span>Minimum Cross-Section</span><span className="result-value">{result.section} mm²</span></div>
                <div className="result-item"><span>Corrected Capacity (Iz)</span><span className="result-value">{result.iz.toFixed(1)} A</span></div>
                <div className="result-item"><span>Utilization (Ib / Iz)</span><span className="result-value">{result.utilization.toFixed(0)} %</span></div>
                <div className="status-badge status-pass">✓ MINIMUM SECTION FOUND</div>
              </>
            ) : (
              <div className="status-badge status-fail">✕ OUT OF TABLE RANGE — consider parallel cables or a busbar system</div>
            )}
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
