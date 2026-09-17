export type Term = "s1" | "s2";
export type Day = `Day ${1|2|3|4|5|6|7|8}`;
export type Period = '1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'Wed. PM Int.';

export interface ScheduleBlock {
  term: Term,
  day: Day,
  period: Period,
  intTeachers: string[],
  studyTeachers: string[],
  special: SpecialSchedule | null, 
}

export interface SpecialSchedule {
  allowInterventions: boolean,
  allowAssessmentMakeups: boolean,
  allowAltSetting: boolean,
  allowTutoring: boolean,
  allowNonInterventions: boolean,
  max: number,  
}

export interface DailySchedule extends ScheduleBlock {
  date: Date,
}