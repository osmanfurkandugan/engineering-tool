import type { ComponentType } from 'react';
import { CableSizingCalculator } from './cable-sizing/CableSizingCalculator';
import { LoadCurrentCalculator } from './load-current/LoadCurrentCalculator';
import { ShortCircuitCalculator } from './short-circuit/ShortCircuitCalculator';
import { VoltageDropCalculator } from './voltage-drop/VoltageDropCalculator';

export type CalculatorStatus = 'live' | 'coming-soon';

export interface CalculatorMeta {
	id: string;
	name: string;
	description: string;
	icon: string;
	status: CalculatorStatus;
	route: string;
	component: ComponentType | null;
}

export const calculatorCatalog: CalculatorMeta[] = [
	{
		id: 'voltage-drop',
		name: 'Voltage Drop Calculator',
		description: 'Calculates voltage drop and percentage deviation across a cable in 3-phase systems.',
		icon: '⚡',
		status: 'live',
		route: '/voltage-drop',
		component: VoltageDropCalculator,
	},
	{
		id: 'cable-sizing',
		name: 'Cable Sizing',
		description: 'Determines the minimum cable cross-section based on current-carrying capacity.',
		icon: '🔌',
		status: 'live',
		route: '/cable-sizing',
		component: CableSizingCalculator,
	},
	{
		id: 'load-current',
		name: 'Load Current Calculator',
		description: 'Calculates full load current from power, voltage, power factor and efficiency.',
		icon: '🔋',
		status: 'live',
		route: '/load-current',
		component: LoadCurrentCalculator,
	},
	{
		id: 'short-circuit',
		name: 'Short-Circuit Current',
		description: 'Estimates three-phase initial symmetrical and peak fault current from transformer, source, and cable impedances.',
		icon: '💥',
		status: 'live',
		route: '/short-circuit',
		component: ShortCircuitCalculator,
	},
	{
		id: 'power-factor',
		name: 'Power Factor Correction',
		description: 'Calculates capacitor sizing for reactive power compensation.',
		icon: '📐',
		status: 'coming-soon',
		route: '/power-factor',
		component: null,
	},
];

export function findCalculatorByRoute(path: string) {
	return calculatorCatalog.find((calculator) => calculator.route === path);
}
