interface InterventionsEntry {
  term: Term,
  day: Day;
  period: Period;
  teachers: string[];
}

/**
 * Parses the "S1" and "S2" sheets in Google Apps Script.
 * @returns {InterventionsEntry[]} Flat array of schedule entries.
 */
function parseInterventionsGrid(): InterventionsEntry[] {
  const terms: Record<string, Term> = {S1: 's1', S2: 's2'};
  const records: InterventionsEntry[] = [] ;
  
  const sheetsToParse = ['S1', 'S2'];
  sheetsToParse.forEach(sheetName => {
    const sheet = SPREADSHEET.getSheetByName(sheetName);
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
      if(!currentDay) continue;
      
      let currentPeriod: Period | null = null;
      // Loop through teacher rows starting from row index 2
      for (let row = 1; row < data.length; row++) {
        const cell = data[row][col];
        if (parseInt(cell) === 0) {
          currentPeriod = cell;
        } 
        if (!currentPeriod) continue;

        const teacherName = String(cell);
        
        const match = records.filter(r => 
          r.day == currentDay 
          && r.period == currentPeriod
          && r.term == currentTerm
        );
        if (match) {
          match[0].teachers.push(teacherName);
        } else {
          records.push({
            term: currentTerm,
            day: currentDay, 
            period: currentPeriod, 
            teachers: [teacherName]
          });
        }
      }
    }
  });

  return records;
}