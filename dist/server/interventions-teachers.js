"use strict";
/**
 * @file interventions-teachers.ts
 * @description Parses intervention teacher schedules from external Google Sheets documents.
 * @url https://github.com/wpsdeveloper/WHS-Media-Signups-3.2
 */
/**
 * Parses the "S1" and "S2" sheets from the Interventions spreadsheet in Google Apps Script.
 * Retrieves a flattened array of available intervention teachers grouped by term, day, and period.
 *
 * @param appSettings - An array of application settings retrieved from the spreadsheet.
 * @returns Flat array of schedule entries for intervention teachers.
 */
function parseInterventionsGrid(appSettings) {
    const terms = { S1: 's1', S2: 's2' };
    const recordMap = new Map();
    const spreadsheetId = getInterventionSpreadsheetId(appSettings);
    if (!spreadsheetId)
        return [];
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    if (!spreadsheet)
        return [];
    const sheetsToParse = ['S1', 'S2'];
    sheetsToParse.forEach((sheetName) => {
        const sheet = spreadsheet.getSheetByName(sheetName);
        if (!sheet)
            return;
        const currentTerm = terms[sheetName];
        const data = sheet.getDataRange().getValues();
        if (data.length < 2)
            return;
        const headerRow = data[0];
        for (let col = 1; col < headerRow.length; col++) {
            let currentDay = null;
            if (headerRow[col] && headerRow[col].toString().trim() !== '') {
                currentDay = headerRow[col].toString().trim();
            }
            if (!currentDay)
                continue;
            let currentPeriod = null;
            for (let row = 1; row < data.length; row++) {
                const cell = data[row][col];
                if (typeof cell === 'number') {
                    currentPeriod = cell.toString().trim();
                    continue;
                }
                if (!currentPeriod)
                    continue;
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
                        teachers: [teacherName],
                    };
                    recordMap.set(mapKey, newEntry);
                }
            }
        }
    });
    return [...recordMap.values()];
}
/**
 * Retrieves the spreadsheet ID for the Interventions document from the settings array.
 *
 * @param appSettings - An array of application settings.
 * @returns The spreadsheet ID string, or an empty string if not found.
 */
function getInterventionSpreadsheetId(appSettings) {
    const setting = appSettings.find((s) => s.key === 'DocId_Interventions');
    if (!setting)
        return '';
    return setting.value;
}
