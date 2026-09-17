import { DailySchedule } from "../../shared/types/dailySchedule";
import { Setting } from "../../shared/types/settings";
import { Signup, SignupType } from "../../shared/types/signups";
import { Student } from "../../shared/types/students";
import { InterventionTeachers } from "../../shared/types/teachers";
import { StudyTeachers } from "../../shared/types/teachers";
import { AttendanceDataRow } from "../attendance/attendance-data-row";
import { AdminDataRow } from "../admin/admin-data-row";

// export type StoreState = SignupState | AttendanceState | AdminState | null;

export interface StoreListener<TState, TSelected> {
  selector: (state: TState) => TSelected;
  callback: (selectedState: TSelected) => void;
  lastState: TSelected;
}

// Store.js
export class Store<TState> {
  state!: TState;
  listeners = new Set<StoreListener<TState, any>>();

 initialize(initialState: TState) {
    this.state = { ...initialState } as TState;
  }

  getState(): TState {
    return { ...this.state } as TState;
  }

  setState(newState: Partial<TState>): void {
    if (!newState) return;
    this.state = { ...this.state, ...newState };
    
    // Evaluate selectors to see if subscribed data actually changed
    this.listeners.forEach((listener) => {
      const newSelectedState = listener.selector(this.state);
      // Simple reference check (or shallow compare) instead of your complex deepEqual loop
      if (newSelectedState !== listener.lastState) {
        listener.lastState = newSelectedState;
        listener.callback(newSelectedState);
      }
    });
  }

// store.ts

  subscribe<TSelected>(
    selector: (state: TState) => TSelected,
    callback: (selectedState: TSelected) => void
  ): () => void {
    const listener: StoreListener<TState, TSelected> = {
      selector,
      callback,
      lastState: selector(this.state),
    };
    
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const store = new Store();


export interface SharedStudentState { 
  students: Student[],
  studentNames: string[], 
  currentStudentName: string ,
};

export interface SignupState extends SharedStudentState {
  stateType: 'signup',

  setting: Setting[];
  students: Student[],
  studentNames: string[],
  dailySchedules: DailySchedule[],
  interventionTeachers: InterventionTeachers,
  studyTeachers: StudyTeachers,
  signups: Signup[],
  noFlyList: string[],

  isStaff: boolean,
  isEditor: boolean,
  isAdmin: boolean,
  updateRowId: string,
  updateData: string,
  defaultMax: number,

  currentDate: Date,
  currentPeriod: string,
  currentType: SignupType,
  currentStudyTeacher: string,
  currentSubject: string,
  currentStudentName: string,
  currentMax: string,
  currentEmail: string,
};


export interface AttendanceState {
  stateType: 'attendance',

  dailySchedules: DailySchedule[],
  signups: Signup[],
  
  isStaff: boolean,
  isEditor: boolean,
  isAdmin: boolean,
  
  currentSortField: 'study' | 'date',
  currentSortOrder: 'asc' | 'desc', 
  
  dataRows: AttendanceDataRow[],

  currentDate: Date,
  currentPeriod: string,
  };

export interface AdminState extends SharedStudentState {
  stateType: 'admin',

  students: Student[],
  studentNames: string[],
  dailySchedules: DailySchedule[],
  signups: Signup[],
  settings: Setting[],

  isEditor: boolean,
  
  currentSortField: "date" | "period",
  currentSortOrder: "asc" | "desc",

  dataRows: AdminDataRow[],

  currentStudentName: string,
  requestedStudentEmail: string,
};
