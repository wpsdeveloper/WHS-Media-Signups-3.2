import { Store } from "../common/store";
import * as dom from "../common/dom";
import * as glassRoom from '../signup/glass-rooms-input';
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

export const registerUpdateData = (updateData: Signup) => {
  if (!updateData) return;

  const signups = store.getState().signups;
  const alreadyexists = signups.find(su => su.rowId === updateData.rowId);
  if (!alreadyexists) store.setState({
    signups: [...signups, updateData]
  });
  

  const studentRecord = store.getState().students.find(st => st.email === updateData.emailStudent);
  if (!studentRecord) return;

  
  dom.setValue("#student", `${studentRecord.lastname}, ${studentRecord.firstname} <${studentRecord.email}>` || "");
  dom.setValue("#email", updateData.email || "");
  dom.setValue("#comments, #topic-intervention", updateData.comments || "");
  dom.setValue("#acad-teacher", updateData.teacherAcad || "");
  glassRoom.directSet(updateData.room);
  
  store.setState({
    currentDate: new Date(updateData.date),
    currentPeriod: updateData.period as Period,
    currentType: updateData.type,
    currentStudyTeacher: updateData.teacherStudy,
    currentInterventionTeacher: updateData.teacherAcad,
    currentSubject: updateData.subject,
    currentStudentName: updateData.emailStudent,
    currentScheduleBlock: null,
  });
}
