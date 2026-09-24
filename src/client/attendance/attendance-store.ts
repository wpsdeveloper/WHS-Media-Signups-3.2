import { AttendanceDataRow } from "../attendance/attendance-data-row";
import { Store } from "../common/store";
import { CheckinStore } from "../common/checkin-box";

const initialState: AttendanceState = {
  dailySchedules: [],
  signups: [],
  
  isStaff: false,
  isEditor: false,
  isAdmin: false,
  
  currentDate: null, 
  currentPeriod: null,
  currentEmail: "", 
  
  currentSortField: 'student', 
  currentSortOrder: 'asc', 
  currentStudy: 'All studies',
  
  dataRows: [],
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
  
  currentSortField: 'study' | 'student',
  currentSortOrder: 'asc' | 'desc', 
  
  dataRows: AttendanceDataRow[],

  currentDate: Date | null,
  currentPeriod: Period | null,
  currentStudy: string,
};