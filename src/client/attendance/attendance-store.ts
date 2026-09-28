/**
 * @file attendance-store.ts
 * @description Defines state interfaces, initial state, and store instances for the attendance module.
 */

import { Store } from "../common/store";
import { CheckinStore } from "../common/checkin-box";

/** Sort fields available for attendance records */
export type AttendanceSortField = "study" | "student";
/** Sort orders */
export type AttendanceSortOrder = "asc" | "desc";
/** Panel views available in attendance */
export type AttendancePanelView = "attendance" | "details" | "list";

/**
 * Interface representing the complete attendance application state.
 */
export interface AttendanceState {
  appConfig: AppConfig | null;
  dailySchedules: DailyBlock[];
  signups: Signup[];

  isStaff: boolean;
  isEditor: boolean;
  isAdmin: boolean;
  currentEmail: string;

  ui_currentSortField: AttendanceSortField;
  ui_currentSortOrder: AttendanceSortOrder;
  ui_currentDate: Date | null;
  ui_currentPeriod: Period | null;
  ui_currentStudy: string;
  ui_currentView: AttendancePanelView;
}

/** Raw attendance state interface received from server before hydration */
export type AttendanceStateRaw = Omit<AttendanceState, "signups" | "dailySchedules"> & {
  dailySchedules: string;
  signups: string;
};

/** Initial default state for attendance module */
export const initialState: AttendanceState = {
  appConfig: null,
  dailySchedules: [],
  signups: [],

  isStaff: false,
  isEditor: false,
  isAdmin: false,

  ui_currentDate: null,
  ui_currentPeriod: null,
  currentEmail: "",

  ui_currentSortField: "student",
  ui_currentSortOrder: "asc",
  ui_currentStudy: "All studies",
  ui_currentView: "attendance",
};

/** Attendance store instance */
export const store = new Store<AttendanceState>(initialState);

/** Resets attendance store to initial state */
export const resetStore = () => store.setState(initialState);

/** CheckinStore bridge implementation for attendance signups */
export const checkinStore: CheckinStore = {
  getSignups: () => store.getState().signups,
  setSignups: (signups) => store.setState({ signups }),
};
