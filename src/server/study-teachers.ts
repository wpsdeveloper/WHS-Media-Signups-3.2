/**
 * Represents a parsed entry for study hall teachers for a given term, day, and period
 */
interface StudyEntry {
  /** The school term (e.g., 's1' or 's2') */
  term: Term,
  /** The day in the schedule rotation (e.g., 'Day 1') */
  day: Day;
  /** The period of the day */
  period: Period;
  /** Array of teacher names available for study hall */
  teachers: string[];
}

/**
 * Parses the "Duties S1" and "Duties S2" sheets in Google Apps Script.
 * Retrieves a flattened array of available study hall teachers grouped by term, day, and period.
 * 
 * @param appSettings An array of application settings retrieved from the spreadsheet
 * @returns Flat array of schedule entries for study teachers
 */
function parseStudyGrid(appSettings: Setting[]): InterventionsEntry[] {
  const terms: Record<string, Term> = {'Duties S1': 's1', 'Duties S2': 's2'};
  const records: InterventionsEntry[] = [] ;
  const recordMap = new Map();

  const spreadsheetId = getStudySpreadsheetId(appSettings);
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  if (!spreadsheet) return [];
  
  const sheetsToParse = ['Duties S1', 'Duties S2'];
  sheetsToParse.forEach(sheetName => {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return;
    
    const currentTerm: Term = terms[sheetName] as Term;
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return;
    
    // Header row 2 (index 1) contains Days: "Day 1", "Day 2", ...
    const headerRow = data[1] as Day[];
    
    // Get the last row of study hall duty (before any lunch duty sections in the chart)
    let lastStudyRow = findLastStudyRow(data);
    
    // Process columns starting from column index 2 (skipping blank and block column)
    for (let col = 2; col < headerRow.length; col++) {
      let currentDay: Day | null = null;
      
      // Parse the day string
      if (headerRow[col] && headerRow[col].toString().trim() !== '') {
        currentDay = headerRow[col].toString().trim() as Day;
      }
      if (!currentDay) continue;
      
      let currentPeriod: Period | null = null;
      // Loop through rows starting from index 2 looking for period or teacher names
      for (let row = 2; row <= lastStudyRow; row++) {
        const cell = data[row][col];
        
        // If the cell is a number, then this is the start of a new period block
        if (typeof cell === "number") {
          currentPeriod = cell.toString().trim() as Period;
          continue;
        } 
        
        // If we reached a teacher string without first finding a period, the sheet format is incorrect
        if (!currentPeriod) throw new Error('Error parsing study schedule');
        
        const teacherName = cell.toString().trim();
        if (teacherName.length === 0) continue;
        
        const mapKey = `${currentTerm}_${currentDay}_${currentPeriod}`;

        // Add teacher to existing record or create a new record
        if (recordMap.has(mapKey)) {
          recordMap.get(mapKey).teachers.push(teacherName);
        } else {
          const newEntry = {
            term: currentTerm,
            day: currentDay, 
            period: currentPeriod, 
            teachers: [teacherName]
          };
          recordMap.set(mapKey, newEntry);
        }
      }
    }
  });

  return [...recordMap.values()];
}

/**
 * Finds the index of the last row containing study hall duty data,
 * ignoring any "Location" or lunch duty information further down in the sheet.
 * 
 * @param data The 2D array of spreadsheet data
 * @returns The row index indicating the end of the study duty block
 */
function findLastStudyRow(data: SSRow[]): number {
  const block: string[] = data.map(r => String(r[1]));
  let locationIndex = block.indexOf("Location");
  if (locationIndex < 0) locationIndex = data.length;
  return locationIndex - 1;
}

/**
 * Retrieves the spreadsheet ID for the Study Teachers document from the settings array
 * 
 * @param appSettings An array of application settings
 * @returns The spreadsheet ID string, or an empty string if not found
 */
function getStudySpreadsheetId(appSettings: Setting[]): string {
  const setting = appSettings.find(s => s.key === 'DocId_Study_Teachers');
  if (!setting) return "";
  return setting.value as string;
}