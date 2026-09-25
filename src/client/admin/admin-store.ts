import { AdminDataRow } from "../admin/admin-data-row";
import { CheckinStore } from "../common/checkin-box";
import { Store } from "../common/store";

const initialState: AdminState = {
  students: [],
  studentNames: [],
  dailySchedules: [],
  signups: [],
  settings: [],

  isEditor: false,
  currentEmail: "",
  
  ui_currentSortField: "date",
  ui_currentSortOrder: "desc",
  ui_currentStudentName: "",
  ui_requestedStudentEmail: "",

  ui_dataRows: [],
};

export const store = new Store<AdminState>(initialState);

export const checkinStore: CheckinStore = {
  getSignups: () => store.getState().signups,
  setSignups: signups => store.setState({ signups }),
};

export interface AdminState {
  students: Student[],
  studentNames: string[],
  dailySchedules: DailyBlock[],
  signups: Signup[],
  settings: Setting[],

  isEditor: boolean,
  
  ui_currentSortField: "date" | "period",
  ui_currentSortOrder: "asc" | "desc",

  ui_dataRows: AdminDataRow[],
  currentEmail: string,
  ui_currentStudentName: string,
  ui_requestedStudentEmail: string,
};

export type AdminStateRaw = Omit<AdminState, 'signups' | 'dailySchedules'> & {
  dailySchedules: string,
  signups: string,
}
