/**
 * Represents a term or semester (e.g., Semester 1 or Semester 2).
 */
type Term = "s1" | "s2";

/**
 * Represents a school day in a rotating schedule, from Day 1 to Day 8.
 */
type Day = `Day ${1|2|3|4|5|6|7|8}`;

/**
 * Represents a specific class period in a day.
 */
type Period = '1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'Wed. PM';

// Data Objects
/**
 * Represents a basic block of time in the rotation.
 */
type RotationBlock = {
  /** The day of the rotation */
  day: Day,
  /** The specific period within the day */
  period: Period,
}

/**
 * Represents a grid of periods for a specific rotation day.
 */
type RotationGrid = {
  /** The day of the rotation */
  day: Day,
  /** The list of periods that occur on this day */
  periods: Period[],
}

/**
 * Represents a scheduled block of time, including assigned teachers.
 */
type ScheduleBlock = {
  /** The term this block belongs to */
  term: Term,
  /** The day of the rotation */
  day: Day,
  /** The specific period */
  period: Period,
  /** Teachers assigned for interventions */
  interventionTeachers: string[],
  /** Teachers assigned for study hall */
  studyTeachers: string[],
}

/**
 * Represents settings and limitations for a special schedule day.
 */
type SpecialSchedule = {
  /** Whether interventions are allowed */
  allowInterventions: boolean,
  /** Whether assessment makeups are allowed */
  allowAssessmentMakeups: boolean,
  /** Whether alternative settings are allowed */
  allowAltSetting: boolean,
  /** Whether tutoring is allowed */
  allowTutoring: boolean,
  /** Whether non-interventions are allowed */
  allowNonInterventions: boolean,
  /** The maximum number of allowed signups */
  max: number,  
}

/**
 * Associates a special schedule with a specific calendar date.
 */
type CalendarDate = SpecialSchedule & {
  /** The date for this special schedule */
  date: Date,
}

/**
 * Combines a standard schedule block with specific calendar date settings.
 */
type DailyBlock = ScheduleBlock & CalendarDate;

/**
 * Raw daily block data where the date is a string rather than a Date object.
 */
type RawDailyBlock = Omit<DailyBlock, 'date'> & {
  /** String representation of the date */
  date: string;
};

// Spreadsheet data
/**
 * Raw calendar mapping data from the spreadsheet.
 */
interface CalendarRaw {
  /** String representation of the date */
  date: string,
  /** The mapped rotation day */
  day: Day,
}

/**
 * Raw special schedule settings data from the spreadsheet.
 */
interface SpecialRaw{
  /** String representation of the date */
  date: string,
  /** The period these settings apply to */
  period: Period,
  /** String boolean indicating if interventions are allowed */
  allowInterventions: string,
  /** String boolean indicating if assessment makeups are allowed */
  allowAssessmentMakeups: string,
  /** String boolean indicating if alt settings are allowed */
  allowAltSetting: string,
  /** String boolean indicating if tutoring is allowed */
  allowTutoring: string,
  /** String boolean indicating if non-interventions are allowed */
  allowNonInterventions: string,
  /** String representation of the max allowed signups */
  max: string,  
}

/**
 * Raw study teachers data from the spreadsheet.
 */
interface StudyTeachersRaw {
  /** The day of the rotation */
  day: Day,
  /** The specific period */
  period: Period,
  /** Array of teacher names assigned to study hall */
  teachers: string[],
}

/**
 * Raw intervention teachers data from the spreadsheet.
 */
interface InterventionTeachersRaw {
  /** The day of the rotation */
  day: Day,
  /** The specific period */
  period: Period,
  /** Array of teacher names assigned to interventions */
  teachers: string[],
}

