import { parseNumber } from 'utils';

export const axes = [
	{ primary: true, type: 'ordinal', position: 'bottom' },
	{ position: 'left', type: 'linear', stacked: true }
];

export const initialDataArea = [
	{
		label: 'זכויות קיימות',
		data: []
	},
	{
		label: 'זכויות מבוקשות',
		data: []
	}	
];

export const initialDataUnits = [
	{
		label: 'יחידות קיימות',
		data: []
	},
	{
		label: 'יחידות מבוקשות',
		data: []
	}
];

export const initialPlanData = { 
	countyName: '',
	planName: '', 
	status: '', 
	type:'', 
	goalsFromMavat: '',
	planUrl: '',
	areaChanges: ''
};

export const initialTextArea ={
	exist: 0,
	new: 0,
	area:0
};

export const series = { type: 'bar' };

export const areaChangeHandlers = {
	'meter': (change) => handleMetersChange(change),
	'nonMeter': (change) => handleNotMeterChange(change)
};

export const getAreaChangeType = (c) => {
	return c[3].includes('מ"ר') ? 'meter' : 'nonMeter';
};

const handleMetersChange = (change) => {
	return [{ x:change[3], y:parseNumber(change[5]) }, { x:change[3], y:parseNumber(change[6]) }];
};

const handleNotMeterChange = (change) => {
	return [{ x:change[3], y:parseNumber(change[5]) }, { x:change[3], y:parseNumber(change[6]) }];
};