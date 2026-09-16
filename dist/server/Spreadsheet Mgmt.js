/** 
 * This page of code contains spreadsheet management functions that are not
 * part of the web app. They control nightly archiving and syncing. 
 */

/**
 * Moves old signup data to a different sheet. This saves on server processing time when a user is using the system.
 * Note: this function is on a nightly trigger.
 */
function archiveOldSignups() {
  // gets a date two weeks ago
  const today = new Date();
  const twoWeeksAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate()-14);

  // gets all current signup data
  const signupsSheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
  const archiveSheet = SPREADSHEET.getSheetByName(ARCHIVE_SHEET_NAME);
  const values = signupsSheet.getDataRange().getValues();

  // if there are no data row, return
  if (values.length <=1) {
    return;
  }

  // cycles through rows, cut/pasting into the archive sheet.
  // counts DOWN so that deleting rows doesn't interfere with the row count
  for (var i = values.length -1; i >= 1; i--) {
    const row = values[i];
    
    // gets the row's saved date
    let date = row[SIGNUPS_COL.DATE];
    if (!date instanceof Date) {
      date = new Date(date);
    }

    if (date.getTime() < twoWeeksAgo.getTime()) {
      // add the row to the archive sheet
      archiveSheet.appendRow(row);

      //delete the row from the "current" sheet
      signupsSheet.deleteRow(i+1);
    }
  }
  // sorts the data latest first
  archiveSheet.getRange(2, 1, archiveSheet.getLastRow() -1, archiveSheet.getLastColumn()).sort({column: 4, ascending: false});
}

/**
 * Clears data from the Daily Schedules sheet and preps for new data
 */
function clearDailySchedulesSheet() {
  SPREADSHEET.getSheetByName(DAILY_SCHEDULES_SHEET_NAME).clear();
  SPREADSHEET.getSheetByName(DAILY_SCHEDULES_SHEET_NAME).appendRow(["Date", "Day"]);
}

/**
 * Updates the daily schedules saved in the spreadsheet from the Google calendar
 * Note: this script runs on a nightly trigger
 */
function updateDailySchedules() {
  // calculates the start and end of the school year (July 1 to June 30, to be safe)
  const today = new Date();
  const schoolYearStartYear = today.getMonth() <=5 ? today.getFullYear() - 1 : today.getFullYear();
  const schoolYearEndYear = today.getMonth() <=5 ? today.getFullYear() : today.getFullYear() +1;

  const schoolYearStartDate =  new Date(schoolYearStartYear, 6, 1, 0, 0, 0);
  const schoolYearEndDate =  new Date(schoolYearEndYear, 5, 30, 0, 0, 0);
  
  // gets all events between these dates from the Google Calendar
  const events = CalendarApp.getCalendarById(CALENDAR_ID).getEvents(schoolYearStartDate, schoolYearEndDate);

  // creates an array to insert into the spreadsheet
  const newSchedules = [];

  // cycles through each calendar event, adding only those that match "Day 1", "Day 2" etc
  events.forEach(event => {
    const eventTitle = event.getTitle().trim();
    if (!SCHEDULE_DAYS.includes(eventTitle)) {
      return;
    }

    const newRow = [];
    const eventDate = formatDateSlashes(new Date(event.getStartTime()));

    newRow[DAILY_SCHED_COL.DATE] = new Date(eventDate);
    newRow[DAILY_SCHED_COL.DAY] = eventTitle;
    
    // add the date and day to the array.
    newSchedules.push(newRow);

  });

  // clears the old data
  clearDailySchedulesSheet();

  // adds the new data
  SPREADSHEET.getSheetByName(DAILY_SCHEDULES_SHEET_NAME).getRange(2,1, newSchedules.length, 2).setValues(newSchedules);
}

/**
 * Updates the list of student names in the spreadsheet.
 * Note: this function runs on a nightly trigger
 */
function updateStudentNames() {
  const allUsers = [['Email', 'LastName', 'FirstName']];
  
  // cycle through pages of data
  let pageToken;
  let page;
  do {
    // gets 100 users from the directory
    page = AdminDirectory.Users.list({
      domain: 'wpsma.org',
      orderBy: 'givenName',
      maxResults: 100,
      pageToken: pageToken
    });
    const users = page.users;
    
    // if no more users, cycling is done
    if (!users) {
      console.log('No users found.');
      return;
    }

    // Add the user's names and email to the array
    for (const user of users) {
      const orgPath = user.orgUnitPath;
      // must be in one of the WHS organizational units
      if (orgPath.indexOf("WHS") >= 0) {
        allUsers.push([user.primaryEmail, user.name.familyName, user.name.givenName]);
      }
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

  // gets the sheet with student names
  const sheet = SPREADSHEET.getSheetByName(STUDENTS_SHEET_NAME);

  // clears the sheet
  sheet.clear();
  
  // saves all student data
  sheet.getRange(1, 1, allUsers.length, 3).setValues(allUsers);

  // sorts by email address (same as last then first)
  sheet.getRange(2, 1, allUsers.length-1, 3).sort(1);
}


