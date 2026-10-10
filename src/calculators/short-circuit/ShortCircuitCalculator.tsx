import { useState } from 'react';
import { CalculatorShell } from '../../components/CalculatorShell';
import { calculateShortCircuit, type ShortCircuitInputs } from './engine';

const initialInputs: ShortCircuitInputs = {
  voltageV: 400,
  transformerKva: 1000,
  ukPercent: 6,
  copperLossKw: 10,
  voltageFactor: 1.05,
  upstreamShortCircuitMva: null,
  upstreamXOverR: 10,
  cableLengthM: 0,
  cableSectionMm2: 240,
  material: 'Cu',
  conductorTempC: 90,
  cableReactanceOhmsPerKm: 0.08,
};

function formatCurrent(amperes: number) {
  return amperes >= 1000 ? `${(amperes / 1000).toFixed(2)} kA` : `${amperes.toFixed(1)} A`;
}

export function ShortCircuitCalculator() {
  const [form, setForm] = useState(initialInputs);
  const [includeUpstream, setIncludeUpstream] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculateShortCircuit>>(null);
  const [error, setError] = useState<string | null>(null);

  const updateNumber = (key: keyof ShortCircuitInputs, value: string) => {
    setForm((current) => ({ ...current, [key]: value === '' ? Number.NaN : Number(value) }));
  };

  const handleCalculate = () => {
    const nextResult = calculateShortCircuit({
      ...form,
      upstreamShortCircuitMva: includeUpstream ? form.upstreamShortCircuitMva : null,
    });

    if (!nextResult) {
      setResult(null);
      setError('Input values are invalid or inconsistent. Check transformer losses, impedance, voltage, and cable data.');
      return;
    }

    setError(null);
    setResult(nextResult);
  };

  return (
    <CalculatorShell title="Short-Circuit Current" subtitle="Three-phase initial symmetrical and peak fault current at transformer-fed terminals">
      <div className="form-section">
        <p className="calculation-notice">
          Preliminary IEC 60909-style estimate. This simplified model is not a standards-compliance study or protection-coordination result.
        </p>

        <div className="form-group">
          <label>Low-Voltage Nominal Voltage</label>
          <div className="input-wrapper">
            <input type="number" min="1" value={form.voltageV} onChange={(event) => updateNumber('voltageV', event.target.value)} />
            <span className="unit">V</span>
          </div>
        </div>

        <div className="row">
          <div className="form-group">
            <label>Transformer Rating</label>
            <div className="input-wrapper">
              <input type="number" min="1" value={form.transformerKva} onChange={(event) => updateNumber('transformerKva', event.target.value)} />
              <span className="unit">kVA</span>
            </div>
          </div>
          <div className="form-group">
            <label>Short-Circuit Voltage (uk)</label>
            <div className="input-wrapper">
              <input type="number" min="0.01" step="0.01" value={form.ukPercent} onChange={(event) => updateNumber('ukPercent', event.target.value)} />
              <span className="unit">%</span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="form-group">
            <label>Transformer Copper Loss</label>
            <div className="input-wrapper">
              <input type="number" min="0" step="0.1" value={form.copperLossKw} onChange={(event) => updateNumber('copperLossKw', event.target.value)} />
              <span className="unit">kW</span>
            </div>
          </div>
          <div className="form-group">
            <label>Voltage Factor (c)</label>
            <input type="number" min="0.8" max="1.1" step="0.01" value={form.voltageFactor} onChange={(event) => updateNumber('voltageFactor', event.target.value)} />
          </div>
        </div>

        <div className="advanced-options">
          <label className="option-toggle">
            <input type="checkbox" checked={includeUpstream} onChange={(event) => setIncludeUpstream(event.target.checked)} />
            Include upstream network impedance
          </label>
          {includeUpstream && (
            <div className="advanced-options-body">
              <div className="row">
                <div className="form-group">
                  <label>Upstream Short-Circuit Power</label>
                  <div className="input-wrapper">
                    <input type="number" min="0.01" step="0.1" value={form.upstreamShortCircuitMva ?? ''} onChange={(event) => updateNumber('upstreamShortCircuitMva', event.target.value)} />
                    <span className="unit">MVA</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Upstream X/R Ratio</label>
                  <input type="number" min="0.01" step="0.1" value={form.upstreamXOverR} onChange={(event) => updateNumber('upstreamXOverR', event.target.value)} />
                </div>
              </div>
              <p className="field-help">Enter the network short-circuit power at the transformer primary. Its impedance is referred to the entered low-voltage side.</p>
            </div>
          )}
        </div>

        <div className="advanced-options">
          <details>
            <summary>Optional Cable to Fault Location</summary>
            <div className="advanced-options-body">
              <p className="field-help">Set cable length to zero for a fault at the transformer terminals.</p>
              <div className="row">
                <div className="form-group">
                  <label>One-Way Cable Length</label>
                  <div className="input-wrapper">
                    <input type="number" min="0" value={form.cableLengthM} onChange={(event) => updateNumber('cableLengthM', event.target.value)} />
                    <span className="unit">m</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Conductor Cross-Section</label>
                  <div className="input-wrapper">
                    <input type="number" min="0.1" value={form.cableSectionMm2} onChange={(event) => updateNumber('cableSectionMm2', event.target.value)} />
                    <span className="unit">mm²</span>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="form-group">
                  <label>Conductor Material</label>
                  <select value={form.material} onChange={(event) => setForm((current) => ({ ...current, material: event.target.value as ShortCircuitInputs['material'] }))}>
                    <option value="Cu">Copper (Cu)</option>
                    <option value="Al">Aluminum (Al)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Conductor Temperature</label>
                  <div className="input-wrapper">
                    <input type="number" min="-50" max="250" value={form.conductorTempC} onChange={(event) => updateNumber('conductorTempC', event.target.value)} />
                    <span className="unit">°C</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Cable Reactance</label>
                <div className="input-wrapper">
                  <input type="number" min="0" step="0.01" value={form.cableReactanceOhmsPerKm} onChange={(event) => updateNumber('cableReactanceOhmsPerKm', event.target.value)} />
                  <span className="unit">Ω/km</span>
                </div>
              </div>
            </div>
          </details>
        </div>

        <button type="button" onClick={handleCalculate}>Calculate Fault Current</button>
      </div>

      {error && <div className="form-alert" role="alert">{error}</div>}

      {result && (
        <div className="results active">
          <label>Calculated Results</label>
          <div className="result-box result-warning" role="status" aria-live="polite">
            <div className="result-item"><span>Initial Symmetrical Current (Ik″)</span><span className="result-value">{formatCurrent(result.initialSymmetricalCurrentA)}</span></div>
            <div className="result-item"><span>Peak Short-Circuit Current (ip)</span><span className="result-value">{formatCurrent(result.peakCurrentA)}</span></div>
            <div className="result-item"><span>Peak Factor (κ)</span><span className="result-value">{result.peakFactor.toFixed(3)}</span></div>
            <div className="result-item"><span>Total Equivalent Impedance</span><span className="result-value">{(result.totalImpedanceOhms * 1000).toFixed(3)} mΩ</span></div>
            <div className="result-item"><span>Resistance / Reactance</span><span className="result-value">{(result.totalResistanceOhms * 1000).toFixed(3)} / {(result.totalReactanceOhms * 1000).toFixed(3)} mΩ</span></div>
            <div className="status-badge status-fail">Preliminary estimate · verify before equipment selection</div>
          </div>
          <p className="result-note">The result excludes motor contribution, generator contribution, parallel transformers, arc impedance, and protection-device coordination. Verify against the applicable standard, source data, and equipment manufacturer.</p>
        </div>
      )}
    </CalculatorShell>
  );
}