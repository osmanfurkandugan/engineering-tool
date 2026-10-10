import { useState } from 'react';
import { CalculatorShell } from '../../components/CalculatorShell';
import { calculatePowerFactorCorrection, type PowerFactorInputs } from './engine';

const initialInputs: PowerFactorInputs = {
  activePowerKw: 100,
  system: '3',
  voltageV: 400,
  initialPowerFactor: 0.8,
  targetPowerFactor: 0.95,
};

function formatCurrent(amperes: number) {
  return amperes >= 1000 ? `${(amperes / 1000).toFixed(2)} kA` : `${amperes.toFixed(2)} A`;
}

export function PowerFactorCalculator() {
  const [form, setForm] = useState(initialInputs);
  const [result, setResult] = useState<ReturnType<typeof calculatePowerFactorCorrection>>(null);
  const [error, setError] = useState<string | null>(null);

  const updateNumber = (key: Exclude<keyof PowerFactorInputs, 'system'>, value: string) => {
    setForm((current) => ({ ...current, [key]: value === '' ? Number.NaN : Number(value) }));
  };

  const handleCalculate = () => {
    const nextResult = calculatePowerFactorCorrection(form);

    if (!nextResult) {
      setResult(null);
      setError('Enter positive power and voltage, an initial power factor from 0.1 to 1, and a target power factor greater than the initial value and no more than 1.');
      return;
    }

    setError(null);
    setResult(nextResult);
  };

  return (
    <CalculatorShell title="Power Factor Correction" subtitle="Estimate capacitor-bank reactive power and load-current reduction">
      <div className="form-section">
        <p className="calculation-notice">
          Preliminary capacitor sizing estimate. Confirm the selected bank with load data, switching stages, harmonic measurements, and applicable requirements.
        </p>

        <div className="row">
          <div className="form-group">
            <label>Active Power</label>
            <div className="input-wrapper">
              <input type="number" min="0.1" step="0.1" value={form.activePowerKw} onChange={(event) => updateNumber('activePowerKw', event.target.value)} />
              <span className="unit">kW</span>
            </div>
          </div>
          <div className="form-group">
            <label>System Type</label>
            <select value={form.system} onChange={(event) => setForm((current) => ({ ...current, system: event.target.value as PowerFactorInputs['system'] }))}>
              <option value="3">Three-phase</option>
              <option value="1">Single-phase</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="form-group">
            <label>Line Voltage</label>
            <div className="input-wrapper">
              <input type="number" min="1" value={form.voltageV} onChange={(event) => updateNumber('voltageV', event.target.value)} />
              <span className="unit">V</span>
            </div>
          </div>
          <div className="form-group">
            <label>Initial Power Factor</label>
            <input type="number" min="0.1" max="1" step="0.01" value={form.initialPowerFactor} onChange={(event) => updateNumber('initialPowerFactor', event.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Target Power Factor</label>
          <input type="number" min="0.1" max="1" step="0.01" value={form.targetPowerFactor} onChange={(event) => updateNumber('targetPowerFactor', event.target.value)} />
        </div>

        <button type="button" onClick={handleCalculate}>Calculate Required Capacitor Bank</button>
      </div>

      {error && <div className="form-alert" role="alert">{error}</div>}

      {result && (
        <div className="results active">
          <label>Calculated Results</label>
          <div className="result-box result-success" role="status" aria-live="polite">
            <div className="result-item"><span>Required Capacitor Bank (Qc)</span><span className="result-value">{result.requiredCapacitorKvar.toFixed(2)} kvar</span></div>
            <div className="result-item"><span>Initial Reactive Power</span><span className="result-value">{result.initialReactivePowerKvar.toFixed(2)} kvar</span></div>
            <div className="result-item"><span>Reactive Power at Target PF</span><span className="result-value">{result.targetReactivePowerKvar.toFixed(2)} kvar</span></div>
            <div className="result-item"><span>Line Current Before Correction</span><span className="result-value">{formatCurrent(result.initialCurrentA)}</span></div>
            <div className="result-item"><span>Line Current After Correction</span><span className="result-value">{formatCurrent(result.targetCurrentA)}</span></div>
            <div className="result-item"><span>Current Reduction</span><span className="result-value">{result.currentReductionPercent.toFixed(1)} %</span></div>
            <div className="status-badge status-pass">CAPACITIVE KVAR ESTIMATE</div>
          </div>
          <p className="result-note">Use the calculated kvar as a preliminary total compensation estimate. Select practical bank stages and verify harmonic resonance, capacitor duty, voltage, and switching method before installation.</p>
        </div>
      )}
    </CalculatorShell>
  );
}