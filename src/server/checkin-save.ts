
/**
 * Stores a time value for a checkin into the spreadsheet
 */
function setCheckin(checkinType: CheckinType, id: string, value: string) {
  //gets all signup data
  const sheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
  if (!sheet) throw STANDARD_SERVER_ERROR;

  const values = sheet.getDataRange().getValues();

  // cycles through the records to find a rowId match
  for (var rowIndex=1; rowIndex<values.length; rowIndex++) {
    const row = values[rowIndex];
    const rowId = row[SIGNUPS_COL.ROW_ID];
    
    // selects the correct column based on checkinType
    let columnIndex = null;
    if (rowId === id) {
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

      if (columnIndex !== null) {
        sheet.getRange(rowIndex +1, columnIndex +1).setValue(value);
        return {type: checkinType, id: id, value: value};
      }
    }
  }
  // if no return occurred, there must have been a error finding the row id
  throw new Error("Error saving check in value");
}