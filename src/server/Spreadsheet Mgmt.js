/**
 * @file Spreadsheet Mgmt.js
 * @description Spreadsheet management functions that run on nightly triggers for archiving old signups, syncing daily schedules from Google Calendar, and updating student directories.
 * @url https://github.com/wpsdeveloper/WHS-Media-Signups-3.2
 */

/**
 * Moves old signup data to the archive sheet to save on server processing time when users access the system.
 * Note: This function runs on a nightly trigger.
 */
function archiveOldSignups() {
  const today = new Date();
  const twoWeeksAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate()-14);

  const signupsSheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
  const archiveSheet = SPREADSHEET.getSheetByName(ARCHIVE_SHEET_NAME);
  if (!signupsSheet || !archiveSheet) return;

  const values = signupsSheet.getDataRange().getValues();

  if (values.length <= 1) {
    return;
  }

  // Cycles through rows, cut/pasting into the archive sheet.
  // Counts DOWN so that deleting rows doesn't interfere with the row count indices.
  for (var i = values.length - 1; i >= 1; i--) {
    const row = values[i];
    
    let date = row[SIGNUPS_COL.DATE];
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    if (date.getTime() < twoWeeksAgo.getTime()) {
      archiveSheet.appendRow(row);
      signupsSheet.deleteRow(i + 1);
    }
  }

  // Sorts the archive data latest first
  if (archiveSheet.getLastRow() > 1) {
    archiveSheet.getRange(2, 1, archiveSheet.getLastRow() - 1, archiveSheet.getLastColumn()).sort({column: 4, ascending: false});
  }
}

/**
 * Clears data from the Daily Schedules sheet and prepares headers for new data.
 */
function clearDailySchedulesSheet() {
  const sheet = SPREADSHEET.getSheetByName(DAILY_SCHEDULES_SHEET_NAME);
  if (!sheet) return;
  sheet.clear();
  sheet.appendRow(["Date", "Day"]);
}

/**
 * Updates the daily schedules saved in the spreadsheet from the Google Calendar.
 * Note: This function runs on a nightly trigger.
 */
function updateDailySchedules() {
  const today = new Date();
  const schoolYearStartYear = today.getMonth() <= 5 ? today.getFullYear() - 1 : today.getFullYear();
  const schoolYearEndYear = today.getMonth() <= 5 ? today.getFullYear() : today.getFullYear() + 1;

  const schoolYearStartDate = new Date(schoolYearStartYear, 6, 1, 0, 0, 0);
  const schoolYearEndDate = new Date(schoolYearEndYear, 5, 30, 0, 0, 0);
  
  const events = CalendarApp.getCalendarById(CALENDAR_ID).getEvents(schoolYearStartDate, schoolYearEndDate);
  const newSchedules: any[][] = [];

  events.forEach(event => {
    const eventTitle = event.getTitle().trim();
    if (!SCHEDULE_DAYS.includes(eventTitle as Day)) {
      return;
    }

    const newRow: any[] = [];
    const eventDate = formatDateSlashes(new Date(event.getStartTime()));

    newRow[DAILY_SCHED_COL.DATE] = new Date(eventDate);
    newRow[DAILY_SCHED_COL.DAY] = eventTitle;
    
    newSchedules.push(newRow);
  });

  clearDailySchedulesSheet();

  if (newSchedules.length > 0) {
    SPREADSHEET.getSheetByName(DAILY_SCHEDULES_SHEET_NAME)?.getRange(2, 1, newSchedules.length, 2).setValues(newSchedules);
  }
}

/**
 * Updates the list of student names in the spreadsheet from Google Workspace Admin Directory.
 * Note: This function runs on a nightly trigger.
 */
function updateStudentNames() {
  const allUsers: string[][] = [['Email', 'LastName', 'FirstName']];
  
  let pageToken: string | undefined = undefined;
  do {
    const page = AdminDirectory.Users.list({
      domain: 'wpsma.org',
      orderBy: 'givenName',
      maxResults: 100,
      pageToken: pageToken
    });
    const users = page.users;
    
    if (!users) {
      console.warn('No users found.');
      return;
    }

    for (const user of users) {
      const orgPath = user.orgUnitPath;
      if (orgPath && orgPath.indexOf("WHS") >= 0) {
        if (user.primaryEmail && user.name?.familyName && user.name?.givenName) {
          allUsers.push([user.primaryEmail, user.name.familyName, user.name.givenName]);
        }
      }
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

  const sheet = SPREADSHEET.getSheetByName(STUDENTS_SHEET_NAME);
  if (!sheet) return;

  sheet.clear();
  
  if (allUsers.length > 0) {
    sheet.getRange(1, 1, allUsers.length, 3).setValues(allUsers);
  }

  if (allUsers.length > 1) {
    sheet.getRange(2, 1, allUsers.length - 1, 3).sort(1);
  }
}
