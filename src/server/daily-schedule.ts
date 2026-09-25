function getCachedOrParsedCalendarBlocks(appSettings: Setting[]): DailyBlock[] {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("calendar_blocks_v1");
  if (cached) {
    try {
      console.log("Returning cached calendar data");
      return JSON.parse(cached);
    } catch (e) {
      console.warn("Cache parse failed, refetching schedule blocks", e);
    }
  }

  const calendarBlocks = buildFlatScheduleData(appSettings)

  // Cache for 6 hours (21600 seconds = max allowed in GAS CacheService)
  try {
    console.log("Caching calendar data");
    cache.put("calendar_blocks_v1", JSON.stringify(calendarBlocks), 21600);
  } catch (e) {
    console.warn("Cache storage failed", e);
  }
  return calendarBlocks;
}

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
  const { start, end } = getActiveDateWindow(2, 2);
  
  rows.forEach(row => {
    if ((row[0] === "") || (row[1] === "")) return;
    const rowDate = new Date(row[0]);
    if (isNaN(rowDate.getTime())) return;

    if (rowDate.getTime() >= start.getTime() && rowDate.getTime() <= end.getTime()) {

      calendar.push({
        date: row[0],
        day: row[1] as Day
      })
    }
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
  
  const schedMap = new Map<string, ScheduleBlock>();
  scheduleBlocks.forEach(b => schedMap.set(`${b.term}_${b.day}_${b.period}`, b));

  const specialsMap = new Map<string, SpecialSchedule>();
  specialRows.forEach(row => {
    if (!row.date) return;
    const dateStr = new Date(row.date).toISOString().slice(0, 10);
    specialsMap.set(`${dateStr}_${row.period}`, {
      allowInterventions: row.allowInterventions === "true",
      allowAssessmentMakeups: row.allowAssessmentMakeups === "true",
      allowAltSetting: row.allowAltSetting === "true",
      allowTutoring: row.allowTutoring === "true",
      allowNonInterventions: row.allowNonInterventions === "true",
      max: parseInt(row.max) || DEFAULT_MAX_SIGNUPS,
    });
  });
  
  // gets the date when Semester 2 begins
  let s2DateTime = new Date("2100-01-01").getTime();
  const s2DateRange = SPREADSHEET.getRangeByName(S2_RANGE_NAME);
  if (s2DateRange) {
    const s2DateSetting = s2DateRange.getValue();
    if (s2DateSetting !== "") {
      s2DateTime = new Date(s2DateSetting).getTime();
    }
  } 
  
  const dailyBlocks: DailyBlock[] = [];
  calendarDays.forEach(calDay => {
    const date = new Date(calDay.date);
    const dateStr = date.toISOString().slice(0, 10);
    const term: Term = (date.getTime() < s2DateTime) ? 's1' : 's2';
    
    const masterGrid = MASTER_ROTATION_GRID.find(item => item.day === calDay.day);
    if (!masterGrid) return;

    masterGrid.periods.forEach(period => {
      const schedBlock = schedMap.get(`${term}_${calDay.day}_${period}`);
      if (!schedBlock) return;

      const special = specialsMap.get(`${dateStr}_${period}`) || EMPTY_SPECIAL;
      dailyBlocks.push({
        ...schedBlock,
        date: date,
        ...special,
      });
    });
  });
  return dailyBlocks;
}
