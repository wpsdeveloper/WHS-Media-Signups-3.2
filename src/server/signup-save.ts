/**
 * @file signup-save.ts
 * @description Handles form submission saving, updating existing reservations, and adding new reservations to the spreadsheet.
 */

/**
 * Saves form data into the spreadsheet (either adding a new reservation or updating an existing one).
 * 
 * @param submittedSignup - JSON string of submitted signup data.
 * @returns The saved Signup object.
 */
function submitForm(submittedSignup: string) {
  const parsed = safeJsonParse(submittedSignup);
  let signup = hydrateSignup(parsed);
  if (signup.firstname === "" || signup.lastname === "") {
    const { firstname, lastname } = lookupStudentName(signup);
    signup = {...signup, firstname, lastname};
  }
  
  const rowIdExists = signup.hasOwnProperty("rowId") && (typeof signup.rowId === "string") && (signup.rowId.length > 0);

  if (rowIdExists) {
    return updateReservation(signup)
  } else {
    return addNewReservation(signup);
  }
}

/** 
 * Updates an existing signup row in the spreadsheet.
 * 
 * @param submittedData - The updated Signup data.
 * @throws Error if the user lacks edit permission or the row is not found.
 */
function updateReservation(submittedData: Signup) {
  if (!mayEdit()) {
    throw new Error("Insufficient access. You do not have permission to edit signup data.");
  }

  if (!SPREADSHEET) throw STANDARD_SERVER_ERROR;

  var sheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
  if (!sheet) throw STANDARD_SERVER_ERROR;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("Error updating reservation: no records found");
  }

  const idValues = sheet.getRange(2, SIGNUPS_COL.ROW_ID + 1, lastRow - 1, 1).getValues();

  let targetRowIndex = -1;
  for (let i = 0; i < idValues.length; i++) {
    const rowId = idValues[i][0];
    if (typeof rowId === "string" && rowId === submittedData.rowId) {
      targetRowIndex = i + 2;
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error("Error updating reservation: row ID not found");
  }

  const existingRow = sheet.getRange(targetRowIndex, 1, 1, sheet.getLastColumn()).getValues()[0] as SSRow;
  updateReservationInSpreadsheet(submittedData, existingRow, targetRowIndex);
}

/**
 * Updates reservation data in the spreadsheet row, preserving check-ins and timestamps.
 * 
 * @param submittedData - The updated Signup data.
 * @param row - Existing row data array.
 * @param rowNum - Row number in sheet.
 */
function updateReservationInSpreadsheet(submittedData:Signup, row:SSRow, rowNum: number) {
  if (!SPREADSHEET) throw STANDARD_SERVER_ERROR;

  const newRow = makeSignupRow(submittedData);
  
  newRow[SIGNUPS_COL.STUDY_IN_1] = row[SIGNUPS_COL.STUDY_IN_1];
  newRow[SIGNUPS_COL.MEDIA_IN] = row[SIGNUPS_COL.MEDIA_IN];
  newRow[SIGNUPS_COL.MEDIA_OUT] = row[SIGNUPS_COL.MEDIA_OUT];
  newRow[SIGNUPS_COL.STUDY_IN_2] = row[SIGNUPS_COL.STUDY_IN_2];
  newRow[SIGNUPS_COL.TIMESTAMP] = row[SIGNUPS_COL.TIMESTAMP];

  const sheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
  if (!sheet) throw STANDARD_SERVER_ERROR;

  sheet.getRange(rowNum, 1, 1, newRow.length).setValues([newRow]);
}

/**
 * Adds a new signup to the spreadsheet and sends a confirmation email.
 * 
 * @param signup - The new Signup record.
 * @returns The saved Signup object with generated UUID and timestamp.
 */
function addNewReservation(signup: Signup) {
  saveNewReservationToSpreadsheet(signup)
  sendConfirmationMessage(signup);

  return signup;
}

/**
 * Appends a new reservation row to the spreadsheet.
 * 
 * @param signup - The Signup record to save.
 */
function saveNewReservationToSpreadsheet(signup: Signup) {
  signup.rowId = Utilities.getUuid();
  signup.timestamp = new Date();

  const newRow = makeSignupRow(signup);
  if (!SPREADSHEET) throw STANDARD_SERVER_ERROR;

  const sheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME)
  if (!sheet) throw STANDARD_SERVER_ERROR;
    
  sheet.appendRow(newRow); 
}
