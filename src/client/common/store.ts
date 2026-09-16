import { DailySchedule } from "../../shared/types/dailySchedule";
import { Setting } from "../../shared/types/settings";
import { Signup, SignupType } from "../../shared/types/signups";
import { Student } from "../../shared/types/students";
import { InterventionTeachers } from "../../shared/types/teachers";
import { StudyTeachers } from "../../shared/types/teachers";
import { AttendanceDataRow } from "../attendance/attendance-data-row";

export type StoreState = SignupState | AttendanceState | AdminState | null;

export interface StoreListener<StoreState> {
  callback: (state: StoreState) => void;
  dependencies: (keyof StoreState)[] | null;
}

// Store.js
export class Store {
  state: StoreState = null;
  listeners: StoreListener<StoreState>[] = [];

  constructor() {}

  initialize(initialState: StoreState = null) {
    this.state = { ...initialState } as StoreState;
  }

  getState(): StoreState {
    return { ...this.state } as StoreState;
  }

  setState(newState: StoreState): void {
    if (!newState) return;
    let hasChanges = false;
    const changedKeys: (keyof StoreState)[] = [];

    const keys = Object.keys(newState) as (keyof StoreState)[];

    for (const key of keys) {
      if (!this.state || !isDeepEqual(newState[key], this.state[key])) {
        changedKeys.push(key);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.state = { ...this.state, ...newState } as StoreState;
      this.notify(changedKeys);
    }
  }

  subscribe(
    callback: StoreListener<StoreState>['callback'], 
    dependencies = null
  ): () => void {
    this.listeners.push({ callback, dependencies });
    
    // Unsubscribe helper
    return () => {
      this.listeners = this.listeners.filter(l => l.callback !== callback);
    };
  }

  notify(changedKeys: (keyof StoreState)[] ) {
    this.listeners.forEach(({ callback, dependencies }) => {
      if (!dependencies || dependencies.some(dep => changedKeys.includes(dep))) {
        callback(this.state);
      }
    });
  }
}

function isDeepEqual(obj1: (keyof StoreState), obj2: (keyof StoreState)) {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
}

export const store = new Store();

export interface SignupState {
  kind: 'signup';
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

export interface AdminState {
  students: Student[],
  studentNames: string[],
  dailySchedules: DailySchedule[],
  signups: Signup[],
  settings: Setting[],

  isEditor: boolean,
  
  currentSortField: "date" | "period",
  currentSortOrder: "asc" | "desc",

  dataRows: AdminDataRow[],

  currentStudentName: "",
  requestedStudentEmail: "",
};