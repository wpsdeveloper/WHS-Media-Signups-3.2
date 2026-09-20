"use strict";
function parseStudyGrid(appSettings) {
    const terms = { 'Duties S1': 's1', 'Duties S2': 's2' };
    const records = [];
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
                // add teacher to existing record or create new record
                const match = records.filter(r => r.day == currentDay
                    && r.period == currentPeriod
                    && r.term == currentTerm);
                if (Array.isArray(match) && match.length > 0) {
                    match[0].teachers.push(teacherName);
                }
                else {
                    records.push({
                        term: currentTerm,
                        day: currentDay,
                        period: currentPeriod,
                        teachers: [teacherName]
                    });
                }
            }
        }
    });
    return records;
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
