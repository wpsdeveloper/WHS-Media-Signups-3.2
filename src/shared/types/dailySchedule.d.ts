type Term = "s1" | "s2";
type Day = `Day ${1|2|3|4|5|6|7|8}`;
type Period = '1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'Wed. PM Int.';

type RotationBlock = {
  day: Day,
  period: Period,
}

type ScheduleBlock = {
  term: Term,
  day: Day,
  period: Period,
  intTeachers: string[],
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
