/**
 * @file admin-store.ts
 * @description Defines state interfaces, initial state, and store instances for the admin audit module.
 */

import { AdminDataRow } from "../admin/admin-data-row";
import { CheckinStore } from "../common/checkin-box";
import { Store } from "../common/store";

/**
 * Interface representing the complete admin application state.
 */
export interface AdminState {
  appConfig: AppConfig | null,

  students: Student[],
  studentNames: string[],
  dailySchedules: DailyBlock[],
  signups: Signup[],
  settings: Setting[],

  isEditor: boolean,
  isAdmin: boolean,
  
  ui_currentSortField: "date" | "period",
  ui_currentSortOrder: "asc" | "desc",

  ui_dataRows: AdminDataRow[],
  currentEmail: string,
  ui_currentStudentName: string,
  ui_requestedStudentEmail: string,
  ui_currentView: "attendance" | "details" | "list",
};

/** Initial default state for admin audit module */
const initialState: AdminState = {
  appConfig: null,

  students: [],
  studentNames: [],
  dailySchedules: [],
  signups: [],
  settings: [],

  isEditor: false,
  isAdmin: false,
  currentEmail: "",
  
  ui_currentSortField: "date",
  ui_currentSortOrder: "desc",
  ui_currentStudentName: "",
  ui_requestedStudentEmail: "",
  ui_currentView: "attendance",

  ui_dataRows: [],
};

/** Admin store instance */
export const store = new Store<AdminState>(initialState);

/** CheckinStore bridge implementation for admin audit signups */
export const checkinStore: CheckinStore = {
  getSignups: () => store.getState().signups,
  setSignups: signups => store.setState({ signups }),
};

/** Raw admin state interface received from server before hydration */
export type AdminStateRaw = Omit<AdminState, 'signups' | 'dailySchedules'> & {
  dailySchedules: string,
  signups: string,
}
