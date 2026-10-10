export type CalculatorStatus = 'live' | 'coming-soon';

export interface CalculatorMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: CalculatorStatus;
  route: string;
  componentName: string;
}

export const calculatorCatalog: CalculatorMeta[] = [
  {
    id: 'voltage-drop',
    name: 'Voltage Drop Calculator',
    description: 'Calculates voltage drop and percentage deviation across a cable in 3-phase systems.',
    icon: '⚡',
    status: 'live',
    route: '/voltage-drop',
    componentName: 'VoltageDropCalculator',
  },
  {
    id: 'cable-sizing',
    name: 'Cable Sizing',
    description: 'Determines the minimum cable cross-section based on current-carrying capacity.',
    icon: '🔌',
    status: 'live',
    route: '/cable-sizing',
    componentName: 'CableSizingCalculator',
  },
  {
    id: 'load-current',
    name: 'Load Current Calculator',
    description: 'Calculates full load current from power, voltage, power factor and efficiency.',
    icon: '🔋',
    status: 'live',
    route: '/load-current',
    componentName: 'LoadCurrentCalculator',
  },
  {
    id: 'short-circuit',
    name: 'Short-Circuit Current',
    description: 'Calculates short-circuit current and equipment ratings per IEC 60909.',
    icon: '💥',
    status: 'coming-soon',
    route: '/short-circuit',
    componentName: 'ComingSoon',
  },
  {
    id: 'power-factor',
    name: 'Power Factor Correction',
    description: 'Calculates capacitor sizing for reactive power compensation.',
    icon: '📐',
    status: 'coming-soon',
    route: '/power-factor',
    componentName: 'ComingSoon',
  },
];
