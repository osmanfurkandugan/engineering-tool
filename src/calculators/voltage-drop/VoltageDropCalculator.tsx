import { useMemo, useState } from 'react';
import { CalculatorShell } from '../../components/CalculatorShell';
import { isPositiveNumber, validateEfficiency, validatePowerFactor } from '../../shared/validation';
import type { SystemType, VoltageDropInputs } from '../../types';
import { currentFromPower, findRecommendedSize, runCalculation } from './engine';

const sectionOptions = [0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630];

const defaultInputs: VoltageDropInputs = {
  system: '3',
  voltage: 400,
  current: 50,
  lengthM: 100,
  material: 'Cu',
  sectionMm2: 16,
  tempC: 20,
  reactanceOhmsPerKm: 0,
  cosPhi: 0.8,
};

function formatNumber(value: number | undefined, digits = 2) {
  if (value === undefined || Number.isNaN(value)) return '—';
  return value.toFixed(digits);
}

export function VoltageDropCalculator() {
  const [form, setForm] = useState(defaultInputs);
  const [inputMode, setInputMode] = useState<'current' | 'power'>('current');
  const [powerValue, setPowerValue] = useState(30);
  const [powerUnit, setPowerUnit] = useState<'kW' | 'W'>('kW');
  const [sectionSelect, setSectionSelect] = useState('16');
  const [dropLimit, setDropLimit] = useState('3');
  const [customSection, setCustomSection] = useState('');
  const [customLimit, setCustomLimit] = useState('3');
  const [efficiency, setEfficiency] = useState(100);
  const [result, setResult] = useState<ReturnType<typeof runCalculation> | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [status, setStatus] = useState<'pass' | 'fail' | null>(null);

  const maxPercent = useMemo(() => {
    return dropLimit === 'custom' ? Number(customLimit) || 3 : Number(dropLimit) || 3;
  }, [dropLimit, customLimit]);

  const updateForm = (key: keyof VoltageDropInputs, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [key]: value as never }));
  };

  const computeCurrent = () => {
    const voltage = Number(form.voltage);
    const basePower = powerUnit === 'kW' ? powerValue * 1000 : powerValue;
    return currentFromPower(form.system, basePower, voltage, form.cosPhi, efficiency);
  };

  const validateAndCalculate = () => {
    const voltage = Number(form.voltage);
    const lengthM = Number(form.lengthM);
    const section = sectionSelect === 'custom' ? Number(customSection) : Number(sectionSelect);

    if (inputMode === 'power' && !validateEfficiency(efficiency)) {
      alert('Efficiency must be greater than 0% and no more than 100%.');
      return;
    }

    const currentValue = inputMode === 'current' ? Number(form.current) : computeCurrent();

    if (!isPositiveNumber(voltage) || !isPositiveNumber(lengthM) || !isPositiveNumber(section) || !isPositiveNumber(currentValue)) {
      alert('Please fill in all fields with valid, positive values.');
      return;
    }

    if (form.system !== 'DC' && !validatePowerFactor(form.cosPhi)) {
      alert('Power factor must be between 0.1 and 1.');
      return;
    }

    const nextInputs: VoltageDropInputs = {
      ...form,
      current: currentValue,
      sectionMm2: section,
      reactanceOhmsPerKm: Number(form.reactanceOhmsPerKm),
    };

    const calculated = runCalculation(nextInputs);
    setResult(calculated);
    setStatus(calculated.percent <= maxPercent ? 'pass' : 'fail');
    setRecommendation(null);
  };

  const handleRecommendation = () => {
    const voltage = Number(form.voltage);
    const lengthM = Number(form.lengthM);
    const section = sectionSelect === 'custom' ? Number(customSection) : Number(sectionSelect);

    if (inputMode === 'power' && !validateEfficiency(efficiency)) {
      alert('Efficiency must be greater than 0% and no more than 100%.');
      return;
    }

    const currentValue = inputMode === 'current' ? Number(form.current) : computeCurrent();

    if (!isPositiveNumber(voltage) || !isPositiveNumber(lengthM) || !isPositiveNumber(section) || !isPositiveNumber(currentValue)) {
      alert('Please fill in all fields with valid, positive values.');
      return;
    }

    const nextInputs: VoltageDropInputs = {
      ...form,
      current: currentValue,
      sectionMm2: section,
      reactanceOhmsPerKm: Number(form.reactanceOhmsPerKm),
      material: form.material,
    };

    const recommended = findRecommendedSize(nextInputs, maxPercent);
    if (!recommended) {
      setRecommendation(`No standard cable size satisfies the ${maxPercent}% voltage drop limit for this case. Consider reducing the run length or using parallel conductors.`);
      setStatus('fail');
      return;
    }

    setRecommendation(`Recommended cable size: ${recommended.section} mm². Voltage drop is ${recommended.percent.toFixed(2)}% within your selected ${maxPercent}% limit.`);
    setResult(recommended);
    setStatus(recommended.percent <= maxPercent ? 'pass' : 'fail');
  };

  const isAc = form.system !== 'DC';

  return (
    <CalculatorShell title="Voltage Drop Calculator" subtitle="DC, Single-Phase and Three-Phase Voltage Drop, Cable Resistance and Power Loss">
      <div className="form-section">
        <div className="row">
          <div className="form-group">
            <label>Electrical System</label>
            <select value={form.system} onChange={(e) => updateForm('system', e.target.value as SystemType)}>
              <option value="3">Three-phase AC</option>
              <option value="1">Single-phase AC</option>
              <option value="DC">DC</option>
            </select>
          </div>
          <div className="form-group">
            <label>System Voltage</label>
            <div className="input-wrapper">
              <input type="number" value={form.voltage} onChange={(e) => updateForm('voltage', Number(e.target.value))} />
              <span className="unit">V</span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Input Mode</label>
          <div className="segmented-control">
            <label className={inputMode === 'current' ? 'is-selected' : ''}>
              <input type="radio" checked={inputMode === 'current'} onChange={() => setInputMode('current')} />
              <span>Current</span>
            </label>
            <label className={inputMode === 'power' ? 'is-selected' : ''}>
              <input type="radio" checked={inputMode === 'power'} onChange={() => setInputMode('power')} />
              <span>Power</span>
            </label>
          </div>
        </div>

        {inputMode === 'current' ? (
          <div className="row">
            <div className="form-group">
              <label>Load Current</label>
              <div className="input-wrapper">
                <input type="number" value={form.current} onChange={(e) => updateForm('current', Number(e.target.value))} />
                <span className="unit">A</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="form-group">
              <label>Load Power</label>
              <input type="number" value={powerValue} onChange={(e) => setPowerValue(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select value={powerUnit} onChange={(e) => setPowerUnit(e.target.value as 'kW' | 'W')}>
                <option value="kW">kW</option>
                <option value="W">W</option>
              </select>
            </div>
          </div>
        )}

        {isAc && (
          <div className="row">
            <div className="form-group">
              <label>Power Factor (Cos φ)</label>
              <input type="number" value={form.cosPhi ?? 0.8} step={0.01} min={0.1} max={1} onChange={(e) => updateForm('cosPhi', Number(e.target.value))} />
            </div>
          </div>
        )}

        <div className="row">
          <div className="form-group">
            <label>One-Way Cable Length</label>
            <div className="input-wrapper">
              <input type="number" value={form.lengthM} onChange={(e) => updateForm('lengthM', Number(e.target.value))} />
              <span className="unit">m</span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="form-group">
            <label>Conductor Material</label>
            <select value={form.material} onChange={(e) => updateForm('material', e.target.value as 'Cu' | 'Al')}>
              <option value="Cu">Copper (Cu)</option>
              <option value="Al">Aluminum (Al)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Cable Cross-Section</label>
            <select value={sectionSelect} onChange={(e) => setSectionSelect(e.target.value)}>
              {sectionOptions.map((section) => (
                <option key={section} value={String(section)}>{section} mm²</option>
              ))}
              <option value="custom">Other (enter manually)</option>
            </select>
          </div>
        </div>

        {sectionSelect === 'custom' && (
          <div className="form-group">
            <label>Custom Cross-Section</label>
            <div className="input-wrapper">
              <input type="number" value={customSection} onChange={(e) => setCustomSection(e.target.value)} />
              <span className="unit">mm²</span>
            </div>
          </div>
        )}

        <div className="row">
          <div className="form-group">
            <label>Max. Voltage Drop Limit</label>
            <select value={dropLimit} onChange={(e) => setDropLimit(e.target.value)}>
              <option value="1">1%</option>
              <option value="2">2%</option>
              <option value="3">3%</option>
              <option value="5">5%</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          {dropLimit === 'custom' && (
            <div className="form-group">
              <label>Custom Limit</label>
              <div className="input-wrapper">
                <input type="number" value={customLimit} onChange={(e) => setCustomLimit(e.target.value)} />
                <span className="unit">%</span>
              </div>
            </div>
          )}
        </div>

        <div className="advanced-options">
          <details open>
            <summary>Advanced Options</summary>
            <div className="advanced-options-body">
              <div className="row">
                <div className="form-group">
                  <label>Efficiency</label>
                  <div className="input-wrapper">
                    <input type="number" value={efficiency} min={0.1} max={100} step={0.1} onChange={(e) => setEfficiency(Number(e.target.value))} />
                    <span className="unit">%</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Operating Temp.</label>
                  <div className="input-wrapper">
                    <input type="number" value={form.tempC} onChange={(e) => updateForm('tempC', Number(e.target.value))} />
                    <span className="unit">°C</span>
                  </div>
                </div>
              </div>
              {isAc && (
                <div className="row">
                  <div className="form-group">
                    <label>Cable Reactance (X)</label>
                    <div className="input-wrapper">
                      <input type="number" value={form.reactanceOhmsPerKm} step={0.01} onChange={(e) => updateForm('reactanceOhmsPerKm', Number(e.target.value))} />
                      <span className="unit">Ω/km</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </details>
        </div>

        <div className="row">
          <div className="form-group">
            <button type="button" onClick={validateAndCalculate}>Calculate</button>
          </div>
          <div className="form-group">
            <button type="button" className="button-secondary" onClick={handleRecommendation}>Find Recommended Cable Size</button>
          </div>
        </div>
      </div>

      {recommendation && <div className="recommendation-box active">{recommendation}</div>}

      {result && (
        <div className="results active">
          <label>Results</label>
          <div className={`result-box ${status === 'pass' ? 'result-success' : 'result-danger'}`} role="status" aria-live="polite">
            <div className="result-item"><span>Voltage Drop (ΔU)</span><span className="result-value">{formatNumber(result.deltaU)} V</span></div>
            <div className="result-item"><span>Voltage Drop (%)</span><span className="result-value">{formatNumber(result.percent)} %</span></div>
            <div className="result-item"><span>Starting Voltage</span><span className="result-value">{formatNumber(result.startVoltage)} V</span></div>
            <div className="result-item"><span>Final Voltage</span><span className="result-value">{formatNumber(result.finalVoltage)} V</span></div>
            <div className="result-item"><span>Current</span><span className="result-value">{formatNumber(result.current, 2)} A</span></div>
            <div className="result-item"><span>Cable Resistance</span><span className="result-value">{formatNumber(result.resistance, 4)} Ω</span></div>
            <div className="result-item"><span>Power Loss in Cable</span><span className="result-value">{formatNumber(result.powerLoss, 1)} W</span></div>
            <div className={`status-badge ${status === 'pass' ? 'status-pass' : 'status-fail'}`}>
              {status === 'pass' ? `✓ WITHIN ${maxPercent}% LIMIT` : `✕ EXCEEDS ${maxPercent}% LIMIT`}
            </div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
