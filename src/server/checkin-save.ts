
/**
 * Test function to simulate a checkin save
 */
function testCheckin() {
  setCheckin('studyIn1', 'd724b8a7-85d6-49fc-b2cb-9193e0f8c47d', '6:25 PM');
}

/**
 * Stores a time value for a checkin into the spreadsheet
 * 
 * @param checkinType The type of checkin being recorded (e.g. studyIn1, mediaIn)
 * @param id The unique identifier for the row to update
 * @param value The time value to store in the spreadsheet
 * @returns An object containing the saved checkin details
 * @throws Error if no records are found, the row ID is not found, or the save fails
 */
function setCheckin(checkinType: CheckinType, id: string, value: string) {
  const sheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
  if (!sheet) throw STANDARD_SERVER_ERROR;

  const lastRow = sheet.getLastRow();
  // Ensure there is data beyond the header row
  if (lastRow <= 1) {
    throw new Error("Error saving check in value: no records found");
  }

  // Fetch only the ROW_ID column (1-indexed: row 2 to lastRow, 1 column wide)
  const idValues = sheet.getRange(2, SIGNUPS_COL.ROW_ID + 1, lastRow - 1, 1).getValues();

  // Find the row that matches the provided ID
  let targetRowIndex = -1;
  for (let i = 0; i < idValues.length; i++) {
    if (idValues[i][0] === id) {
      targetRowIndex = i + 2; // +2 for 1-based index and header row offset
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error("Error saving check in value: row ID not found");
  }

  // Selects the correct column based on checkinType
  let columnIndex: number | null = null;
  switch (checkinType) {
    case "studyIn1":
      columnIndex = SIGNUPS_COL.STUDY_IN_1;
      break;
    case "mediaIn":
      columnIndex = SIGNUPS_COL.MEDIA_IN;
      break;
    case "mediaOut":
      columnIndex = SIGNUPS_COL.MEDIA_OUT;
      break;
    case "studyIn2":
      columnIndex = SIGNUPS_COL.STUDY_IN_2;
      break;
  }

  // If a valid column was found, save the value to the spreadsheet
  if (columnIndex !== null) {
    sheet.getRange(targetRowIndex, columnIndex + 1).setValue(value);
    return { type: checkinType, id: id, value: value };
  }

  throw new Error("Error saving check in value");
}