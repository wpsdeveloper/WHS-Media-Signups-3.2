"use strict";
function getSignups() {
    // filters for records within two weeks in the past or future
    const today = new Date();
    const twoWeeksAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
    const twoWeeksForward = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
    const values = getSignupsRows();
    const signups = filterSignupsByDate(values, twoWeeksAgo, twoWeeksForward);
    return signups;
}
function getSignupsRows() {
    const sheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
    if (!sheet)
        throw STANDARD_SERVER_ERROR;
    const values = sheet.getDataRange().getValues();
    values.shift();
    return values;
}
function filterSignupsByDate(originalSignups, firstDate, lastDate) {
    const signups = [];
    originalSignups.forEach(row => {
        const date = new Date(row[SIGNUPS_COL.DATE]);
        if ((date.getTime() >= firstDate.getTime()) && (date.getTime() <= lastDate.getTime())) {
            signups.push(parseSignupFromArray(row));
        }
    });
    return signups;
}
/**
 * Returns all students at the school, as found in the spreadsheet.
 * Note: a script in the spreadsheet imports these names into the ss nightly
 */
function getStudentAudit(submittedEmail) {
    console.log(submittedEmail);
    // gets all signups for a particular student
    const sheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
    const archiveSheet = SPREADSHEET.getSheetByName(ARCHIVE_SHEET_NAME);
    if (!sheet || !archiveSheet)
        throw STANDARD_SERVER_ERROR;
    const currentValues = sheet.getDataRange().getValues();
    const archivedValues = archiveSheet.getDataRange().getValues();
    const values = currentValues.concat(archivedValues);
    const filtered = values.filter(row => row[9] == submittedEmail);
    // creates an array to return
    const signups = [];
    filtered.forEach(row => {
        signups.push(parseSignupFromArray(row));
    });
    return JSON.stringify(signups);
}
function findSignupRow(signupRows, rowId) {
    // filters for data matching the row id
    const matched = signupRows.filter(su => su[SIGNUPS_COL.ROW_ID] === rowId);
    if (matched.length !== 1)
        return null;
    // converts row to an object and returns a stringified version
    const signup = parseSignupFromArray(matched[0]);
    return signup;
}
/**
 * Converts a signup spreadsheet row into a javascript object
 */
function parseSignupFromArray(row) {
    return {
        timestamp: new Date(row[SIGNUPS_COL.TIMESTAMP]),
        email: row[SIGNUPS_COL.SUBMITTED_BY],
        emailStudent: row[SIGNUPS_COL.STUDENT_EMAIL],
        lastname: row[SIGNUPS_COL.LASTNAME],
        firstname: row[SIGNUPS_COL.FIRSTNAME],
        date: new Date(row[SIGNUPS_COL.DATE]),
        period: row[SIGNUPS_COL.PERIOD],
        type: row[SIGNUPS_COL.TYPE],
        teacherStudy: row[SIGNUPS_COL.TEACHER_STUDY],
        subject: row[SIGNUPS_COL.SUBJECT],
        purpose: row[SIGNUPS_COL.PURPOSE],
        teacherAcad: row[SIGNUPS_COL.TEACHER_ACAD],
        room: row[SIGNUPS_COL.GLASS_ROOM],
        comments: row[SIGNUPS_COL.COMMENTS],
        rowId: row[SIGNUPS_COL.ROW_ID],
        studyIn1: row[SIGNUPS_COL.STUDY_IN_1],
        mediaIn: row[SIGNUPS_COL.MEDIA_IN],
        mediaOut: row[SIGNUPS_COL.MEDIA_OUT],
        studyIn2: row[SIGNUPS_COL.STUDY_IN_2],
    };
}
/**
 * Converts a javascript signup object to a spreadsheet row array
 */
function makeSignupRow(obj) {
    var row = new Array(18);
    row[SIGNUPS_COL.TIMESTAMP] = obj.timestamp;
    row[SIGNUPS_COL.SUBMITTED_BY] = obj.email;
    row[SIGNUPS_COL.STUDENT_EMAIL] = obj.emailStudent;
    row[SIGNUPS_COL.LASTNAME] = obj.lastname;
    row[SIGNUPS_COL.FIRSTNAME] = obj.firstname;
    row[SIGNUPS_COL.DATE] = obj.date;
    row[SIGNUPS_COL.PERIOD] = obj.period;
    row[SIGNUPS_COL.TYPE] = obj.type;
    row[SIGNUPS_COL.TEACHER_STUDY] = obj.teacherStudy;
    row[SIGNUPS_COL.SUBJECT] = obj.subject;
    row[SIGNUPS_COL.PURPOSE] = obj.purpose;
    row[SIGNUPS_COL.TEACHER_ACAD] = obj.teacherAcad;
    row[SIGNUPS_COL.GLASS_ROOM] = obj.room;
    row[SIGNUPS_COL.COMMENTS] = obj.comments;
    row[SIGNUPS_COL.ROW_ID] = obj.rowId;
    row[SIGNUPS_COL.STUDY_IN_1] = obj.studyIn1 || "";
    row[SIGNUPS_COL.MEDIA_IN] = obj.mediaIn || "";
    row[SIGNUPS_COL.MEDIA_OUT] = obj.mediaOut || "";
    row[SIGNUPS_COL.STUDY_IN_2] = obj.studyIn2 || "";
    return row;
}
