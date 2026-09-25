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
  defaultMax: number,
  
  updateRowId: string | null,
  updateData: Signup | null,

  ui_currentDate: Date | null,
  ui_currentPeriod: Period | null,
  ui_currentType: SignupType | null,
  ui_currentStudyTeacher: string | null
  ui_currentInterventionTeacher: string | null
  ui_currentSubject: string,
  ui_currentStudentName: string,
  ui_currentMax: number,
  ui_currentEmail: string,
  ui_currentScheduleBlock: DailyBlock | null;

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
