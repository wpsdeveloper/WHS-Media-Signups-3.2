"use strict";
/**
 * Saves form data into the spreadsheet
 */
function submitForm(submittedSignup) {
    let signup = { ...submittedSignup };
    if (submittedSignup.firstname === "" || submittedSignup.lastname === "") {
        const { firstname, lastname } = lookupStudentName(submittedSignup);
        signup = { ...signup, firstname, lastname };
    }
    // if row is blank, make a new signup entry. Otherwise, update the existing record.
    const rowIdExists = signup.hasOwnProperty("rowId") && (typeof signup.rowId === "string") && (submittedSignup.rowId.length > 0);
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
    // get all signup data
    var sheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
    if (!sheet)
        throw STANDARD_SERVER_ERROR;
    let data = sheet.getDataRange().getValues();
    let success = false;
    data.forEach((row, index) => {
        const rowId = row[SIGNUPS_COL.ROW_ID];
        // skip blank rows
        if ((rowId === "") || (rowId === null) || (typeof rowId !== "string")) {
            return;
        }
        if (row[SIGNUPS_COL.ROW_ID] === submittedData.rowId) {
            updateReservationInSpreadsheet(submittedData, row, index + 1);
            success = true;
        }
    });
    if (!success) {
        throw new Error("Error updating reservation");
    }
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
