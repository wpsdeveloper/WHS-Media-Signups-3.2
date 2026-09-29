import { Store } from "../common/store";
import * as dom from "../common/dom";
import * as glassRoom from '../signup/glass-rooms-input';
import { CheckinBox, CheckinStore } from "../common/checkin-box";

/**
 * The initial default state for the Signup application.
 */
const initialState: SignupState = {
  appConfig: null,
  settings: [],
  students: [],
  studentNames: [],
  dailySchedules: [],
  signups: [],

  isStaff: false,
  isEditor: false,
  isAdmin: false,
  updateRowId: null,
  updateData: null,
  defaultMax: 15,

  ui_currentDate: null,
  ui_currentPeriod: null,
  ui_currentType: null,
  ui_currentStudyTeacher: null,
  ui_currentInterventionTeacher: null,
  ui_currentSubject: "",
  ui_currentStudentName: "",
  ui_currentMax: 10,
  ui_currentEmail: "",
  ui_currentScheduleBlock: null,
  ui_noFlyOverridden: false,
};

/**
 * The central store for managing the Signup application state.
 */
export const store = new Store<SignupState>(initialState);

/**
 * Store adapter specifically for checkin-box components, providing access
 * to get and set signups within the global state.
 */
export const checkinStore: CheckinStore = {
  getSignups: () => store.getState().signups,
  setSignups: signups => store.setState({ signups }),
};

/**
 * Represents the complete state of the Signup application.
 */
export interface SignupState {
  /** The application configuration settings. */
  appConfig: AppConfig | null;
  /** List of general application settings. */
  settings: Setting[],
  /** List of available students. */
  students: Student[],
  /** Pre-computed array of student names for quick lookup. */
  studentNames: string[],
  /** Daily schedule blocks. */
  dailySchedules: DailyBlock[],
  /** Active signups for the current view. */
  signups: Signup[],

  /** Indicates if the current user has staff privileges. */
  isStaff: boolean,
  /** Indicates if the current user has editor privileges. */
  isEditor: boolean,
  /** Indicates if the current user has admin privileges. */
  isAdmin: boolean,
  /** The default maximum capacity for signups. */
  defaultMax: number,
  
  /** The ID of the row currently being updated, if any. */
  updateRowId: string | null,
  /** The data for the row currently being updated, if any. */
  updateData: Signup | null,

  /** UI State: The currently selected date. */
  ui_currentDate: Date | null,
  /** UI State: The currently selected period. */
  ui_currentPeriod: Period | null,
  /** UI State: The currently selected signup type. */
  ui_currentType: SignupType | null,
  /** UI State: The currently selected study teacher. */
  ui_currentStudyTeacher: string | null,
  /** UI State: The currently selected intervention teacher. */
  ui_currentInterventionTeacher: string | null,
  /** UI State: The currently selected subject. */
  ui_currentSubject: string,
  /** UI State: The currently selected student name. */
  ui_currentStudentName: string,
  /** UI State: The current maximum allowed signups. */
  ui_currentMax: number,
  /** UI State: The currently entered email address. */
  ui_currentEmail: string,
  /** UI State: The schedule block corresponding to the current selection. */
  ui_currentScheduleBlock: DailyBlock | null;
  /** UI State: Indicates if no-fly restriction has been overridden by staff. */
  ui_noFlyOverridden: boolean;
}

/**
 * Represents the raw Signup state as received from external sources (e.g. server payloads),
 * where certain properties are still in serialized string format.
 */
export type SignupStateRaw = Omit<SignupState, 'signups' | 'dailySchedules'> & {
  dailySchedules: string,
  signups: string,
}

/**
 * Populates the UI and state with data from an existing signup record
 * when editing/updating an entry.
 *
 * @param {Signup} updateData - The signup data to populate into the update view.
 */
export const registerUpdateData = (updateData: Signup) => {
  if (!updateData) return;

  // Retrieve current signups from store
  const signups = store.getState().signups;
  
  // If the updateData is not already in the signups array, add it
  const alreadyexists = signups.find(su => su.rowId === updateData.rowId);
  if (!alreadyexists) store.setState({
    signups: [...signups, updateData]
  });
  
  // Format the student display string based on available name and email
  const studentDisplay = (updateData.lastname && updateData.firstname)
    ? `${updateData.lastname}, ${updateData.firstname} <${updateData.emailStudent}>`
    : (updateData.emailStudent || "");

  // Update DOM elements with the values from the updateData
  dom.setValue("#student", studentDisplay);
  dom.setValue("#email", updateData.email || "");
  dom.setValue("#comments, #topic-intervention", updateData.comments || "");
  dom.setValue("#acad-teacher", updateData.teacherAcad || "");
  glassRoom.directSet(updateData.room);
  
  // Update the store state to reflect the edited signup's values
  store.setState({
    ui_currentDate: new Date(updateData.date),
    ui_currentPeriod: updateData.period as Period,
    ui_currentType: updateData.type,
    ui_currentStudyTeacher: updateData.teacherStudy,
    ui_currentInterventionTeacher: updateData.teacherAcad,
    ui_currentSubject: updateData.subject,
    ui_currentStudentName: updateData.emailStudent,
    ui_currentScheduleBlock: null,
  });
}
