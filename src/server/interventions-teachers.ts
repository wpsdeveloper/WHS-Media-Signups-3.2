/**
 * Represents a parsed entry for intervention teachers for a given term, day, and period
 */
interface InterventionsEntry {
  /** The school term (e.g., 's1' or 's2') */
  term: Term;
  /** The day in the schedule rotation (e.g., 'Day 1') */
  day: Day;
  /** The period of the day */
  period: Period;
  /** Array of teacher names available for interventions */
  teachers: string[];
}

/**
 * Parses the "S1" and "S2" sheets from the Interventions spreadsheet in Google Apps Script.
 * Retrieves a flattened array of available intervention teachers grouped by term, day, and period.
 * 
 * @param appSettings An array of application settings retrieved from the spreadsheet
 * @returns Flat array of schedule entries for intervention teachers
 */
function parseInterventionsGrid(appSettings: Setting[]): InterventionsEntry[] {
  const terms: Record<string, Term> = { S1: 's1', S2: 's2' };
  const records: InterventionsEntry[] = [];
  const recordMap = new Map<string, InterventionsEntry>();

  const spreadsheetId = getInterventionSpreadsheetId(appSettings);
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  if (!spreadsheet) return [];

  const sheetsToParse = ['S1', 'S2'];
  sheetsToParse.forEach((sheetName) => {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return;

    const currentTerm: Term = terms[sheetName] as Term;

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return;

    // Header row contains Days (e.g., Row 1: ["Teacher", "Day 1", "Day 1", ...])
    const headerRow = data[0] as Day[];

    // Process columns starting from column index 1 (skipping "Teacher" column)
    for (let col = 1; col < headerRow.length; col++) {
      let currentDay: Day | null = null;
      
      // Handle merged header cells where the day name only appears in the first cell
      if (headerRow[col] && headerRow[col].toString().trim() !== '') {
        currentDay = headerRow[col].toString().trim() as Day;
      }
      
      // If we don't have a valid day, skip this column
      if (!currentDay) continue;

      let currentPeriod: Period | null = null;
      // Loop through teacher rows starting from row index 2
      for (let row = 1; row < data.length; row++) {
        const cell = data[row][col];
        
        // If the cell contains a number, it indicates the start of a new period block
        if (typeof cell === 'number') {
          currentPeriod = cell.toString().trim() as Period;
          continue;
        }
        
        // If we are within a period block, parse the teacher name
        if (!currentPeriod) continue;

        const teacherName = cell.toString().trim();
        if (teacherName.length === 0) continue;

        const mapKey = `${currentTerm}_${currentDay}_${currentPeriod}`;

        // Group teachers into the same map key (term + day + period)
        if (recordMap.has(mapKey)) {
          recordMap.get(mapKey)!.teachers.push(teacherName);
        } else {
          const newEntry = {
            term: currentTerm,
            day: currentDay,
            period: currentPeriod,
            teachers: [teacherName],
          };
          recordMap.set(mapKey, newEntry);
        }
      }
    }
  });

  return [...recordMap.values()];
}

/**
 * Retrieves the spreadsheet ID for the Interventions document from the settings array
 * 
 * @param appSettings An array of application settings
 * @returns The spreadsheet ID string, or an empty string if not found
 */
function getInterventionSpreadsheetId(appSettings: Setting[]): string {
  const setting = appSettings.find((s) => s.key === 'DocId_Interventions');
  if (!setting) return '';
  return setting.value as string;
}
