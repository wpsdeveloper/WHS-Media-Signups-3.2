
/**
 * Returns all students at the school, as found in the spreadsheet.
 * Note: a script in the spreadsheet imports these names into the ss nightly 
 */
function getStudents(): Student[] {
  // gets all student data from the spreadsheet
  const sheet = SPREADSHEET.getSheetByName(STUDENTS_SHEET_NAME);
  if (!sheet) throw STANDARD_SERVER_ERROR;

  const values = sheet.getDataRange().getValues();
  
  // creates an array to return
  const students: Student[] = [];
  values.forEach(row => {
    students.push({email: row[0], lastname: row[1], firstname: row[2]});
  })
  return students;
}


function lookupStudentName(signup: Signup): {firstname: string, lastname: string} {
  const user = AdminDirectory!.Users.get(signup.emailStudent);
  const firstname = user?.name?.givenName? user.name.givenName : "";
  const lastname = user?.name?.familyName ? user.name.familyName : "";

  return {firstname, lastname};
}

function getNoFlyList(): string[] {
  const sheet = SPREADSHEET.getSheetByName(NO_FLY_LIST_SHEET_NAME);
  if (!sheet) return [];

  const emails = sheet.getDataRange().getValues();
  const nonBlanks = emails.filter(row => row[0].length > 0);
  const emailsArray = nonBlanks.map(row => row[0]);
  return emailsArray;
}
