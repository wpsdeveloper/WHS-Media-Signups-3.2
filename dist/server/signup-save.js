"use strict";
/**
 * Saves form data into the spreadsheet
 */
function submitForm(submittedSignup) {
    const parsed = safeJsonParse(submittedSignup);
    let signup = hydrateSignup(parsed);
    if (signup.firstname === "" || signup.lastname === "") {
        const { firstname, lastname } = lookupStudentName(signup);
        signup = { ...signup, firstname, lastname };
    }
    // if row is blank, make a new signup entry. Otherwise, update the existing record.
    const rowIdExists = signup.hasOwnProperty("rowId") && (typeof signup.rowId === "string") && (signup.rowId.length > 0);
    if (rowIdExists) {
        return updateReservation(signup);
    }
    else {
        return addNewReservation(signup);
    }
}
/**
 * Updates an existing signup row in the spreadsheet
 */
function updateReservation(submittedData) {
    // throw error if the user is not allowed to edit existing data
    if (!mayEdit()) {
        throw new Error("Insufficient access. You do not have permission to edit signup data.");
    }
    if (!SPREADSHEET)
        throw STANDARD_SERVER_ERROR;
    var sheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
    if (!sheet)
        throw STANDARD_SERVER_ERROR;
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
        throw new Error("Error updating reservation: no records found");
    }
    // Fetch only the ROW_ID column (1-indexed: row 2 to lastRow, 1 column wide)
    const idValues = sheet.getRange(2, SIGNUPS_COL.ROW_ID + 1, lastRow - 1, 1).getValues();
    let targetRowIndex = -1;
    for (let i = 0; i < idValues.length; i++) {
        const rowId = idValues[i][0];
        if (typeof rowId === "string" && rowId === submittedData.rowId) {
            targetRowIndex = i + 2; // +2 for 1-based index and header row offset
            break;
        }
    }
    if (targetRowIndex === -1) {
        throw new Error("Error updating reservation: row ID not found");
    }
    // Read only the existing row that needs updating to preserve timestamp and checkins
    const existingRow = sheet.getRange(targetRowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
    updateReservationInSpreadsheet(submittedData, existingRow, targetRowIndex);
}
function updateReservationInSpreadsheet(submittedData, row, rowNum) {
    if (!SPREADSHEET)
        throw STANDARD_SERVER_ERROR;
    const newRow = makeSignupRow(submittedData);
    // copy old checkin and timestamp data to the new row (so it doesn't get overwritten)
    newRow[SIGNUPS_COL.STUDY_IN_1] = row[SIGNUPS_COL.STUDY_IN_1];
    newRow[SIGNUPS_COL.MEDIA_IN] = row[SIGNUPS_COL.MEDIA_IN];
    newRow[SIGNUPS_COL.MEDIA_OUT] = row[SIGNUPS_COL.MEDIA_OUT];
    newRow[SIGNUPS_COL.STUDY_IN_2] = row[SIGNUPS_COL.STUDY_IN_2];
    newRow[SIGNUPS_COL.TIMESTAMP] = row[SIGNUPS_COL.TIMESTAMP];
    // save the data in the spreadsheet
    const sheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
    if (!sheet)
        throw STANDARD_SERVER_ERROR;
    sheet.getRange(rowNum, 1, 1, newRow.length).setValues([newRow]);
}
/**
 * Adds a new signup to the spreadsheet
 */
function addNewReservation(signup) {
    saveNewReservationToSpreadsheet(signup);
    sendConfirmationMessage(signup);
    return signup;
}
function saveNewReservationToSpreadsheet(signup) {
    signup.rowId = Utilities.getUuid();
    signup.timestamp = new Date();
    // converts the object into an array in the correct order
    const newRow = makeSignupRow(signup);
    if (!SPREADSHEET)
        throw STANDARD_SERVER_ERROR;
    const sheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
    if (!sheet)
        throw STANDARD_SERVER_ERROR;
    sheet.appendRow(newRow);
}
