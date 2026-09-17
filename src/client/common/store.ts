import { DailySchedule } from "../../shared/types/dailySchedule";
import { Setting } from "../../shared/types/settings";
import { Signup, SignupType } from "../../shared/types/signups";
import { Student } from "../../shared/types/students";
import { InterventionTeachers } from "../../shared/types/teachers";
import { StudyTeachers } from "../../shared/types/teachers";
import { AttendanceDataRow } from "../attendance/attendance-data-row";
import { AdminDataRow } from "../admin/admin-data-row";

export type StoreState = SignupState | AttendanceState | AdminState | null;

export interface StoreListener<T> {
  callback: (state: T) => void;
  dependencies: (keyof T)[] | null;
}

// Store.js
export class Store<T> {
  state: T;
  listeners: StoreListener<T>[] = [];

  constructor(state: T) {
    this.state = state;
  }

  getState(): T {
    return { ...this.state };
  }

  setState(newState: Partial<T>): void {
    if (!newState) return;
    const changedKeys: (keyof T)[] = [];
    const keys = Object.keys(newState) as (keyof T)[];
    
    // FIX: Actually compare values and populate changedKeys
    for (const key of keys) {
      if (!isDeepEqual(this.state[key], newState[key])) {
        changedKeys.push(key);
      }
    }

    // If nothing changed, don't trigger a re-render
    if (changedKeys.length === 0) return;

    this.state = { ...this.state, ...newState } as T;
    this.notify(changedKeys);
  }

  subscribe(
    callback: StoreListener<T>['callback'], 
    dependencies: (keyof T)[] | null = null
  ): () => void {
    this.listeners.push({ callback, dependencies });
    
    return () => {
      this.listeners = this.listeners.filter(l => l.callback !== callback);
    };
  }

  notify(changedKeys: (keyof T)[]) {
    this.listeners.forEach(({ callback, dependencies }) => {
      if (!dependencies || dependencies.some(dep => changedKeys.includes(dep))) {
        callback(this.state);
      }
    });
  }
}

function isDeepEqual(obj1: any, obj2: any): boolean {
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

let __store: any;
export const store = <T>(stateType: T) => {
  __store ??= new Store(stateType);
  return __store;
}

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