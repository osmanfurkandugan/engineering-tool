function calculate() {
    // Read inputs
    const V = parseFloat(document.getElementById('voltage').value);
    const I = parseFloat(document.getElementById('current').value);
    const L = parseFloat(document.getElementById('length').value);
    const cosPhi = parseFloat(document.getElementById('cosPhi').value);
    const k = parseFloat(document.getElementById('conductor').value); // Conductivity (Cu=56, Al=35)
    const S = parseFloat(document.getElementById('section').value);

    if (!V || !I || !L || !S) {
        alert("Please fill in all fields with valid values.");
        return;
    }

    // IEC 3-Phase Voltage Drop Formula:
    // ΔU = (√3 * L * I * cosφ) / (k * S)
    const sqrt3 = Math.sqrt(3);
    const deltaU = (sqrt3 * L * I * cosPhi) / (k * S);
    const percentDrop = (deltaU / V) * 100;
    const endVoltage = V - deltaU;

    // Display results
    document.getElementById('resVoltDrop').innerText = deltaU.toFixed(2) + " V";
    document.getElementById('resPercentDrop').innerText = "% " + percentDrop.toFixed(2);
    document.getElementById('resEndVolt').innerText = endVoltage.toFixed(2) + " V";

    // Status check (3% standard limit assumed)
    const badge = document.getElementById('statusBadge');
    if (percentDrop <= 3) {
        badge.className = "status-badge status-pass";
        badge.innerText = "✓ OK (Within 3% Limit)";
    } else {
        badge.className = "status-badge status-fail";
        badge.innerText = "✕ NOT OK (3% Limit Exceeded)";
    }

    // Show results block
    document.getElementById('resultsBlock').classList.add('active');
}
