const { chartToArrayBuilder } = require('./chartToArrayBuilder');
const { getFromArr } = require('./parsersUtils');
const log = require('../../../log');

// this function look for the correct columns for the given headers, and returns a factory embedded with these findings
const rowAbstractFactory = (firstPageOfTable, headersStartIndex) => {
	const insideHeader = (currIndex, indexOfHeaderToBeInside, indexOfHeaderToTheRight) => {
		return currIndex >= indexOfHeaderToBeInside && currIndex < indexOfHeaderToTheRight;
	};

	// clean the headers
	firstPageOfTable = firstPageOfTable.map(row => row.map(cell => cell.replace(/\n/g, ' ')
		.replace(/ {2}/g, ' ')
		.trim()));

	if (headersStartIndex === -1) {
		log.info('didn\'t find headers for chart five');
		return () => {};
	}
	const headers = firstPageOfTable.slice(headersStartIndex, headersStartIndex + 3);

	const header0 = headers[0];
	const header1 = headers[1];
	const header2 = headers[2];

	const designationIndex = header0.findIndex(title => title === 'יעוד');
	const useIndex = header0.findIndex(title => title === 'שימוש');
	const areaNumberIndex = header0.findIndex(title => title === 'תאי שטח');
	const locationIndex = header0.findIndex(title => title.includes('מקום') && title.includes('בניין'));
	const fieldSizeSqmIndex = header0.findIndex(title => title.includes('גודל מגרש'));
	const buildingAreasIndex = header0.findIndex(title => title.includes('שטחי בניה'));
	const tahsitIndex = header0.findIndex(title => title.includes('תכסית'));
	const buildingPercentageIndex = header0.findIndex(title => title.includes('אחוזי') && title.includes('כוללים'));
	const densityYahadToDunamIndex = header0.findIndex(title => title === 'צפיפות יח"ד לדונם');
	const numOfHousingUnitsIndex = header0.findIndex(title => title.includes('מספר יח"ד'));
	const heightIndex = header0.findIndex(title => title.includes('גובה'));
	const floorNumberIndex = header0.findIndex(title => title === 'מספר קומות');

	const frontBuildingLineIndex = header1.findIndex(title => title === 'קדמי');
	const backBuildingLineIndex = header1.findIndex(title => title === 'אחורי');
	const sideLeftBuildingLineIndex = header1.findIndex(title => title.includes('צידי') && title.includes('שמאלי'));
	const sideRightBuildingLineIndex = header1.findIndex(title => title.includes('צידי') && title.includes('ימני'));
	const floorsBelowEntranceIndex = floorNumberIndex === -1 || heightIndex === -1 ? -1
		: header1.findIndex((title, index) => title === 'מתחת לכניסה הקובעת' &&
          insideHeader(index, floorNumberIndex, heightIndex));
	const floorsAboveEntranceIndex = floorNumberIndex === -1 || heightIndex === -1 ? -1
		: header1.findIndex((title, index) => title === 'מעל הכניסה הקובעת' &&
          insideHeader(index, floorNumberIndex, heightIndex));
	const overallBuildingLandIndex = header1.findIndex(title => title === 'סה"כ שטחי בניה');
	const buildingAboveEntranceIndex = buildingAreasIndex === -1 || fieldSizeSqmIndex === -1 ? -1
		: header1.findIndex((title, index) => title === 'מעל הכניסה הקובעת' &&
          insideHeader(index, buildingAreasIndex, fieldSizeSqmIndex));
	const buildingBelowEntranceIndex = buildingAreasIndex === -1 || fieldSizeSqmIndex === -1 ? -1
		: header1.findIndex((title, index) => title === 'מתחת לכניסה הקובעת' &&
          insideHeader(index, buildingAreasIndex, fieldSizeSqmIndex));

	const buildingAboveEntranceMainIndex = buildingAboveEntranceIndex === -1 || fieldSizeSqmIndex === -1 ? -1
		: header2.findIndex((title, index) => title === 'עיקרי' &&
          insideHeader(index, buildingAboveEntranceIndex, fieldSizeSqmIndex));
	const buildingAboveEntranceServiceIndex = buildingAboveEntranceIndex === -1 || fieldSizeSqmIndex === -1 ? -1
		: header2.findIndex((title, index) => title === 'שרות' &&
          insideHeader(index, buildingAboveEntranceIndex, fieldSizeSqmIndex));
	const buildingBelowEntranceMainIndex = buildingBelowEntranceIndex === -1 || buildingAboveEntranceIndex === -1 ? -1
		: header2.findIndex((title, index) => title === 'עיקרי' &&
          insideHeader(index, buildingBelowEntranceIndex, buildingAboveEntranceIndex));
	const buildingBelowEntranceServiceIndex = buildingBelowEntranceIndex === -1 || buildingAboveEntranceIndex === -1 ? -1
		: header2.findIndex((title, index) => title === 'שרות' &&
          insideHeader(index, buildingBelowEntranceIndex, buildingAboveEntranceIndex));

	return (row) => {
		return {
			designation: getFromArr(row, designationIndex),
			use: getFromArr(row, useIndex),
			area_number: getFromArr(row, areaNumberIndex),
			location: getFromArr(row, locationIndex),
			field_size_sqm: getFromArr(row, fieldSizeSqmIndex),
			above_primary_main: getFromArr(row, buildingAboveEntranceMainIndex),
			above_primary_service: getFromArr(row, buildingAboveEntranceServiceIndex),
			below_primary_main: getFromArr(row, buildingBelowEntranceMainIndex),
			below_primary_service: getFromArr(row, buildingBelowEntranceServiceIndex),
			building_percentage: getFromArr(row, buildingPercentageIndex),
			tahsit: getFromArr(row, tahsitIndex),
			density_yahad_to_dunam: getFromArr(row, densityYahadToDunamIndex),
			num_of_housing_units: getFromArr(row, numOfHousingUnitsIndex),
			floors_above: getFromArr(row, floorsAboveEntranceIndex),
			floors_below: getFromArr(row, floorsBelowEntranceIndex),
			overall_building_land: getFromArr(row, overallBuildingLandIndex),
			height_above_entrance: getFromArr(row, heightIndex),
			side_line_right: getFromArr(row, sideRightBuildingLineIndex),
			side_line_left: getFromArr(row, sideLeftBuildingLineIndex),
			side_line_back: getFromArr(row, backBuildingLineIndex),
			side_line_front: getFromArr(row, frontBuildingLineIndex)
		};
	};
};

const endChartPredicate = (row) => {
	return row[0].includes('האמור בטבלה זו גובר, במקרה של סתירה, על הוראות כלליות אחרות');
};

const startChartFivePredicate = (cell) => {
	return cell === 'טבלת זכויות והוראות בניה - מצב מוצע5.' || cell.replace('\'', '') === 'טבלת זכויות והוראות בניה - מצב מוצע - חלק א5.';
};

const extractChartFive = (pageTables) => {
	return chartToArrayBuilder({
		pageTables,
		rowAbstractFactory,
		startOfChartPred: startChartFivePredicate,
		offsetOfRowWithDataInChart: 3, // length of header (header rows) is 3
		chartDonePredicate: endChartPredicate,
		getHeaderRowIndex: (page, searchFrom) => page.slice(searchFrom).findIndex(row => (row.some(cell => cell.includes('יעוד')))) + searchFrom, // add searchFrom back to be aligned with the original array
		rowTrimmer: (row) => row.map((cell) => cell.replace(/\n/g, ' ').replace(/ {2}/g, ' ').trim()),
		identifier: 'chart 5'
	});
};

module.exports = {
	extractChartFive,
	startChart5Predicate: startChartFivePredicate
};
