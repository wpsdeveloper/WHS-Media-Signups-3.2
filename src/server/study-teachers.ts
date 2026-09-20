interface StudyEntry {
  term: Term,
  day: Day;
  period: Period;
  teachers: string[];
}

function parseStudyGrid(): InterventionsEntry[] {
  const terms: Record<string, Term> = {'Duties S1': 's1', 'Duties S2': 's2'};
  const records: InterventionsEntry[] = [] ;
  
  const sheetsToParse = ['Duties S1', 'Duties S2'];
  sheetsToParse.forEach(sheetName => {
    const sheet = SPREADSHEET.getSheetByName(sheetName);
    if (!sheet) return;

    const currentTerm: Term = terms[sheetName] as Term;

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return;

    
    // Header row 2 contains Days "Day 1", "Day 2", ...
    const headerRow = data[1] as Day[];

    // get the last row, before any lunch duty nonsense in the chart
    let lastStudyRow = findLastStudyRow(data);
    
    // Process columns starting from column index 1 (skipping blank and block column
    for (let col = 2; col < headerRow.length; col++) {
      let currentDay: Day | null = null;
      
      if (headerRow[col] && headerRow[col].toString().trim() !== '') {
        currentDay = headerRow[col].toString().trim() as Day;
      }
      if(!currentDay) continue;
    
      let currentPeriod: Period | null = null;
      // Loop through rows from row index 2 looking for period or teacher
      for (let row = 2; row <= lastStudyRow; row++) {
        const cell = data[row][col];
        
        // if cell is a number, then this is the period
        if (parseInt(cell) !== 0) {
          currentPeriod = cell.trim();
        } 

        // if we reached a string without a period, there's an issue.
        if (!currentPeriod) throw new Error('Error parsing study schedule');

        const teacherName = String(cell).trim();
        if (teacherName.length === 0) continue;
        
        // add teacher to existing record or create new record
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

function findLastStudyRow(data: SSRow[]) {
  const block: string[] = data.map(r => String(r[1]));
  let locationIndex = block.indexOf("Location");
  if (locationIndex < 0) locationIndex = data.length;
  return locationIndex - 1;
}