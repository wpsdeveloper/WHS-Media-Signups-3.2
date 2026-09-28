/**
 * Data payload provided to the client for the signup view.
 */
type SignupServerData = {
  /** List of all students */
  students: Student[],
  /** List of active signups */
  signups: Signup[],
  /** Available daily schedules */
  dailySchedules: DailyBlock[],
  /** General application settings */
  appSettings: AppSetting[],
}

/**
 * Data payload provided to the client for the attendance view.
 */
type AttendanceServerData = {
  /** Available daily schedules */
  dailySchedules: DailyBlock[],
  /** List of active signups */
  signups: Signup[],
  /** General application settings */
  appSettings: AppSetting[],
}

/**
 * Data payload provided to the client for the admin view.
 */
type AdminData = {
  /** Available daily schedules */
  dailySchedules: DailyBlock[],
  /** List of all students */
  students: Student[],
  /** General application settings */
  appSettings: AppSetting[],
}

/**
 * Represents a generic row in a spreadsheet.
 */
type SSRow = string[]; 

/**
 * Global configuration settings for the application.
 */
type AppConfig = {
  /** The current active view for the user */
  view: 'signup' | 'attendance' | 'admin',
  /** Whether Wednesday interventions are active */
  wedInt: boolean,
  /** Optional date for the start of semester 2 */
  s2Date?: string,
  /** Whether the user has editor privileges */
  isEditor: boolean,
  /** Whether the user is an admin */
  isAdmin: boolean,
  /** Whether the user is a staff member */
  isStaff: boolean,
  /** Email of the current user */
  email: string,
  /** Base URL for the Google Apps Script web app */
  scriptUrl: string,
  /** Optional update identifier for cache busting/versioning */
  updateId?: string,
}

/**
 * Extends the global Window object with application-specific properties.
 */
interface Window {
  /** Global application configuration injected by the server */
  APP_CONFIG?: AppConfig;
  /** Serialized initial data payload injected by the server */
  INITIAL_DATA?: string | null;
}