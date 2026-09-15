/** ======= SERVER CODE  ======== 
 *
 * Media Center Sign Up System
 * Walpole High School, Walpole, MA
 * @author: Tom Reeve, treeve@walpole.k12.ma.us
 *
 * Note: This script relies on the AdminDirectory Service to access student names
 * and email addresses. This Service requires admin-level access. 
 */

const SPREADSHEET_ID = '1LbVD6PYDns60osOfsRtUea3xyHr5BPyfAkhum0-eC5k'; // Google Sheet that holds the signup data

/**
 * Creates HTML and client-side script to serve to the user
 * 
 * @param {object} event Google-created parameter object
 * @return {HtmlOutput} Google-created HTML
 */
function doGet(event) {
  const template = createTemplateFromParameters(event);

  // sends the HTML to the client
  return template.evaluate()
    .setTitle("WHS Intervention & Media Center Sign Up")

    // adds meta data so tha page reformats nicely on mobile devices
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Creates html of the Script file. Used to attached javascript and CSS files
 * 
 * @return {string} HTML content
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

/**
 * Determines which page to show (and how much access the user gets)    
 * also adds simple variables to push to the HTML page
 * 
 * @param {object} event Google-created parameter object
 * @return {HTMLTemplate}
 */
function createTemplateFromParameters(event) {
  let template;
  const page = getUrlParameter(event, "page");

  if ((page === "attendance") && (mayViewAttendance())) {
    template = createAttendanceTemplate();

  } else if ((page === "admin") && (mayViewAdmin())) {
    template = createAdminTemplate();

  } else if (maySubmit()) {
    template = createSignupTemplate();

    if ((page === "update") && mayEdit()) {
      //get the url parament id to identify the row to edit
      const rowId = getUrlParameter(event, "id");
      template.ROW_ID = rowId;
    }
  } else {
    // creates a default "You can't be here" page
    template = HtmlService.createTemplateFromFile('Not Allowed');
  }

  // adds basic variables to send with the HTML
  template.LOGO_ID = LOGO_ID;
  template.SCRIPT_URL = getScriptUrl();
  template.WED_INT_ACTIVE = wednesdayInterventionsActive(); 
  return template;
}

function createAttendanceTemplate() {
  const template = HtmlService.createTemplateFromFile('Attendance');
  template.EDITOR = mayEdit();
  template.ADMIN = mayViewAdmin();
  return template;
}

function createAdminTemplate() {
  const template  = HtmlService.createTemplateFromFile('Admin');
  template.EDITOR = mayEdit();
  return template;
}

function createSignupTemplate() {
  const template = HtmlService.createTemplateFromFile('Signup Form');

  template.EMAIL = getEmail();
  template.EDITOR = mayEdit();
  template.ADMIN = mayViewAdmin();
  template.ROW_ID = "";
  template.INT_DOC_ID = getInterventionsDocId();
  template.TUTORING_DOC_ID = getTutoringDocId();
  template.TUTORING_ACTIVE = getTutoringStatus();
  
  return template;
}

function createIndexTemplate() {
  const template = HtmlService.createTemplateFromFile('ui.index.html');
  return template;
}

/**
 * Gets apps settings in stringified Json format
 */
function getAppSettingsJson() {
  return JSON.stringify(getAppSettingsArray());
}

/**
 * Gets apps settings from the spreadsheet
 */
function getAppSettingsArray() {
  const sheet = SPREADSHEET.getSheetByName(SETTINGS_SHEET_NAME)
  const settingsData = sheet.getRange(1,1, sheet.getLastRow(), 5).getValues();
  settingsData.shift(); // removes header row
  
  const settingsArray = [];
  settingsData.forEach(row => {
    if (row[0].length >0) {
      if (typeof row[1] !== "string") {
        row[1] = row[1].toString();
      }
      settingsArray.push(row);
    }
  })
  return settingsArray;
}

/**
 * saves apps settings from the spreadsheet
 */
function saveAppSettings(settingsJson) {
  const newSettings = JSON.parse(settingsJson);
  if (!Array.isArray(newSettings)) {
    throw new Error("Invalid data submission");
  }

  const headers = [
    ["Key", "Value", "Description", "Comments", "Type"]
  ];
  const newSheetRows = headers.concat(newSettings);
  console.log(newSheetRows);

  SPREADSHEET.getSheetByName(SETTINGS_SHEET_NAME).getDataRange().clear();
  SPREADSHEET.getSheetByName(SETTINGS_SHEET_NAME)
  .getRange(1, 1, newSheetRows.length, headers[0].length)
  .setValues(newSheetRows);

  return "Success";
}



/**
 * Formats a Date into MM/DD/YYYY
 * 
 * @param {Date} date The date to format
 * @return {string} The formatted string
 */
 function formatDateSlashes(date) {
  return (date.getMonth()+1) +"/" + date.getDate() + "/" + date.getFullYear();
}

function getInitialSignupFormData() {
  const initialData = {};

  // requests download of student names/emails
  const students = getStudentNames();
  initialData.students = students ? students : [];

  // requests download of daily schedules
  const dailySchedules = getDailySchedules();
  initialData.dailySchedules = dailySchedules ? dailySchedules : [];

  // requests download of recent signups
  const signups = getSignups();
  initialData.signups = signups ? signups : [];

  // reqeusts download of intervention teacher schedule
  const interventionTeachers = getInterventionTeachers();
  initialData.interventionTeachers = interventionTeachers ? interventionTeachers : [];

  // requests download of study hall teacher schedule
  const studyTeachers = getStudyTeachers();
  initialData.studyTeachers = studyTeachers ? studyTeachers : [];

  // gets the list of no fly students
  const noFlyList = getNoFlyList();
  initialData.noFlyList = noFlyList ? noFlyList : [];

  // get the max number of signups allowed
  const defaultMaxSignups = getDefaultMaxSignups();
  initialData.defaultMaxSignups = defaultMaxSignups ? defaultMaxSignups : 0;

  return initialData;
}

/**
 * Returns all daily schedules (e.g. March 4 = "Day 3") found in the spreadsheet.
 * Note: a script in the Spreadsheet Management file imports this data from a Google calendar nightly
 * 
 * @return {string} Stringified array of DailyScheduleData
 * */
function getDailySchedules() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("daily-schedules"); // data is cached as stringified JSON

  if (cached) {
    return cached;
  }
  const specials = SPREADSHEET.getSheetByName(SPECIAL_SCHEDULES_SHEET_NAME).getDataRange().getValues();
  const dailySchedulesRows = getDailySchedulesRows();
  const dailySchedulesObj = parseDailySchedules(dailySchedulesRows, specials);
  
  const stringifiedData = JSON.stringify(dailySchedulesObj);
  cache.put("daily-schedules", stringifiedData, 2160);

  // stringifies the data (needed because it contains date objects)
  return stringifiedData;
}

function getDailySchedulesRows() {
  const scheduleSheet = SPREADSHEET.getSheetByName(DAILY_SCHEDULES_SHEET_NAME);
  const scheduleRows = scheduleSheet.getDataRange().getValues();
  scheduleRows.shift(); // removes the header

  return scheduleRows;
}

function parseDailySchedules(scheduleRows, specialScheduleRows) {
  const dailySchedules = [];

  // builds the schedule object
  scheduleRows.forEach(row => {
    // determines the periods for this particular day. E.g. Day 1 needs periods [1, 2, 3, 4, 5, 6]
    let rowPeriods = [];
    if (PERIODS.hasOwnProperty(row[1])) {
      rowPeriods = PERIODS[row[1]];
    }

    const date = new Date(row[0]);
    const specialsThisDate = getSpecialScheduleFor(date, specialScheduleRows);

    // adds the object for this day to dailySchedules
    dailySchedules.push({
      date: row[0], 
      day: row[1], 
      periods: rowPeriods, 
      specials: specialsThisDate});
  })
  return dailySchedules;
}

function getDefaultMaxSignups() {
  let value = SPREADSHEET.getRangeByName(DEFAULT_MAX_SIGNUPS_RANGE_NAME).getValue();

  if (Number.isNaN(value)) {
    value = parseInt(value);
  }
  return value;
}

/**
 * Returns an array of email addresses for people allowed to edit. 
 * These values are stored in the settings page of the spreadsheet 
 * 
 * @return {string[]} Array of email addresses
 */
function getDataEditors() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("data-editors");

  if (cached) {
    return JSON.parse(cached);
  }
  
  const values = SPREADSHEET.getRangeByName(DATA_EDITORS_RANGE_NAME).getValue();
  // data is stored as comma-separated values
  const editors = parseDataEditors(values);

  cache.put("data-editors", JSON.stringify(editors), 21600);
  return editors;
}

function parseDataEditors(csvString) {
  let editors = csvString.split(",");
  editors = editors.map(e => e.trim());
  return editors;
}

/**
 * Returns the email address of the currently signin user. 
 * Note: user must be signed into Chrome, and this only works for users within the domain 
 * 
 * @return {string} The user email address or "" if out of domain
 */
function getEmail() {
  return Session.getActiveUser().getEmail();
}

/**
 * Gets the schedule of intervention teachers
 * 
 * @return {TeacherScheduleData}
 */
function getInterventionTeachers() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("intervention-teachers");

  if (cached) {
    return cached; // returns stringified cache
  }
  
  try {
    const schedules = parseInterventionSpreadsheets();

    const stringifiedData = JSON.stringify(schedules);
    cache.put("intervention-teachers", stringifiedData, 21600);

    return stringifiedData;
  } catch (error) {
    console.error(error);
    // returns null in case of error, most likely a broken link or improperly formatted data
    return null;
  }
}

function parseInterventionSpreadsheets() {
  // gets the schedule data spreadsheet
  const docId = SPREADSHEET.getRangeByName(INTERVENTIONS_DOCID_RANGE_NAME).getValue();
  const spreadsheet = SpreadsheetApp.openById(docId);

  // gets the date when Semester 2 begins
  const s2DateSetting = SPREADSHEET.getRangeByName(S2_RANGE_NAME).getValue();
  const s2Date = new Date(s2DateSetting);
  
  const schedules = {
    s1: parseInterventionSchedule("S1_data", spreadsheet),
    s2: parseInterventionSchedule("S2_data", spreadsheet),
    s2Date: s2Date,
  }
  return schedules;
}

/**
 * Gets the docId for the published Interventions schedule, for linking within the form
 * 
 * @return {string} The doc id
 */
function getInterventionsDocId() {
  return SPREADSHEET.getRangeByName(INTERVENTIONS_DOCID_RANGE_NAME).getValue();
}

function getNoFlyList() {
  const emails = SPREADSHEET.getSheetByName(NO_FLY_LIST_SHEET_NAME).getDataRange().getValues();
  const nonBlanks = emails.filter(row => row[0].length > 0);
  const emailsArray = nonBlanks.map(row => row[0]);
  return emailsArray;
}

/**
 * Returns the URL to the script/webpage
 * 
 * @return {string} The URL of the page 
 */
function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * Gets a single signup record, based on the row id
 * 
 * @param {string} rowId The row uuid of the data to retrieve (not the spreadsheet row index)
 * @return {string} A single record of stringified {SignupData} 
 */
/* Returns a single signup, based on its rowId */
function getSignupByRow(rowId) {
  // only editors may access this function
  if (!mayEdit()) {
    return null;
  }

  // all signup data
  const signupRows = getSignupsRows();
  const matchingSignup = findSignupRow(signupRows, rowId);
  if (!matchingSignup) {
    return null;
  }
  return JSON.stringify(matchingSignup);
}

function findSignupRow(signupRows, rowId) {
  // filters for data matching the row id
  const matched = signupRows.filter(su => su[SIGNUPS_COL.ROW_ID] === rowId);

  if (matched.length === 1) {
    // converts row to an object and returns a stringified version
    const signup = arrayToSignupObject(matched[0]);
    return signup;
  }
  return null;
}

/**
 * Returns current signups (mostly to calculate is a period is full and if glass rooms are reserved)
 * 
 * @return {string} A stringified array of {SignupData} 
 */
function getSignups() {
  // filters for records within two weeks in the past or future
  const today = new Date();
  const twoWeeksAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate()-14);
  const twoWeeksForward = new Date(today.getFullYear(), today.getMonth(), today.getDate()+14);
  
  const values = getSignupsRows();
  const signups = filterSignupsByDate(values, twoWeeksAgo, twoWeeksForward)
  
  return JSON.stringify(signups);
}

function getSignupsRows() {
  const sheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  values.shift();
  return values;
}

function filterSignupsByDate(originalSignups, firstDate, lastDate) {
  const signups = [];
  originalSignups.forEach(row => {
    const date = row[SIGNUPS_COL.DATE];
    if ((date.getTime() >= firstDate.getTime()) && (date.getTime() <= lastDate.getTime())) {
      signups.push(arrayToSignupObject(row));
    }
  });
  return signups;
}

/**
 * Returns an object of special limitations for a particular date, or null if none
 * 
 * @return {?SpecialScheduleData} 
 */
function getSpecialScheduleFor(date, specialSchedules) {
  // searches for a special schedule that matches the given data
  const match = specialSchedules.filter(sp => (isSameDate(date, new Date(sp[SPECIAL_SCHED_COL.DATE]))));

  if (match.length === 0) {
    return null;
  }

  const specialData = {};

  // creates special schedule data for each relevant period
  match.forEach(row => {
    const period = row[SPECIAL_SCHED_COL.PERIOD];
    specialData[period] = createSpecialScheduleObj(row);
  });

  return specialData;
}

function createSpecialScheduleObj(rowData) {
  const specialData = {
    allowInterventions: rowData[SPECIAL_SCHED_COL.ALLOW_INTERVENTIONS] || "",
    allowAssessmentMakeups: rowData[SPECIAL_SCHED_COL.ALLOW_ASSESSMENT] || "",
    allowAltSetting: rowData[SPECIAL_SCHED_COL.ALLOW_ALT_SETTING] || "",
    allowTutoring: rowData[SPECIAL_SCHED_COL.ALLOW_TUTORING] || "",
    allowNonInterventions: rowData[SPECIAL_SCHED_COL.ALLOW_NON_INTERVENTION] || "",
  }
  
  // adds the max (checking to convert to a number if needed)
  let max = rowData[SPECIAL_SCHED_COL.MAX];
  if (Number.isNaN(max)) {
    max = parseInt(max);
  }
  specialData.max = max;

  return specialData;
}

/**
 * Returns all students at the school, as found in the spreadsheet.
 * Note: a script in the spreadsheet imports these names into the ss nightly 
 * 
 * @return {StudentData[]}
 */
function getStudentAudit(submittedEmail) {
  console.log(submittedEmail);
  // gets all signups for a particular student
  const sheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
  const currentValues = sheet.getDataRange().getValues();

  const archiveSheet = SPREADSHEET.getSheetByName(ARCHIVE_SHEET_NAME);
  const archivedValues = archiveSheet.getDataRange().getValues();
  const archivedHeaders = archivedValues.shift();

  const values = currentValues.concat(archivedValues);
  
  const filtered = values.filter(row => row[9] == submittedEmail);

  // creates an array to return
  const students = [];
  filtered.forEach(row => {
    students.push(arrayToSignupObject(row));
  });

  return JSON.stringify(students);
}

/**
 * Returns all students at the school, as found in the spreadsheet.
 * Note: a script in the spreadsheet imports these names into the ss nightly 
 * 
 * @return {StudentData[]}
 */
function getStudentNames() {
  // gets all student data from the spreadsheet
  const sheet = SPREADSHEET.getSheetByName(STUDENTS_SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  
  // creates an array to return
  const students = [];
  values.forEach(row => {
    students.push({email: row[0], lastname: row[1], firstname: row[2]});
  })
  return students;
}

/**
 * Gets schedule data of study hall teachers
 * 
 * @return {TeacherScheduleData} 
 * 
 */
function getStudyTeachers() {
  try {
    // gets the spreadsheet holding the data
    const docId = SPREADSHEET.getRangeByName(STUDY_TEACHERS_DOCID_RANGE_NAME).getValue();
    const spreadsheet = SpreadsheetApp.openById(docId);

    // gets the date of the beginning of Semester 2
    const s2DateSetting = SPREADSHEET.getRangeByName(S2_RANGE_NAME).getValue();
    const s2Date = new Date(s2DateSetting); 

    const schedules = {
      s1: parseStudySchedules("S1Study", spreadsheet),
      s2: parseStudySchedules("S2Study", spreadsheet),
      s2Date: s2Date,
    }
    return JSON.stringify(schedules);
  } catch (error) {
    // returns null in case of error, most likely a broken link or improperly formatted data
    console.log(error);
    return null;
  }
}


/**
 * Gets the docId for the published Tutoring schedule, for linking within the form
 * 
 * @return {string} The doc id of the tutoring schedule
 */ 
function getTutoringDocId() {
  return SPREADSHEET.getRangeByName(TUTORING_DOCID_RANGE_NAME).getValue();
}

/**
 * Gets the boolean for whether NHS tutoring should be shown
 * 
 * @return {boolean} True is tutoring is shown/active
 */ 
function getTutoringStatus() {
  return SPREADSHEET.getRangeByName(TUTORING_TOGGLE_RANGE_NAME).getValue();
}

/**
 * Gets a URL parameter value (e.g. "page" from "https://....?page=attendance")
 * 
 * return {string} The value from the URL
 */
function getUrlParameter(e, parameterName) {
  const parameters = e.parameters;
  if (parameters.hasOwnProperty(parameterName)) {
    return parameters[parameterName][0];
  }
  return "";
}

/**
 * Gets the value of Wednesday Interventions (on/off)
 * 
 * return {boolean} 
 */
function wednesdayInterventionsActive() {
    const wedInt = (SPREADSHEET.getRangeByName(WED_INTERVENTIONS_RANGE_NAME).getValue() === "On");
    const editors = getDataEditors();
    const email = getEmail();
    const userIsEditor = editors.includes(email);

    return wedInt || userIsEditor;
}


/** 
 * Determines if two Date object are the same date, regardless of time-of-day
 * 
 * @param {Date} date1 The first date to compare
 * @param {Date} date2 The second date to compare
 * @return {boolean} True if the two dates are the same
 */
function isSameDate(date1, date2) {
  const monthMatch = date1.getMonth() === date2.getMonth();
  const yearMatch = date1.getFullYear() === date2.getFullYear();
  const dateMatch = date1.getDate() === date2.getDate();

  return monthMatch && yearMatch && dateMatch;
}

/**
 * Returns whether the current user may edit signup records
 * 
 * @return {boolean} True if allowed
 */
function mayEdit() {
  const userEmail = getEmail();
  const editors = getDataEditors();

  let allowed = false;
  editors.forEach(editor => {
   if (userEmail == editor) {
      // allowed if the user is one of the editors
      allowed = true;
   }
  });
  return allowed;
}

/**
 * Returns whether this user has permission to submit the form
 * 
 * @return {boolean} True if allowed
 */
function maySubmit() {
  const userEmail = getEmail();
  let allowed = false;

  ALLOWED_SUBMITTERS.forEach(domain => {
    if (userEmail.indexOf(domain) > 0) {
      // allowed if the allowed domains are part of the user's email address
      allowed = true;
    }
  });
  return allowed;
}  

/**
 * Returns whether this user may view and set the admin page
 * 
 * @return {boolean} True if allowed
 */
function mayViewAdmin() {
  const userEmail = getEmail().toLowerCase();
  let allowed = false;

  let admins = SPREADSHEET.getRangeByName(ADMIN_ACCESS_RANGE_NAME).getValues().map(row => row[0].toLowerCase().trim());
  admins = admins.filter(item => item.length > 0);

  admins.forEach(admin => {
    if (userEmail === admin) {
      // allowed if the allowed domains are part of the user's email address
      allowed = true;
    }
  });
  return allowed;
}

/**
 * Returns whether this user may view and set attendance
 * 
 * @return {boolean} True if allowed
 */
function mayViewAttendance() {
  const userEmail = getEmail();
  let allowed = false;

  ALLOWED_ATTENDANCE.forEach(domain => {
    if (userEmail.indexOf(domain) > 0) {
      // allowed if the allowed domains are part of the user's email address
      allowed = true;
    }
  });
  return allowed;
}

/**
 * Converts a javascript signup object to a spreadsheet row array
 * 
 * @param {SignupData} obj The object to convert
 * @return {string} The array, in row order for signup data
 */
function objectToSignupRow(obj) {
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

/** Converts the Intervention schedule spreadsheet data into JSON object 
 * 
 * @param {string} sheetName The name of the sheet containing the data
 * @param {Spreadsheet} spreadsheet The spreadsheet containing the data
 * @return {SemesterData} The object of teacher array for each Day/Period
*/
function parseInterventionSchedule(sheetName, spreadsheet) {
  // determine whether to use S1 or S2 based on today's date
  // gets the schedule data
  const values = spreadsheet.getRangeByName(sheetName).getValues();
  values.shift();  // removes the headers

  // figures out if there are any merged rows. These will be skipped later
  const mergedRanges = spreadsheet.getRangeByName(sheetName).getMergedRanges();
  const mergedRows = mergedRanges.map(r => r.getRowIndex());

  // creates an object of data to return
  const schedule = {
    "Day 1": [],
    "Day 2": [],
    "Day 3": [],
    "Day 4": [],
    "Day 5": [],
    "Day 6": [],
    "Day 7": [],
    "Day 8": [],
  }

  // creates a placeholder so we know which periods we are currently working with.
  // That is, rows contain either the period numbers [1, 3, 4, 5, 6, 7, 8] or names ["Smith", "Jones", etc.]
  // if it's a row, remember it so we know what period the next rows of names belong to
  let periodRow = [];
  
  // cycles through the schedule rows
  values.forEach((row, index) => {
    // if this is a merged row, skip it
    if (mergedRows.includes(index + 2)) {  // adds because 1-based AND because we dropped the header row
      return;
    }
    
    // checks to see if the first character in the row is a number.
    // If so, assume this is a period row and remember it. Then skip to the next row.
    let firstChar = row[0];
    if (typeof firstChar === 'string') {
      firstChar = parseInt(row[0][0]);
    }
    if (Number.isSafeInteger(firstChar)) {
      periodRow = row;
      return;
    }

    // Since this isn't a period row, it must be names. Adds each name to the correct Day/Period
    // Loops through each column (Day 1, Day 2, etc.)
    for (var i=0; i<8; i++) {
      const day = "Day " + (i + 1); // adds 1 because days are 1-based
      
      // gets the period associated with this column, based on the periodRow
      // e.g. maybe column 3 is Period 6
      let firstChar = periodRow[i];
      if (typeof firstChar === 'string') {
        firstChar = parseInt(firstChar[0]);
      }
      if (!Number.isSafeInteger(firstChar)) {
        return;
      }
      const period = firstChar;

      // if this day doesn't yet have an array for this period, initialize it
      if (!Array.isArray(schedule[day][period])) {
        schedule[day][period] = [];
      }
      const name = row[i];
      if (name.length >1) {
        // if not "", save the name
        schedule[day][period].push(name);
      }
    }
  });

  return schedule;
}

/** Converts the Study Hall spreadsheet data into JSON object 
 * 
 * @param {string} rangeName The name of the sheet containing the data
 * @param {Spreadsheet} spreadsheet The spreadsheet containing the data
 * @return {SemesterData} The object of teacher array for each Day/Period
*/
function parseStudySchedules(rangeName, spreadsheet) {
  // gets the sheet data
  const values = spreadsheet.getRangeByName(rangeName).getValues();
  values.shift(); // removes the headers
      
      // creates a return object
  const schedule = {
    "Day 1": [],
    "Day 2": [],
    "Day 3": [],
    "Day 4": [],
    "Day 5": [],
    "Day 6": [],
    "Day 7": [],
    "Day 8": [],
  }

  // creates a placeholder so we know which periods we are currently working with.
  // That is, rows contain either the period numbers [1, 3, 4, 5, 6, 7, 8] or names ["Smith", "Jones", etc.]
  // if it's a row, remember it so we know what period the next rows of names belong to
  let periodRow = [];
  
  // cycles through the schedule rows
  values.forEach(row => {
    // checks to see if the first character in the row is a number.
    // If so, assume this is a period row and remember it. Then skip to the next row.
    let firstChar = row[0];
    if (typeof firstChar === 'string') {
      firstChar = parseInt(row[0][0]);
    }
    if (Number.isSafeInteger(firstChar)) {
      periodRow = row;
      return;
    }

    // Since this isn't a period row, it must be names. Adds each name to the correct Day/Period
    // Loops through each column (Day 1, Day 2, etc.)
    for (var i=0; i<8; i++) {
      const day = "Day " + (i + 1);
      
      // gets the period associated with this column, based on the periodRow
      // e.g. maybe column 3 is Period 6
      let firstChar = periodRow[i];

      if (typeof firstChar === 'string') {
        firstChar = parseInt(firstChar[0]);
      }
      if (!Number.isSafeInteger(firstChar)) {
        return;
      }
      const period = firstChar;

      // if this day doesn't yet have an array for this period, initialize it
      if (!Array.isArray(schedule[day][period])) {
        schedule[day][period] = [];
      }
      const name = row[i];
      if (name.length >1) {
        // if not "", save the name
        schedule[day][period].push(name);
      }
    }
  });

  return schedule;
}

/**
 * Stores a time value for a checkin into the spreadsheet
 * 
 * @param {string} checkinType One of four types of checkin
 * @param {string} id The row's uuid
 * @param {string} value The timecode value to save (expected: HH:MM AM/PM)
 * @return {checkinType: string, id: string, value: string} The same data as was submitted
 */
function setCheckin(checkinType, id, value) {
  //gets all signup data
  const sheet = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME);
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

/**
 * Saves form data into the spreadsheet
 * 
 * @param {SignupData} obj The user-submitted form data
 * @return {boolean} True if successful submission
 */
function submitForm(submittedObj) {
  let obj = submittedObj; 

  // if the student names are missing, look them up based on the Google Admin directory
  if ((obj.firstname === "") || (obj.lastname === "")) {
    obj = addStudentName(obj);
  } 
  
  // if row is blank, make a new signup entry. Otherwise, update the existing record.
  const rowIdExists = obj.hasOwnProperty("rowId") && (typeof obj.rowId === "string") && (obj.rowId.length > 0);

  if (rowIdExists) {
    return updateReservation(obj)
  } else {
    return addNewReservation(obj);
  }
}

function addStudentName(obj) {
  const user = AdminDirectory.Users.get(obj.emailStudent);
  obj.firstname = user.name.givenName;
  obj.lastname = user.name.familyName;

  return obj;
}

/** 
 * Updates an existing signup row in the spreadsheet
 * 
 * @param {SignupData} newRes The user submitted form data
 * @return {boolean} True if successful
 */
function updateReservation(submittedData) {
  // throw error if the user is not allowed to edit existing data
  if (!mayEdit()) {
    throw new Error("Insufficient access. You do not have permission to edit signup data.");
  }

  // get all signup data
  var data = SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME).getDataRange().getValues();

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
  const newRow = objectToSignupRow(submittedData);
  
  // copy old checkin and timestamp data to the new row (so it doesn't get overwritten)
  newRow[SIGNUPS_COL.STUDY_IN_1] = row[SIGNUPS_COL.STUDY_IN_1];
  newRow[SIGNUPS_COL.MEDIA_IN] = row[SIGNUPS_COL.MEDIA_IN];
  newRow[SIGNUPS_COL.MEDIA_OUT] = row[SIGNUPS_COL.MEDIA_OUT];
  newRow[SIGNUPS_COL.STUDY_IN_2] = row[SIGNUPS_COL.STUDY_IN_2];
  newRow[SIGNUPS_COL.TIMESTAMP] = row[SIGNUPS_COL.TIMESTAMP];

  // save the data in the spreadsheet
  SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME)
    .getRange(rowNum, 1, 1, newRow.length).setValues([newRow]);
}

/**
 * Adds a new signup to the spreadsheet 
 * 
 * @param {SignupData} obj Submitted data
 * @return {SignupData} The same data
 */
function addNewReservation(obj) {
  saveNewReservationToSpreadsheet(obj)
  sendConfirmationMessage(obj);

  return obj;
}

function saveNewReservationToSpreadsheet(obj) {
  obj.rowId = Utilities.getUuid();
  obj.timestamp = new Date();

  // converts the object into an array in the correct order
  const newRow = objectToSignupRow(obj);

  SPREADSHEET.getSheetByName(SIGNUPS_SHEET_NAME).appendRow(newRow); 
}

/**
 * Sends an email confirmation to the user after a form submission
 * 
 * @param {SignupData} obj The user submitted form data
 */
function sendConfirmationMessage(obj) {
  try {
    var message = createEmailMessage(obj);
    var options = buildEmailOptions(obj.teacherEmail);
    GmailApp.sendEmail(obj.emailStudent, "WHS Media Center Reservation", message, options);
  } catch (error) {
    throw new Error("Submission complete, but there was an error sending the confirmation email.");
  }
}

// builds the email body
function createEmailMessage(obj) {
    var date = new Date(obj.date);
    var dateFormatted = WEEKDAYS[date.getDay()] +", " + MONTHS[date.getMonth()] + " " + date.getDate() +", " + date.getFullYear();
    var room = obj.room.length > 0 ? "Glass Room "+ obj.room : "";
    var emailContactVal = SPREADSHEET.getRangeByName("Email_contacts").getValue();
    var emailContacts = emailContactVal.split(",");
    
    let message = "Thank you for signing up for time in the WHS Media Center. Here is your reservation confirmation.\n";
    message += "\n";
    message += "Date requested: " + dateFormatted +"\n";
    message += "Period requested: " + obj.period +"\n";

    if (room !== "") {
      message += "Room reserved: " + obj.room +"\n";
    }

    message += "\nReason for visit: " + obj.type +"\n";
    
    if (obj.purpose !== "") {
      message += "Purpose: " + obj.purpose +"\n";
    }
    
    if (obj.subject !== "") {
      message += "Subject: " + obj.subject +"\n";
    }
    
    message += "Study hall teacher: " + obj.teacherStudy +"\n";
    
    if (obj.teacherAcad !== "") {
      message += "Teacher you are doing work for: " + obj.teacherAcad +"\n";
    }

    if (obj.comments !== "") {
      message += "Message: " + obj.comments +"\n";
    }

    message += "\n";
    message += "If you need to modify or cancel this booking, please contact " + emailContacts.join(" or ") + ".";

    return message;
}

function buildEmailOptions(teacherEmail) {
  const options = {noReply: true};

  // if a teacher submitted the form, adds the teacher as a cc to the email
  if ((typeof teacherEmail === "string") && (teacherEmail.length > 0)) {
    options.cc = teacherEmail;
  }

  return options;
}

/**
 * Converts a signup spreadsheet row into a javascript object 
 * 
 * @param {array} row The spreadsheet row
 * @return {SignupData} The data in object form
 */
function arrayToSignupObject(row) {
  return {
    timestamp: row[SIGNUPS_COL.TIMESTAMP],
    email: row[SIGNUPS_COL.SUBMITTED_BY],
    emailStudent: row[SIGNUPS_COL.STUDENT_EMAIL],
    lastname: row[SIGNUPS_COL.LASTNAME],
    firstname: row[SIGNUPS_COL.FIRSTNAME],
    date: row[SIGNUPS_COL.DATE],
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
  }
} 

const LOGO_ID = "17G7OFQmeOX8h8CKG9497rA5RNPRNl7uc"; // Google Doc Id of the logo image to display in the header
const CALENDAR_ID = "walpole.k12.ma.us_u7gud64fa4b010odr5cqkvd70k@group.calendar.google.com"; // id of calendar that holds the daily schedules
const ALLOWED_SUBMITTERS = ["@wpsma.org", "@walpole.k12.ma.us"]; // domains that can access the submission form
const ALLOWED_ATTENDANCE = ["@walpole.k12.ma.us"]; // domains that can access the attendance form

// Spreadsheet constants
const SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID); // Active spreadsheet object, used in most functions

const SETTINGS_SHEET_NAME = "App Settings";
const SIGNUPS_SHEET_NAME = "Signups"; // name of the sheet that holds the signup data
const DAILY_SCHEDULES_SHEET_NAME = "Recent Schedules"; // name of the sheet that holds the daily schedules (e.g. 3/1/2024 = "Day 2")
const STUDENTS_SHEET_NAME = "Student Names"; // name of the sheet that holds all WHS students names and email addresses
const SPECIAL_SCHEDULES_SHEET_NAME = "Special Schedules"; // name of the sheet that holds special limitations for signups
const ARCHIVE_SHEET_NAME = "Signups Archive"; // name of the sheet that holds signups from the past
const NO_FLY_LIST_SHEET_NAME = "No Fly List"; // email addresses of students not allowed to sign up

const S2_RANGE_NAME = "S2_Start_Date"; // name of the range that holds the first date of Semester 2
const INTERVENTIONS_DOCID_RANGE_NAME = "Interventions_DocId"; // name of the range that holds the DocId of the Interventions Schedule
const STUDY_TEACHERS_DOCID_RANGE_NAME = "Study_teachers_DocId"; // name of the range that holds the DocId of the Study Hall Teacher Schedule
const TUTORING_DOCID_RANGE_NAME = "Tutoring_DocId"; // name of the range that holds the DocId of the Tutoring Schedule
const WED_INTERVENTIONS_RANGE_NAME = "Wed_Intv"; // name of the range that holds the on/off switch for Wednesday Interventions
const TUTORING_TOGGLE_RANGE_NAME = "Tutoring_toggle"; // name of the range that holds the on/off switch for Wednesday Interventions
const DEFAULT_MAX_SIGNUPS_RANGE_NAME = "Default_Max_Signups" // name of the range that holds the value
const ADMIN_ACCESS_RANGE_NAME = "Admin_Access" // name of the range that holds the value

const EMAIL_CONTACTS_RANGE_NAME = "Email_contacts"; // name of the range that holds the email address for who to contact for corrections
const DATA_EDITORS_RANGE_NAME = "Data_editors"; // name of the range that holds the email addresses of who can edit signup data

// The column index (0-based) for signup data in the spreadsheet
const SIGNUPS_COL = {
  TIMESTAMP: 7,
  SUBMITTED_BY: 8,
  LASTNAME: 0,
  FIRSTNAME: 1,
  STUDENT_EMAIL: 9,
  DATE: 3,
  PERIOD: 4,
  TYPE: 5,
  TEACHER_STUDY: 2,
  SUBJECT: 10,
  PURPOSE: 11,
  TEACHER_ACAD: 12,
  GLASS_ROOM: 6,
  COMMENTS: 13, 
  ROW_ID: 18,
  STUDY_IN_1: 14,
  MEDIA_IN: 15,
  MEDIA_OUT: 16,
  STUDY_IN_2: 17,
};

// The column index (0-based) for daily schedule data in the spreadsheet
const DAILY_SCHED_COL = {
  DATE: 0,
  DAY: 1
};

// The column index (0-based) for special schedule data in the spreadsheet
const SPECIAL_SCHED_COL = {
  DATE: 0,
  PERIOD: 1,
  ALLOW_INTERVENTIONS: 2,
  ALLOW_ASSESSMENT: 3,
  ALLOW_ALT_SETTING: 4,
  ALLOW_TUTORING: 5,
  ALLOW_NON_INTERVENTION: 6,
  MAX: 7,
}

// The names of Days in the rotating schedule (also, the title of calendar events)
const SCHEDULE_DAYS = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8"];

// which periods go with which days in the rotating schedule
const PERIODS = {
  "Day 1": [1, 2, 3, 4, 5, 6],
  "Day 2": [7, 8, 1, 2, 3, 4],
  "Day 3": [5, 6, 7, 8, 1, 2],
  "Day 4": [3, 4, 5, 6, 7, 8],
  "Day 5": [2, 1, 4, 3, 6, 5],
  "Day 6": [8, 7, 2, 1, 4, 3],
  "Day 7": [6, 5, 8, 7, 2, 1],
  "Day 8": [4, 3, 6, 5, 8, 7],
};

// Names of weekdays
const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

// Names of months
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

/**
* @typedef {Object} SignupData
* @property {Date} timestamp - The date the record was created
* @property {string} email - The email address of the user that submitted the form
* @property {string} firstname - The student's first/given name.
* @property {string} lastname - The student's last/family name.
* @property {Date} date - The requested date
* @property {number} period - The requested period
* @property {string} type - The type of signup e.g. Interventions, Assessment Makeup
* @property {string} purpose - The purpose of a non-interventions visit
* @property {string} subject - The subject to be studied
* @property {string} teacherStudy - The name of the study hall teacher
* @property {string} teacherAcad - The name of the teacher "you are doing work for"
* @property {number|""} room - Ehich room is reserved
* @property {string} comments - The topic to be worked on or other comments
* @property {string} rowId - A unique id for this row of data
* @property {Date} studyIn1 - The time of day of the first checkin to study hall
* @property {Date} studyIn2 - The time of day of the second checkin to study hall
* @property {Date} mediaIn - The time of day of checkin to the media center
* @property {Date} mediaOut - The time of day of checkout from the media center
*/

/**
 * @typedef {Object} DailyScheduleData
 * @property {string} date - The date of the schedule, formatted mm/dd/yyyy
 * @property {string} day - The "day" of the schedule, e.g. "Day 3"
 * @property {number[]} periods - Array of period numbers for this day (in order)
 * @property {DpecialScheduleData} specials - special limitations for signing up on this day
 */

/**
 * @typedef {Object} SpecialScheduleData
 * @property {string} allowInterventions - Any value other than "" means not allowed
 * @property {string} allowAssessmentMakeups - Any value other than "" means not allowed
 * @property {string} allowAltSetting - Any value other than "" means not allowed
 * @property {string} allowTutoring - Any value other than "" means not allowed
 * @property {string} allowNonInterventions - Any value other than "" means not allowed
 * @property {number} max - The maximum signups allowed
 */

/**
 * @typedef {Object} TeacherScheduleData
 * @property {Date} s2Date - The first date of Semester 2, formatted mm/dd/yyyy
 * @property {SemesterData} s1_data - The schedule data for Semester 1
 * @property {SemesterData} s2_data - The schedule data for Semester 2
 */

/**
 * @typedef {Object} SemesterData
 * @property {Object<number, string[]} "Day 1" - object matching an array of teacher names to periods in Day 1 
 * @property {Object<number, string[]} "Day 2" - object matching an array of teacher names to periods in Day 2 
 * @property {Object<number, string[]} "Day 3" - object matching an array of teacher names to periods in Day 3 
 * @property {Object<number, string[]} "Day 4" - object matching an array of teacher names to periods in Day 4 
 * @property {Object<number, string[]} "Day 5" - object matching an array of teacher names to periods in Day 5 
 * @property {Object<number, string[]} "Day 6" - object matching an array of teacher names to periods in Day 6 
 * @property {Object<number, string[]} "Day 7" - object matching an array of teacher names to periods in Day 7 
 * @property {Object<number, string[]} "Day 8" - object matching an array of teacher names to periods in Day 8 
 */

/**
 * @typedef {Object} StudentData
 * @property {string} email - The email address of the student
 * @property {string} firstname - The student's first/given name.
 * @property {string} lastname - The student's last/family name.
 */