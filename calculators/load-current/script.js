// ============================================
// Load / Full Load Current Calculator
//
// Single-phase: I = P / (V x cosPhi x eta)
// Three-phase:  I = P / (sqrt(3) x V x cosPhi x eta)
//
// P is taken as the mechanical/useful output power;
// dividing by efficiency (eta) gives the electrical
// input power the source actually has to supply.
// ============================================

const HP_TO_KW = 0.746;

function calculate() {
    const powerValue = parseFloat(document.getElementById('power').value);
    const powerUnit = document.getElementById('powerUnit').value;
    const system = document.getElementById('system').value;
    const voltage = parseFloat(document.getElementById('voltage').value);
    const cosPhi = parseFloat(document.getElementById('cosPhi').value);
    const efficiency = parseFloat(document.getElementById('efficiency').value);

    if (!powerValue || !voltage || !cosPhi || !efficiency) {
        alert("Please enter valid values in all fields.");
        return;
    }

    // Normalize power to kW, then to Watts
    const powerKw = powerUnit === 'HP' ? powerValue * HP_TO_KW : powerValue;
    const powerW = powerKw * 1000;

    const eta = efficiency / 100;

    let current;
    if (system === '3') {
        current = powerW / (Math.sqrt(3) * voltage * cosPhi * eta);
    } else {
        current = powerW / (voltage * cosPhi * eta);
    }

    // Suggested protective device rating — 125% headroom,
    // the typical continuous-load margin used for motor circuits
    const suggestedRating = current * 1.25;

    const inputPowerKw = powerKw / eta;

    document.getElementById('resCurrent').innerText = current.toFixed(2) + " A";
    document.getElementById('resInputPower').innerText = inputPowerKw.toFixed(2) + " kW";
    document.getElementById('resDevice').innerText = suggestedRating.toFixed(2) + " A";

    document.getElementById('resultsBlock').classList.add('active');
}
