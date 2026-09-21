function buildFlatScheduleData(appSettings: Setting[]): DailyBlock[] {
  const rotationGrid = MASTER_ROTATION_GRID;
  const interventionTeachers = parseInterventionsGrid(appSettings);
  const studyTeachers = parseStudyGrid(appSettings);
  const scheduleBlocks: ScheduleBlock[] = parseRotation(rotationGrid, interventionTeachers, studyTeachers);
  
  const calendarRows = getSheetData(DAILY_SCHEDULES_SHEET_NAME);
  const calendarDays: CalendarRaw[] = parseCalendarRows(calendarRows);
  
  const specialsRows = getSheetData(SPECIAL_SCHEDULES_SHEET_NAME);
  const specialsDates: SpecialRaw[] = parseSpecialRows(specialsRows);
  
  const dailySchedules: DailyBlock[] = buildCalendarBlocks(calendarDays, scheduleBlocks, specialsDates);
  return dailySchedules;
}

function getSheetData(sheetName: string): SSRow[] {
  const sheet = SPREADSHEET.getSheetByName(sheetName);
  if (!sheet) return [];

  const range = sheet.getDataRange();
  if (!range) return [];

  const rows = range.getValues() as SSRow[];
  rows.shift();

  return rows;
}

function parseRotation(
  rotationGrid: RotationGrid[], 
  interventionTeachers: InterventionsEntry[], 
  studyTeachers: StudyEntry[]
  ): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = [];
  const terms: Term[] = ['s1', 's2'];

  rotationGrid.forEach(row => {
    if (!row.day) return;

    const periods = row.periods as Period[];
    periods.forEach(period => {
      terms.forEach(term => {
        const intArray = interventionTeachers.find(item => 
          item.day === row.day 
          && item.period === period
          && item.term === term
        ); 
        const studyArray = studyTeachers.find(item => 
          item.day === row.day 
          && item.period === period
          && item.term === term
        ); 

        const block: ScheduleBlock = {
          term: 's1',
          day: row.day,
          period: period,
          interventionTeachers: intArray?.teachers ?? [],
          studyTeachers: studyArray?.teachers ?? [],
        };
        blocks.push(block);
      })
    });
  })
  
  return blocks;
}

function parseCalendarRows(rows: SSRow[]): CalendarRaw[] {
  const calendar: CalendarRaw[] = [];
  
  rows.forEach(row => {
    if ((row[0] === "") || (row[1] === "")) return;
    calendar.push({
      date: row[0],
      day: row[1] as Day
    })
  });
  
  return calendar;
}

function parseSpecialRows(rows: SSRow[]): SpecialRaw[] {
  const specials: SpecialRaw[] = [];
  
  rows.forEach(row => {
    if ((row[0] === "") || (row[1] === "")) return;
    specials.push({
      date: row[0],
      period: String(row[1]) as Period,
      allowInterventions: String(row[2] === ""),
      allowAssessmentMakeups: String(row[2] === ""),
      allowAltSetting: String(row[2] === ""),
      allowTutoring: String(row[2] === ""),
      allowNonInterventions: String(row[2] === ""),
      max: String(row[7]),
    })
  });
  
  return specials;
}
function buildCalendarBlocks (
  calendarDays: CalendarRaw[], 
  scheduleBlocks: ScheduleBlock[],
  specialRows: SpecialRaw[]
): DailyBlock[] {
  const dailyBlocks: DailyBlock[] = [];
  
  // gets the date when Semester 2 begins
  let s2DateTime = new Date("2100-01-01").getTime();
  const s2DateRange = SPREADSHEET.getRangeByName(S2_RANGE_NAME);
  if (s2DateRange) {
    const s2DateSetting = s2DateRange.getValue();
    if (s2DateSetting !== "") {
      s2DateTime = new Date(s2DateSetting).getTime();
    }
  } 
  
  calendarDays.forEach(calDay => {
    const date = new Date(calDay.date);
    const day = calDay.day;
    const term: Term = (date.getTime() < s2DateTime) ? 's1' : 's2';
    
    const masterGridSchedule = MASTER_ROTATION_GRID.find(item => 
      item.day === day
    ); 
    if (!masterGridSchedule) return;
    
    const periods: Period[] = masterGridSchedule.periods;
    
    periods.forEach(period => {
      const schedBlock = scheduleBlocks.find(item =>
        item.term === term
        && item.day === day
        && item.period === period
      )
      if (!schedBlock) return;

      let newBlock: DailyBlock = {
        ...schedBlock,
        date: date,
        ...EMPTY_SPECIAL
      }

      const special = findSpecial(specialRows, date, period);
     
      if (special) {
        newBlock = {...newBlock, ...special};
      }
      
      dailyBlocks.push(newBlock);
    })
  })
  return dailyBlocks;
}

function findSpecial(
  specialRows: SpecialRaw[], 
  date: Date, 
  period: Period
): SpecialSchedule | null {
  const special = specialRows.find(item =>
    isSameDate(new Date(item.date), date)
    && item.period === period
  )
  
  if (!special) {
    return null;
  }
  const thisSpecial: SpecialSchedule = {
    allowInterventions: special.allowInterventions == "true",
    allowAssessmentMakeups: special.allowAssessmentMakeups == "true",
    allowAltSetting: special.allowAltSetting == "true",
    allowTutoring: special.allowTutoring == "true",
    allowNonInterventions: special.allowNonInterventions == "true",
    max: parseInt(special.max),
  }

  return thisSpecial;
}
