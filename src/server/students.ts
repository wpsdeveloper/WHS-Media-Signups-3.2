
/**
 * Returns all students at the school, as found in the spreadsheet.
 * Note: a script in the spreadsheet imports these names into the ss nightly 
 */
function getStudents(): Student[] {
  const cache = CacheService.getScriptCache();
  try {
    const countStr = cache.get("students_chunk_count");
    if (countStr) {
      const count = parseInt(countStr, 10);
      const keys: string[] = [];
      for (let i = 0; i < count; i++) {
        keys.push(`students_chunk_${i}`);
      }
      const chunks = cache.getAll(keys);
      let fullJson = "";
      let complete = true;
      for (let i = 0; i < count; i++) {
        const part = chunks[`students_chunk_${i}`];
        if (part) {
          fullJson += part;
        } else {
          complete = false;
          break;
        }
      }
      if (complete && fullJson) {
        console.log("Returning cached student data");
        return JSON.parse(fullJson);
      }
    }
  } catch (e) {
    console.warn("Cache parse failed, refetching students", e);
  }

  const students = getStudentsFromSheets();

  // Cache for 6 hours (21600 seconds = max allowed in GAS CacheService)
  // Cache in chunks of 90KB to strictly stay under the 100KB per-item limit
  try {
    console.log("Caching student data in chunks");
    const json = JSON.stringify(students);
    const CHUNK_SIZE = 90000;
    const numChunks = Math.ceil(json.length / CHUNK_SIZE);
    const cacheObj: Record<string, string> = {
      students_chunk_count: String(numChunks)
    };
    for (let i = 0; i < numChunks; i++) {
      cacheObj[`students_chunk_${i}`] = json.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    }
    cache.putAll(cacheObj, 21600);
  } catch (e) {
    console.warn("Cache storage failed", e);
  }
  return students;
}

function getStudentsFromSheets(): Student[] {
  // gets all student data from the spreadsheet
  const sheet = SPREADSHEET.getSheetByName(STUDENTS_SHEET_NAME);
  if (!sheet) throw STANDARD_SERVER_ERROR;

  const values = sheet.getDataRange().getValues();
  
  // creates an array to return, filtering out headers and empty rows
  const students: Student[] = [];
  values.forEach(row => {
    const email = row[0] ? String(row[0]).trim() : "";
    if (email && email.includes("@")) {
      students.push({
        email: email,
        lastname: row[1] ? String(row[1]).trim() : "",
        firstname: row[2] ? String(row[2]).trim() : ""
      });
    }
  });
  return students;
}




function lookupStudentName(signup: Signup): {firstname: string, lastname: string} {
  const user = AdminDirectory!.Users.get(signup.emailStudent);
  const firstname = user?.name?.givenName? user.name.givenName : "";
  const lastname = user?.name?.familyName ? user.name.familyName : "";

  return {firstname, lastname};
}

function getNoFlyList(): string[] {
  const sheet = SPREADSHEET.getSheetByName(NO_FLY_LIST_SHEET_NAME);
  if (!sheet) return [];

  const emails = sheet.getDataRange().getValues();
  const nonBlanks = emails.filter(row => row[0].length > 0);
  const emailsArray = nonBlanks.map(row => row[0]);
  return emailsArray;
}

// Fast server-side lookup (returns max 10-15 matches)
function searchStudents(query: string): Student[] {
  if (!query || query.trim().length < 2) return [];
  if (!isStaff() && !mayViewAdmin()) {
    // Security check: non-staff cannot search other students
    return [];
  }

  const cleanQuery = query.trim().toLowerCase();
  
  // Use CacheService or read the sheet once
  const students = getStudents(); // or cached roster
  
  const matches: Student[] = [];
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const fullName = `${s.lastname}, ${s.firstname}`.toLowerCase();
    if (fullName.includes(cleanQuery) || s.email.toLowerCase().includes(cleanQuery)) {
      matches.push(s);
      if (matches.length >= 10) break; // Limit payload to 10 suggestions!
    }
  }

  return matches;
}
