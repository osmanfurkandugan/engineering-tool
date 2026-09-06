// ============================================
// Voltage Drop Calculator — UI / Rendering
// (Calculation logic lives in calc-engine.js)
// ============================================

const el = (id) => document.getElementById(id);

function toggleSystemFields() {
    const system = el('system').value;
    const isDC = system === 'DC';
    document.querySelectorAll('.ac-only').forEach(node => {
        node.style.display = isDC ? 'none' : '';
    });
}

function toggleInputMode() {
    const mode = document.querySelector('input[name="inputMode"]:checked').value;
    el('currentModeGroup').style.display = mode === 'current' ? '' : 'none';
    el('powerModeGroup').style.display = mode === 'power' ? '' : 'none';
}

function toggleCableSizeMode() {
    const isCustom = el('sectionSelect').value === 'custom';
    el('customSectionGroup').style.display = isCustom ? '' : 'none';
}

function toggleDropLimitMode() {
    const isCustom = el('dropLimitSelect').value === 'custom';
    el('customDropLimitGroup').style.display = isCustom ? '' : 'none';
}

/** Reads and validates every input field. Returns null (and alerts) on invalid input. */
function readInputs() {
    const system = el('system').value;
    const voltage = parseFloat(el('voltage').value);
    const lengthM = parseFloat(el('length').value);
    const material = el('material').value;
    const tempC = parseFloat(el('tempC').value);
    const reactanceKm = parseFloat(el('reactance').value) || 0;
    const efficiencyPct = parseFloat(el('efficiency').value) || 100;

    const cosPhi = system === 'DC' ? null : parseFloat(el('cosPhi').value);

    const sectionSelectVal = el('sectionSelect').value;
    const sectionMm2 = sectionSelectVal === 'custom'
        ? parseFloat(el('customSection').value)
        : parseFloat(sectionSelectVal);

    const inputMode = document.querySelector('input[name="inputMode"]:checked').value;
    let current;
    if (inputMode === 'current') {
        current = parseFloat(el('current').value);
    } else {
        const powerRaw = parseFloat(el('power').value);
        const powerUnit = el('powerUnit').value;
        const powerWatts = powerUnit === 'kW' ? powerRaw * 1000 : powerRaw;
        current = currentFromPower(system, powerWatts, voltage, cosPhi || 1, efficiencyPct);
    }

    if (!voltage || voltage <= 0 || !lengthM || lengthM <= 0 || !sectionMm2 || sectionMm2 <= 0 || !current || current <= 0) {
        alert("Please fill in all fields with valid, positive values.");
        return null;
    }
    if (cosPhi !== null && (cosPhi < 0.1 || cosPhi > 1)) {
        alert("Power factor must be between 0.1 and 1.");
        return null;
    }

    const x = reactanceKm / 1000; // Ω/km -> Ω/m

    return { system, voltage, current, lengthM, material, sectionMm2, tempC, x, cosPhi };
}

function getMaxDropPercent() {
    const sel = el('dropLimitSelect').value;
    if (sel === 'custom') return parseFloat(el('customDropLimit').value) || 3;
    return parseFloat(sel);
}

function renderResults(result, maxPercent, system) {
    el('resVoltDrop').innerText = result.deltaU.toFixed(2) + " V";
    el('resPercentDrop').innerText = result.percent.toFixed(2) + " %";
    el('resStartVolt').innerText = result.startVoltage.toFixed(1) + " V";
    el('resEndVolt').innerText = result.finalVoltage.toFixed(2) + " V";
    el('resCurrent').innerText = result.current.toFixed(2) + " A";
    el('resResistance').innerText = result.resistance.toFixed(4) + " Ω" + (system === '3' ? ' (per conductor)' : ' (loop)');
    el('resPowerLoss').innerText = result.powerLoss.toFixed(1) + " W";

    const badge = el('statusBadge');
    const interpretation = el('interpretation');
    const passed = result.percent <= maxPercent;

    if (passed) {
        badge.className = "status-badge status-pass";
        badge.innerText = "✓ WITHIN " + maxPercent + "% LIMIT";
        interpretation.innerText = `Your voltage drop is ${result.percent.toFixed(2)}%, which is within your selected ${maxPercent}% limit.`;
    } else {
        badge.className = "status-badge status-fail";
        badge.innerText = "✕ EXCEEDS " + maxPercent + "% LIMIT";
        interpretation.innerText = `Your voltage drop is ${result.percent.toFixed(2)}%, which exceeds your selected ${maxPercent}% limit. Consider using a larger conductor size or reducing the cable length.`;
    }

    el('resultsBlock').classList.add('active');
}

function calculate() {
    const inputs = readInputs();
    if (!inputs) return;

    const maxPercent = getMaxDropPercent();
    const result = runCalculation(inputs);
    result.startVoltage = inputs.voltage;

    el('recommendationBox').classList.remove('active');
    renderResults(result, maxPercent, inputs.system);
}

function findRecommended() {
    const inputs = readInputs();
    if (!inputs) return;

    const maxPercent = getMaxDropPercent();
    const rec = findRecommendedSize(inputs, maxPercent);
    const box = el('recommendationBox');

    if (!rec) {
        box.className = "recommendation-box fail active";
        box.innerHTML = `<strong>No standard cable size satisfies the ${maxPercent}% voltage drop limit</strong> for this current and length, up to 630 mm². Consider reducing the cable length, using parallel conductors, or relaxing the voltage drop limit.`;
        return;
    }

    box.className = "recommendation-box active";
    box.innerHTML = `<strong>Recommended cable size: ${rec.section} mm²</strong><br>
        Voltage drop: ${rec.percent.toFixed(2)}% — within the selected ${maxPercent}% voltage drop limit.<br>
        <span class="recommendation-note">This recommendation is based on voltage drop only. Confirm the cable's current-carrying capacity separately (see the Cable Sizing tool).</span>`;

    // Reflect the recommended size in the main result panel too
    const sel = el('sectionSelect');
    const optionExists = Array.from(sel.options).some(o => o.value === String(rec.section));
    if (optionExists) {
        sel.value = String(rec.section);
        toggleCableSizeMode();
    }
    rec.startVoltage = inputs.voltage;
    renderResults(rec, maxPercent, inputs.system);
}
