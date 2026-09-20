"use strict";
/**
 * Parses the "S1" and "S2" sheets in Google Apps Script.
 * @returns {InterventionsEntry[]} Flat array of schedule entries.
 */
function parseInterventionsGrid() {
    const terms = { S1: 's1', S2: 's2' };
    const records = [];
    const sheetsToParse = ['S1', 'S2'];
    sheetsToParse.forEach(sheetName => {
        const sheet = SPREADSHEET.getSheetByName(sheetName);
        if (!sheet)
            return;
        const currentTerm = terms[sheetName];
        const data = sheet.getDataRange().getValues();
        if (data.length < 2)
            return;
        // Header row contains Days (e.g., Row 1: ["Teacher", "Day 1", "Day 1", ...])
        const headerRow = data[0];
        // Process columns starting from column index 1 (skipping "Teacher" column)
        for (let col = 1; col < headerRow.length; col++) {
            let currentDay = null;
            // Handle merged header cells where the day name only appears in the first cell
            if (headerRow[col] && headerRow[col].toString().trim() !== '') {
                currentDay = headerRow[col].toString().trim();
            }
            if (!currentDay)
                continue;
            let currentPeriod = null;
            // Loop through teacher rows starting from row index 2
            for (let row = 1; row < data.length; row++) {
                const cell = data[row][col];
                if (parseInt(cell) === 0) {
                    currentPeriod = cell;
                }
                if (!currentPeriod)
                    continue;
                const teacherName = String(cell);
                const match = records.filter(r => r.day == currentDay
                    && r.period == currentPeriod
                    && r.term == currentTerm);
                if (match) {
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
