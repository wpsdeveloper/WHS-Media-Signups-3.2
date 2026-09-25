"use strict";
/**
 * Returns all students at the school, as found in the spreadsheet.
 * Note: a script in the spreadsheet imports these names into the ss nightly
 */
function getStudents() {
    const cache = CacheService.getScriptCache();
    const cached = cache.get("students_v1");
    if (cached) {
        try {
            console.log("Returning cached student data");
            return JSON.parse(cached);
        }
        catch (e) {
            console.warn("Cache parse failed, refetching students", e);
        }
    }
    const calendarBlocks = getStudentsFromSheets();
    // Cache for 6 hours (21600 seconds = max allowed in GAS CacheService)
    try {
        console.log("Caching student data");
        cache.put("students_v1", JSON.stringify(calendarBlocks), 21600);
    }
    catch (e) {
        console.warn("Cache storage failed", e);
    }
    return calendarBlocks;
}
function getStudentsFromSheets() {
    // gets all student data from the spreadsheet
    const sheet = SPREADSHEET.getSheetByName(STUDENTS_SHEET_NAME);
    if (!sheet)
        throw STANDARD_SERVER_ERROR;
    const values = sheet.getDataRange().getValues();
    // creates an array to return
    const students = [];
    values.forEach(row => {
        students.push({ email: row[0], lastname: row[1], firstname: row[2] });
    });
    return students;
}
function lookupStudentName(signup) {
    const user = AdminDirectory.Users.get(signup.emailStudent);
    const firstname = user?.name?.givenName ? user.name.givenName : "";
    const lastname = user?.name?.familyName ? user.name.familyName : "";
    return { firstname, lastname };
}
function getNoFlyList() {
    const sheet = SPREADSHEET.getSheetByName(NO_FLY_LIST_SHEET_NAME);
    if (!sheet)
        return [];
    const emails = sheet.getDataRange().getValues();
    const nonBlanks = emails.filter(row => row[0].length > 0);
    const emailsArray = nonBlanks.map(row => row[0]);
    return emailsArray;
}
// Fast server-side lookup (returns max 10-15 matches)
function searchStudents(query) {
    if (!query || query.trim().length < 2)
        return [];
    if (!isStaff() && !mayViewAdmin()) {
        // Security check: non-staff cannot search other students
        return [];
    }
    const cleanQuery = query.trim().toLowerCase();
    // Use CacheService or read the sheet once
    const students = getStudents(); // or cached roster
    const matches = [];
    for (let i = 0; i < students.length; i++) {
        const s = students[i];
        const fullName = `${s.lastname}, ${s.firstname}`.toLowerCase();
        if (fullName.includes(cleanQuery) || s.email.toLowerCase().includes(cleanQuery)) {
            matches.push(s);
            if (matches.length >= 10)
                break; // Limit payload to 10 suggestions!
        }
    }
    return matches;
}
