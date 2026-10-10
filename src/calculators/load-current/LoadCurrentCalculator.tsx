import { useState } from 'react';
import { CalculatorShell } from '../../components/CalculatorShell';
import { isPositiveNumber, validatePowerFactor } from '../../shared/validation';
import { calculateLoadCurrent } from './engine';

export function LoadCurrentCalculator() {
  const [form, setForm] = useState({
    power: 7.5,
    powerUnit: 'kW',
    system: '3',
    voltage: 400,
    cosPhi: 0.85,
    efficiency: 90,
  });

  const [result, setResult] = useState<{ current: number; inputPowerKw: number; suggestedRating: number } | null>(null);

  const handleCalculate = () => {
    const powerValue = Number(form.power);
    const voltage = Number(form.voltage);
    const cosPhi = Number(form.cosPhi);
    const efficiency = Number(form.efficiency);

    if (!isPositiveNumber(powerValue) || !isPositiveNumber(voltage) || !validatePowerFactor(cosPhi) || !isPositiveNumber(efficiency)) {
      alert('Please enter valid values in all fields.');
      return;
    }

    const computed = calculateLoadCurrent({
      powerValue,
      powerUnit: form.powerUnit as 'kW' | 'HP',
      system: form.system as '3' | '1',
      voltage,
      cosPhi,
      efficiency,
    });

    if (!computed) {
      alert('Please enter valid values in all fields.');
      return;
    }

    setResult(computed);
  };

  return (
    <CalculatorShell title="Load Current Calculator" subtitle="Full Load Current from Power, Voltage, Power Factor and Efficiency">
      <div className="form-section">
        <div className="row">
          <div className="form-group">
            <label>Power Rating</label>
            <input type="number" value={form.power} onChange={(e) => setForm((prev) => ({ ...prev, power: Number(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <select value={form.powerUnit} onChange={(e) => setForm((prev) => ({ ...prev, powerUnit: e.target.value }))}>
              <option value="kW">kW</option>
              <option value="HP">HP</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="form-group">
            <label>System Type</label>
            <select value={form.system} onChange={(e) => setForm((prev) => ({ ...prev, system: e.target.value }))}>
              <option value="3">3-phase</option>
              <option value="1">Single-phase</option>
            </select>
          </div>
          <div className="form-group">
            <label>Voltage (V)</label>
            <input type="number" value={form.voltage} onChange={(e) => setForm((prev) => ({ ...prev, voltage: Number(e.target.value) }))} />
          </div>
        </div>

        <div className="row">
          <div className="form-group">
            <label>Power Factor (Cos φ)</label>
            <input type="number" value={form.cosPhi} step={0.01} min={0.1} max={1} onChange={(e) => setForm((prev) => ({ ...prev, cosPhi: Number(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label>Efficiency (%)</label>
            <input type="number" value={form.efficiency} step={0.1} min={1} max={100} onChange={(e) => setForm((prev) => ({ ...prev, efficiency: Number(e.target.value) }))} />
          </div>
        </div>

        <button type="button" onClick={handleCalculate}>Calculate</button>
      </div>

      {result && (
        <div className="results active">
          <label>Results</label>
          <div className="result-box">
            <div className="result-item"><span>Full Load Current</span><span className="result-value">{result.current.toFixed(2)} A</span></div>
            <div className="result-item"><span>Electrical Input Power</span><span className="result-value">{result.inputPowerKw.toFixed(2)} kW</span></div>
            <div className="result-item"><span>Suggested Device Rating (125%)</span><span className="result-value">{result.suggestedRating.toFixed(2)} A</span></div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
