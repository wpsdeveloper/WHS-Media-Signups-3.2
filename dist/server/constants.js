"use strict";
/**
 * @file constants.ts
 * @description Defines global configuration constants, calendar IDs, sheet names, range references, column indices, and default values.
 * @url https://github.com/wpsdeveloper/WHS-Media-Signups-3.2
 */
// Calendar
const CALENDAR_ID = "walpole.k12.ma.us_u7gud64fa4b010odr5cqkvd70k@group.calendar.google.com"; // ID of calendar holding daily schedules
// Permissions
const ALLOWED_SUBMITTERS = ["@wpsma.org", "@walpole.k12.ma.us"]; // Domains that can access the submission form
const ALLOWED_ATTENDANCE = ["@walpole.k12.ma.us"]; // Domains that can access the attendance form
// Spreadsheet constants
const SPREADSHEET_ID = '1LbVD6PYDns60osOfsRtUea3xyHr5BPyfAkhum0-eC5k'; // Google Sheet holding signup data
const SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID); // Active spreadsheet object
// Sheet names
const SETTINGS_SHEET_NAME = "App Settings";
const SIGNUPS_SHEET_NAME = "Signups"; // Name of sheet holding signup data
const DAILY_SCHEDULES_SHEET_NAME = "Recent Schedules"; // Name of sheet holding daily schedules
const STUDENTS_SHEET_NAME = "Student Names"; // Name of sheet holding WHS student names and email addresses
const SPECIAL_SCHEDULES_SHEET_NAME = "Special Schedules"; // Name of sheet holding special limitations for signups
const ARCHIVE_SHEET_NAME = "Signups Archive"; // Name of sheet holding past signups
const NO_FLY_LIST_SHEET_NAME = "No Fly List"; // Email addresses of students not allowed to sign up
// Range names
const S2_RANGE_NAME = "S2_Start_Date"; // Name of range holding first date of Semester 2
const INTERVENTIONS_DOCID_RANGE_NAME = "Interventions_DocId"; // DocId of Interventions Schedule
const STUDY_TEACHERS_DOCID_RANGE_NAME = "Study_teachers_DocId"; // DocId of Study Hall Teacher Schedule
const TUTORING_DOCID_RANGE_NAME = "Tutoring_DocId"; // DocId of Tutoring Schedule
const WED_INTERVENTIONS_RANGE_NAME = "Wed_Intv"; // On/off switch for Wednesday Interventions
const TUTORING_TOGGLE_RANGE_NAME = "Tutoring_toggle"; // On/off switch for Tutoring
const DEFAULT_MAX_SIGNUPS_RANGE_NAME = "Default_Max_Signups"; // Default max signups per block
const ADMIN_ACCESS_RANGE_NAME = "Admin_Access"; // Authorized admin emails
const EMAIL_CONTACTS_RANGE_NAME = "Email_contacts"; // Contact email for corrections
const DATA_EDITORS_RANGE_NAME = "Data_editors"; // Email addresses of data editors
// Errors
const STANDARD_SERVER_ERROR = new Error("Error communicating with database");
const DEFAULT_MAX_SIGNUPS = 10;
/** Column index (0-based) for signup data in the spreadsheet */
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
/** Column index (0-based) for daily schedule data in the spreadsheet */
const DAILY_SCHED_COL = {
    DATE: 0,
    DAY: 1
};
/** Column index (0-based) for special schedule data in the spreadsheet */
const SPECIAL_SCHED_COL = {
    DATE: 0,
    PERIOD: 1,
    ALLOW_INTERVENTIONS: 2,
    ALLOW_ASSESSMENT: 3,
    ALLOW_ALT_SETTING: 4,
    ALLOW_TUTORING: 5,
    ALLOW_NON_INTERVENTION: 6,
    MAX: 7,
};
/** Names of Days in the rotating schedule */
const SCHEDULE_DAYS = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8"];
const MASTER_ROTATION_GRID = [
    { day: 'Day 1', periods: ['1', '2', '3', '4', '5', '6'] },
    { day: 'Day 2', periods: ['7', '8', '1', '2', '3', '4'] },
    { day: 'Day 3', periods: ['5', '6', '7', '8', '1', '2'] },
    { day: 'Day 4', periods: ['3', '4', '5', '6', '7', '8'] },
    { day: 'Day 5', periods: ['2', '1', '4', '3', '6', '5'] },
    { day: 'Day 6', periods: ['8', '7', '2', '1', '4', '3'] },
    { day: 'Day 7', periods: ['6', '5', '8', '7', '2', '1'] },
    { day: 'Day 8', periods: ['4', '3', '6', '5', '8', '7'] },
];
const EMPTY_SPECIAL = {
    allowInterventions: true,
    allowAssessmentMakeups: true,
    allowAltSetting: true,
    allowTutoring: true,
    allowNonInterventions: true,
    max: DEFAULT_MAX_SIGNUPS,
};
/** Names of weekdays */
const WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
];
/** Names of months */
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
];
