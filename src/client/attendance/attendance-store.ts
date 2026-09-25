import { AttendanceDataRow } from "../attendance/attendance-data-row";
import { Store } from "../common/store";
import { CheckinStore } from "../common/checkin-box";

const initialState: AttendanceState = {
  dailySchedules: [],
  signups: [],
  
  isStaff: false,
  isEditor: false,
  isAdmin: false,
  
  ui_currentDate: null, 
  ui_currentPeriod: null,
  currentEmail: "", 
  
  ui_currentSortField: 'student', 
  ui_currentSortOrder: 'asc', 
  ui_currentStudy: 'All studies',
  
  ui_dataRows: [],
};

export const store = new Store<AttendanceState>(initialState);

export type AttendanceStateRaw = Omit<AttendanceState, 'signups' | 'dailySchedules'> & {
  dailySchedules: string,
  signups: string,
}

export const checkinStore: CheckinStore = {
  getSignups: () => store.getState().signups,
  setSignups: signups => store.setState({ signups }),
};

export interface AttendanceState {
  dailySchedules: DailyBlock[],
  signups: Signup[],
  
  isStaff: boolean,
  isEditor: boolean,
  isAdmin: boolean,
  currentEmail: string,
  
  ui_currentSortField: 'study' | 'student',
  ui_currentSortOrder: 'asc' | 'desc', 
  ui_currentDate: Date | null,
  ui_currentPeriod: Period | null,
  ui_currentStudy: string,
  
  ui_dataRows: AttendanceDataRow[],

};