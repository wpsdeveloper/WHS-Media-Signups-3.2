export interface DailySchedule {
    date: Date,
    day: string,
    periods: string[],
    specials: {
      '1'?: SpecialSchedule,
      '2'?: SpecialSchedule,
      '3'?: SpecialSchedule,
      '4'?: SpecialSchedule,
      '5'?: SpecialSchedule,
      '6'?: SpecialSchedule,
      '7'?: SpecialSchedule,
      '8'?: SpecialSchedule,
      'Wed. PM Int.'?: SpecialSchedule,
    },
}

interface SpecialSchedule {
  allowInterventions: string,
  allowAssessmentMakeups: string,
  allowAltSetting: string,
  allowTutoring: string,
  allowNonInterventions: string,
  max: number,  
}