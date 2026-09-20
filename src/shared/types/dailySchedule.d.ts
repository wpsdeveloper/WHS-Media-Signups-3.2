type Term = "s1" | "s2";
type Day = `Day ${1|2|3|4|5|6|7|8}`;
type Period = '1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'Wed. PM';

// Data Objects
type RotationBlock = {
  day: Day,
  period: Period,
}

type RotationGrid = {
  day: Day,
  periods: Period[],
}

type ScheduleBlock = {
  term: Term,
  day: Day,
  period: Period,
  interventionTeachers: string[],
  studyTeachers: string[],
}

type SpecialSchedule = {
  allowInterventions: boolean,
  allowAssessmentMakeups: boolean,
  allowAltSetting: boolean,
  allowTutoring: boolean,
  allowNonInterventions: boolean,
  max: number,  
}

type CalendarDate = SpecialSchedule & {
  date: Date,
}

type DailyBlock = ScheduleBlock & CalendarDate;

type RawDailyBlock = Omit<DailyBlock, 'date'> & {
  date: string;
};

// Spreadsheet data
interface CalendarRaw {
  date: string,
  day: Day,
}

interface SpecialRaw{
  date: string,
  period: Period,
  allowInterventions: string,
  allowAssessmentMakeups: string,
  allowAltSetting: string,
  allowTutoring: string,
  allowNonInterventions: string,
  max: string,  
}

interface StudyTeachersRaw {
  day: Day,
  period: Period,
  teachers: string[],
}

interface InterventionTeachersRaw {
  day: Day,
  period: Period,
  teachers: string[],
}

