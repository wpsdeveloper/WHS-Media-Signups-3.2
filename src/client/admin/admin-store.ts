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
  
  currentSortField: "date",
  currentSortOrder: "desc",

  currentStudentName: "",
  requestedStudentEmail: "",

  dataRows: [],
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
  
  currentSortField: "date" | "period",
  currentSortOrder: "asc" | "desc",

  dataRows: AdminDataRow[],
  currentEmail: string,
  currentStudentName: string,
  requestedStudentEmail: string,
};

export type AdminStateRaw = Omit<AdminState, 'signups' | 'dailySchedules'> & {
  dailySchedules: string,
  signups: string,
}
