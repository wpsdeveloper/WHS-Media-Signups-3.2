"use strict";
function buildFlatScheduleData(appSettings) {
    const rotationGrid = MASTER_ROTATION_GRID;
    const interventionTeachers = parseInterventionsGrid(appSettings);
    const studyTeachers = parseStudyGrid(appSettings);
    const scheduleBlocks = parseRotation(rotationGrid, interventionTeachers, studyTeachers);
    const calendarRows = getSheetData(DAILY_SCHEDULES_SHEET_NAME);
    const calendarDays = parseCalendarRows(calendarRows);
    const specialsRows = getSheetData(SPECIAL_SCHEDULES_SHEET_NAME);
    const specialsDates = parseSpecialRows(specialsRows);
    const dailySchedules = buildCalendarBlocks(calendarDays, scheduleBlocks, specialsDates);
    return dailySchedules;
}
function getSheetData(sheetName) {
    const sheet = SPREADSHEET.getSheetByName(sheetName);
    if (!sheet)
        return [];
    const range = sheet.getDataRange();
    if (!range)
        return [];
    const rows = range.getValues();
    rows.shift();
    return rows;
}
function parseRotation(rotationGrid, interventionTeachers, studyTeachers) {
    const blocks = [];
    const terms = ['s1', 's2'];
    rotationGrid.forEach(row => {
        if (!row.day)
            return;
        const periods = row.periods;
        periods.forEach(period => {
            terms.forEach(term => {
                const intArray = interventionTeachers.find(item => item.day === row.day
                    && item.period === period
                    && item.term === term);
                const studyArray = studyTeachers.find(item => item.day === row.day
                    && item.period === period
                    && item.term === term);
                const block = {
                    term: 's1',
                    day: row.day,
                    period: period,
                    interventionTeachers: intArray?.teachers ?? [],
                    studyTeachers: studyArray?.teachers ?? [],
                };
                blocks.push(block);
            });
        });
    });
    return blocks;
}
function parseCalendarRows(rows) {
    const calendar = [];
    rows.forEach(row => {
        if ((row[0] === "") || (row[1] === ""))
            return;
        calendar.push({
            date: row[0],
            day: row[1]
        });
    });
    return calendar;
}
function parseSpecialRows(rows) {
    const specials = [];
    rows.forEach(row => {
        if ((row[0] === "") || (row[1] === ""))
            return;
        specials.push({
            date: row[0],
            period: String(row[1]),
            allowInterventions: String(row[2]),
            allowAssessmentMakeups: String(row[3]),
            allowAltSetting: String(row[4]),
            allowTutoring: String(row[5]),
            allowNonInterventions: String(row[6]),
            max: String(row[7]),
        });
    });
    return specials;
}
function buildCalendarBlocks(calendarDays, scheduleBlocks, specialRows) {
    const dailyBlocks = [];
    // gets the date when Semester 2 begins
    let s2DateTime = new Date("2100-01-01").getTime();
    const s2DateRange = SPREADSHEET.getRangeByName(S2_RANGE_NAME);
    if (s2DateRange) {
        const s2DateSetting = s2DateRange.getValue();
        if (s2DateSetting !== "") {
            s2DateTime = new Date(s2DateSetting).getTime();
        }
    }
    calendarDays.forEach(calDay => {
        const date = new Date(calDay.date);
        const day = calDay.day;
        const term = (date.getTime() < s2DateTime) ? 's1' : 's2';
        const masterGridSchedule = MASTER_ROTATION_GRID.find(item => item.day === day);
        if (!masterGridSchedule)
            return;
        const periods = masterGridSchedule.periods;
        periods.forEach(period => {
            const schedBlock = scheduleBlocks.find(item => item.term === term
                && item.day === day
                && item.period === period);
            if (!schedBlock)
                return;
            let newBlock = {
                ...schedBlock,
                date: date,
                ...EMPTY_SPECIAL
            };
            const special = findSpecial(specialRows, date, period);
            if (special) {
                newBlock = { ...newBlock, ...special };
            }
            dailyBlocks.push(newBlock);
        });
    });
    return dailyBlocks;
}
function findSpecial(specialRows, date, period) {
    const special = specialRows.find(item => isSameDate(new Date(item.date), date)
        && item.period === period);
    if (!special) {
        return null;
    }
    const thisSpecial = {
        allowInterventions: special.allowInterventions == "true",
        allowAssessmentMakeups: special.allowAssessmentMakeups == "true",
        allowAltSetting: special.allowAltSetting == "true",
        allowTutoring: special.allowTutoring == "true",
        allowNonInterventions: special.allowNonInterventions == "true",
        max: parseInt(special.max),
    };
    return thisSpecial;
}
