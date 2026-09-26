import { Store } from "../common/store";
import { CheckinStore } from "../common/checkin-box";

export type AttendanceSortField = "study" | "student";
export type AttendanceSortOrder = "asc" | "desc";
export type AttendancePanelView = "attendance" | "details" | "list";

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

export type AttendanceStateRaw = Omit<AttendanceState, "signups" | "dailySchedules"> & {
  dailySchedules: string;
  signups: string;
};

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

export const store = new Store<AttendanceState>(initialState);

export const resetStore = () => store.setState(initialState);

export const checkinStore: CheckinStore = {
  getSignups: () => store.getState().signups,
  setSignups: (signups) => store.setState({ signups }),
};
