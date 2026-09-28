"use strict";
/**
 * @file study-teachers.ts
 * @description Parses study hall teacher schedules from external Google Sheets documents.
 */
/**
 * Parses the "Duties S1" and "Duties S2" sheets in Google Apps Script.
 * Retrieves a flattened array of available study hall teachers grouped by term, day, and period.
 *
 * @param appSettings - An array of application settings retrieved from the spreadsheet.
 * @returns Flat array of schedule entries for study teachers.
 */
function parseStudyGrid(appSettings) {
    const terms = { 'Duties S1': 's1', 'Duties S2': 's2' };
    const recordMap = new Map();
    const spreadsheetId = getStudySpreadsheetId(appSettings);
    if (!spreadsheetId)
        return [];
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    if (!spreadsheet)
        return [];
    const sheetsToParse = ['Duties S1', 'Duties S2'];
    sheetsToParse.forEach(sheetName => {
        const sheet = spreadsheet.getSheetByName(sheetName);
        if (!sheet)
            return;
        const currentTerm = terms[sheetName];
        const data = sheet.getDataRange().getValues();
        if (data.length < 2)
            return;
        const headerRow = data[1];
        let lastStudyRow = findLastStudyRow(data);
        for (let col = 2; col < headerRow.length; col++) {
            let currentDay = null;
            if (headerRow[col] && headerRow[col].toString().trim() !== '') {
                currentDay = headerRow[col].toString().trim();
            }
            if (!currentDay)
                continue;
            let currentPeriod = null;
            for (let row = 2; row <= lastStudyRow; row++) {
                const cell = data[row][col];
                if (typeof cell === "number") {
                    currentPeriod = cell.toString().trim();
                    continue;
                }
                if (!currentPeriod)
                    throw new Error('Error parsing study schedule');
                const teacherName = cell.toString().trim();
                if (teacherName.length === 0)
                    continue;
                const mapKey = `${currentTerm}_${currentDay}_${currentPeriod}`;
                if (recordMap.has(mapKey)) {
                    recordMap.get(mapKey).teachers.push(teacherName);
                }
                else {
                    const newEntry = {
                        term: currentTerm,
                        day: currentDay,
                        period: currentPeriod,
                        teachers: [teacherName]
                    };
                    recordMap.set(mapKey, newEntry);
                }
            }
        }
    });
    return [...recordMap.values()];
}
/**
 * Finds the index of the last row containing study hall duty data,
 * ignoring any "Location" or lunch duty information further down in the sheet.
 *
 * @param data - The 2D array of spreadsheet data.
 * @returns The row index indicating the end of the study duty block.
 */
function findLastStudyRow(data) {
    const block = data.map(r => String(r[1]));
    let locationIndex = block.indexOf("Location");
    if (locationIndex < 0)
        locationIndex = data.length;
    return locationIndex - 1;
}
/**
 * Retrieves the spreadsheet ID for the Study Teachers document from the settings array.
 *
 * @param appSettings - An array of application settings.
 * @returns The spreadsheet ID string, or an empty string if not found.
 */
function getStudySpreadsheetId(appSettings) {
    const setting = appSettings.find(s => s.key === 'DocId_Study_Teachers');
    if (!setting)
        return "";
    return setting.value;
}
