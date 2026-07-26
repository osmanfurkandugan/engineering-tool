// ============================================
// Cable Sizing Calculator
// Based on IEC 60364-5-52 ampacity tables
// (typical/indicative values — verify against
// the current standard for critical projects)
// ============================================

// Available cross-sections (mm²), ascending order
const SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

// Base current-carrying capacity (A) for PVC-insulated COPPER conductors,
// 30°C ambient, single circuit (no grouping), per installation method
// and number of loaded conductors.
const BASE_TABLE = {
    A1: { // Method A1 — insulated conductors in conduit in a thermally insulated wall
        2: [14.5, 19.5, 26, 34, 46, 61, 80, 99, 119, 151, 182, 210, 240, 273, 321],
        3: [13.5, 18, 24, 31, 42, 56, 73, 89, 108, 136, 164, 188, 216, 245, 286]
    },
    B1: { // Method B1 — insulated conductors in conduit on a wall
        2: [17.5, 24, 32, 41, 57, 76, 96, 119, 144, 184, 223, 259, 299, 341, 403],
        3: [15.5, 21, 28, 36, 50, 68, 89, 110, 134, 171, 207, 239, 262, 296, 346]
    },
    C: { // Method C — cables clipped direct to a surface
        2: [19.5, 27, 36, 46, 63, 85, 112, 138, 168, 213, 258, 299, 344, 392, 461],
        3: [17.5, 24, 32, 41, 57, 76, 96, 119, 144, 184, 223, 259, 299, 341, 403]
    }
};

// Ambient temperature correction factor (PVC insulation)
const TEMP_FACTORS = {
    10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00,
    35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50
};

// Grouping correction factor (circuits touching, single layer)
const GROUP_FACTORS = {
    1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60,
    6: 0.57, 7: 0.54, 8: 0.52, 9: 0.50, 10: 0.48
};

// Approximate derating factor for aluminum vs copper at the same cross-section
const ALUMINUM_FACTOR = 0.78;

function calculate() {
    const Ib = parseFloat(document.getElementById('loadCurrent').value);
    const conductors = document.getElementById('conductors').value;
    const method = document.getElementById('method').value;
    const temp = document.getElementById('ambientTemp').value;
    const group = document.getElementById('grouping').value;
    const material = document.getElementById('material').value;

    if (!Ib || Ib <= 0) {
        alert("Please enter a valid load current.");
        return;
    }

    const Ct = TEMP_FACTORS[temp];
    const Cg = GROUP_FACTORS[group];
    const Cm = material === 'Al' ? ALUMINUM_FACTOR : 1.0;

    const baseValues = BASE_TABLE[method][conductors];

    let chosenIndex = -1;
    let Iz = 0;

    for (let i = 0; i < SECTIONS.length; i++) {
        const candidateIz = baseValues[i] * Ct * Cg * Cm;
        if (candidateIz >= Ib) {
            chosenIndex = i;
            Iz = candidateIz;
            break;
        }
    }

    const resultsBlock = document.getElementById('resultsBlock');
    const badge = document.getElementById('statusBadge');

    if (chosenIndex === -1) {
        // No section in the table satisfies the required current
        document.getElementById('resSection').innerText = "—";
        document.getElementById('resIz').innerText = "—";
        document.getElementById('resUtil').innerText = "—";
        badge.className = "status-badge status-fail";
        badge.innerText = "✕ OUT OF TABLE RANGE — consider parallel cables or a busbar system";
        resultsBlock.classList.add('active');
        return;
    }

    const utilization = (Ib / Iz) * 100;

    document.getElementById('resSection').innerText = SECTIONS[chosenIndex] + " mm²";
    document.getElementById('resIz').innerText = Iz.toFixed(1) + " A";
    document.getElementById('resUtil').innerText = utilization.toFixed(0) + " %";

    badge.className = "status-badge status-pass";
    badge.innerText = "✓ MINIMUM SECTION FOUND";

    resultsBlock.classList.add('active');
}
