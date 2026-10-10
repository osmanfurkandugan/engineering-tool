# Calculation Assumptions and Scope

These calculators are preliminary engineering aids. Their results do not replace a design review, applicable local regulations, manufacturer data, or verification by a qualified electrical engineer.

## Voltage drop

- Cable length is one-way length in metres. Resistance is calculated per metre from nominal material conductivity at 20 C and a linear temperature coefficient.
- Reactance input is in ohms per kilometre and is converted to ohms per metre by the calculation engine.
- AC voltage-drop calculations use the entered power factor and the simplified resistance/reactance equations implemented in `src/calculators/voltage-drop/engine.ts`. Cable construction, frequency-specific impedance, harmonic content, and installation-specific conductor data are not modelled.
- DC calculations use a two-conductor path and ignore reactance.

## Cable sizing

- The ampacity values and temperature, grouping, and aluminium factors in `src/calculators/cable-sizing/engine.ts` are embedded lookup data.
- Their authoritative table edition, insulation type, conductor operating temperature, reference ambient condition, and every applicability condition have not yet been independently verified or recorded. Treat the returned section as an indicative lookup result, not a compliance determination.
- The current calculation does not check voltage drop, protective-device coordination, fault withstand, installation-specific corrections beyond the listed factors, or parallel conductor rules.
- Before relying on this calculator for design, verify the complete table and correction-factor provenance against the applicable edition of IEC 60364-5-52 and the relevant national adoption, then expose the chosen assumptions in the UI and result export.

## Load current

- The entered power is treated as motor mechanical output power; efficiency converts it to electrical input power. Enter efficiency as a percentage from greater than 0 through 100.
- The displayed 125% current is a rough reference only. It is not a protective-device selection, conductor sizing, or motor-starting recommendation; applicable rules and equipment data are required.

## Short-circuit current

- The calculator estimates three-phase initial symmetrical current at transformer-fed low-voltage terminals or at the end of one entered cable run. It reports initial symmetrical RMS current and an estimated peak current.
- Transformer impedance magnitude is derived from transformer rating and uk%. Transformer resistance is derived from copper loss at rated current; transformer reactance is the remaining impedance magnitude.
- Optional upstream short-circuit power is referred to the entered low-voltage side and split into R/X using the entered X/R ratio. Cable resistance uses nominal material conductivity and a linear temperature coefficient; cable reactance is converted from ohms per kilometre.
- The voltage factor and peak-factor equation are IEC 60909-style inputs/equations, but this implementation is a simplified estimate, not a verified IEC 60909 study or declaration of compliance.
- Transformer correction factors, motor/generator contribution, parallel transformers, frequency-dependent effects, arc impedance, DC-component decay, thermal equivalent current, and protective-device coordination are not modelled. Validate source data and results against the applicable standard, local rules, and equipment manufacturers before design decisions.

## Tests

Engine tests check implemented equations, unit conversion, and selected table behavior. They do not independently certify source data or establish standards compliance.