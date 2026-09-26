"use strict";
function parseStudyGrid(appSettings) {
    const terms = { 'Duties S1': 's1', 'Duties S2': 's2' };
    const records = [];
    const recordMap = new Map();
    const spreadsheetId = getStudySpreadsheetId(appSettings);
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
        // Header row 2 contains Days "Day 1", "Day 2", ...
        const headerRow = data[1];
        // get the last row, before any lunch duty nonsense in the chart
        let lastStudyRow = findLastStudyRow(data);
        // Process columns starting from column index 1 (skipping blank and block column
        for (let col = 2; col < headerRow.length; col++) {
            let currentDay = null;
            if (headerRow[col] && headerRow[col].toString().trim() !== '') {
                currentDay = headerRow[col].toString().trim();
            }
            if (!currentDay)
                continue;
            let currentPeriod = null;
            // Loop through rows from row index 2 looking for period or teacher
            for (let row = 2; row <= lastStudyRow; row++) {
                const cell = data[row][col];
                // if cell is a number, then this is the period
                if (typeof cell === "number") {
                    currentPeriod = cell.toString().trim();
                    continue;
                }
                // if we reached a string without a period, there's an issue.
                if (!currentPeriod)
                    throw new Error('Error parsing study schedule');
                const teacherName = cell.toString().trim();
                if (teacherName.length === 0)
                    continue;
                const mapKey = `${currentTerm}_${currentDay}_${currentPeriod}`;
                // add teacher to existing record or create new record
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
function findLastStudyRow(data) {
    const block = data.map(r => String(r[1]));
    let locationIndex = block.indexOf("Location");
    if (locationIndex < 0)
        locationIndex = data.length;
    return locationIndex - 1;
}
function getStudySpreadsheetId(appSettings) {
    const setting = appSettings.find(s => s.key === 'DocId_Study_Teachers');
    if (!setting)
        return "";
    return setting.value;
}
