// ============================================
// Voltage Drop Calculator — Calculation Engine
//
// All electrical formulas live in this section,
// separated from the DOM/rendering logic below.
// ============================================

// Standard cable cross-sections (mm²)
const CABLE_SECTIONS = [0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50,
    70, 95, 120, 150, 185, 240, 300, 400, 500, 630];

// Conductivity at 20°C, m/(Ω·mm²)
const CONDUCTIVITY_20C = { Cu: 56, Al: 35 };

// Temperature coefficient of resistance, per °C
const TEMP_COEFFICIENT = { Cu: 0.00393, Al: 0.00403 };

/**
 * Resistance per metre of a single conductor, corrected for
 * operating temperature.
 * R(T) = R(20°C) x [1 + alpha x (T - 20)]
 */
function resistancePerMetre(material, sectionMm2, tempC) {
    const k = CONDUCTIVITY_20C[material];
    const alpha = TEMP_COEFFICIENT[material];
    const rAt20 = 1 / (k * sectionMm2);
    return rAt20 * (1 + alpha * (tempC - 20));
}

/**
 * Derives load current from power when the user chooses
 * power-based input instead of entering current directly.
 */
function currentFromPower(system, powerWatts, voltage, cosPhi, efficiencyPct) {
    const eta = efficiencyPct / 100;
    if (system === 'DC') return powerWatts / (voltage * eta);
    if (system === '1') return powerWatts / (voltage * cosPhi * eta);
    return powerWatts / (Math.sqrt(3) * voltage * cosPhi * eta); // 3-phase
}

/**
 * Core voltage drop formula. Handles the return path correctly:
 * DC and single-phase circuits carry current out AND back through
 * two conductors, so effective length is doubled. Three-phase
 * voltage drop uses the sqrt(3) line-to-line factor with one-way
 * length (the "return" is via the other two phases).
 */
function calcVoltageDrop({ system, current, lengthM, r, x, cosPhi }) {
    const sinPhi = cosPhi !== null ? Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi)) : 0;

    if (system === 'DC') {
        return 2 * current * r * lengthM;
    }
    if (system === '1') {
        return 2 * current * lengthM * (r * cosPhi + x * sinPhi);
    }
    // Three-phase
    return Math.sqrt(3) * current * lengthM * (r * cosPhi + x * sinPhi);
}

/** Effective cable resistance used in the calculation (for display). */
function calcDisplayResistance(system, r, lengthM) {
    if (system === '3') return r * lengthM;       // per conductor, one-way
    return 2 * r * lengthM;                        // total loop (out + back)
}

/** Real power dissipated in the cable (reactance carries no real power). */
function calcPowerLoss(system, current, r, lengthM) {
    if (system === '3') return 3 * current * current * r * lengthM;
    return current * current * 2 * r * lengthM;
}

/**
 * Runs the full calculation for one cable size and returns every
 * result field the UI needs.
 */
function runCalculation(inputs) {
    const { system, voltage, current, lengthM, material, sectionMm2, tempC, x, cosPhi } = inputs;

    const r = resistancePerMetre(material, sectionMm2, tempC);
    const deltaU = calcVoltageDrop({ system, current, lengthM, r, x, cosPhi });
    const percent = (deltaU / voltage) * 100;
    const finalVoltage = voltage - deltaU;
    const resistance = calcDisplayResistance(system, r, lengthM);
    const powerLoss = calcPowerLoss(system, current, r, lengthM);

    return { deltaU, percent, finalVoltage, resistance, powerLoss, current };
}

/**
 * Searches the standard cable size table and returns the smallest
 * section that keeps the voltage drop within maxPercent.
 * Returns null if no standard size satisfies the limit.
 */
function findRecommendedSize(inputs, maxPercent) {
    for (let i = 0; i < CABLE_SECTIONS.length; i++) {
        const section = CABLE_SECTIONS[i];
        const result = runCalculation({ ...inputs, sectionMm2: section });
        if (result.percent <= maxPercent) {
            return { section, ...result };
        }
    }
    return null;
}
