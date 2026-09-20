import { Store } from "../common/store";
import { CheckinBox, CheckinStore } from "../common/checkin-box";

const initialState: SignupState = {
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

  currentDate: null,
  currentPeriod: null,
  currentType: null,
  currentStudyTeacher: null,
  currentInterventionTeacher: null,
  currentSubject: "",
  currentStudentName: "",
  currentMax: 10,
  currentEmail: "",
  currentScheduleBlock: null,
};

export const store = new Store<SignupState>(initialState);

export const checkinStore: CheckinStore = {
  getSignups: () => store.getState().signups,
  setSignups: signups => store.setState({ signups }),
};

export interface SignupState {
  settings: Setting[],
  students: Student[],
  studentNames: string[],
  dailySchedules: DailyBlock[],
  signups: Signup[],

  isStaff: boolean,
  isEditor: boolean,
  isAdmin: boolean,
  updateRowId: string | null,
  updateData: Signup | null,
  defaultMax: number,

  currentDate: Date | null,
  currentPeriod: Period | null,
  currentType: SignupType | null,
  currentStudyTeacher: string | null
  currentInterventionTeacher: string | null
  currentSubject: string,
  currentStudentName: string,
  currentMax: number,
  currentEmail: string,
  currentScheduleBlock: DailyBlock | null;

};

export type SignupStateRaw = Omit<SignupState, 'signups' | 'dailySchedules'> & {
  dailySchedules: string,
  signups: string,
}
