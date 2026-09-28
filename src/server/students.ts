/**
 * @file students.ts
 * @description Manages student roster caching, Google Sheets student retrieval, AdminDirectory lookups, no-fly lists, and autocomplete searches.
 * @url https://github.com/wpsdeveloper/WHS-Media-Signups-3.2
 */

/**
 * Returns all students at the school, as found in the spreadsheet.
 * Note: A script in the spreadsheet imports these names into the sheet nightly.
 * It uses cache chunks to stay within the 100KB per-item cache limit.
 * 
 * @returns Array of Student objects.
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
        return JSON.parse(fullJson);
      }
    }
  } catch (e) {
    console.warn("Cache parse failed, refetching students", e);
  }

  const students = getStudentsFromSheets();

  try {
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

/**
 * Directly retrieves student data from the Google Sheet and converts it to objects.
 * 
 * @returns Array of Student objects parsed from the sheet.
 * @throws Error if the sheet cannot be found.
 */
function getStudentsFromSheets(): Student[] {
  const sheet = SPREADSHEET.getSheetByName(STUDENTS_SHEET_NAME);
  if (!sheet) throw STANDARD_SERVER_ERROR;

  const values = sheet.getDataRange().getValues();
  
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

/**
 * Looks up a student's first and last name from the Admin Directory based on their email address.
 * 
 * @param signup - The signup object containing the student's email.
 * @returns An object with the resolved firstname and lastname.
 */
function lookupStudentName(signup: Signup): {firstname: string, lastname: string} {
  const user = AdminDirectory!.Users.get(signup.emailStudent);
  const firstname = user?.name?.givenName ? user.name.givenName : "";
  const lastname = user?.name?.familyName ? user.name.familyName : "";

  return {firstname, lastname};
}

/**
 * Retrieves the list of student emails that are not allowed to sign up (No Fly List).
 * 
 * @returns An array of email strings.
 */
function getNoFlyList(): string[] {
  const sheet = SPREADSHEET.getSheetByName(NO_FLY_LIST_SHEET_NAME);
  if (!sheet) return [];

  const emails = sheet.getDataRange().getValues();
  const nonBlanks = emails.filter(row => row[0].length > 0);
  const emailsArray = nonBlanks.map(row => row[0]);
  return emailsArray;
}

/**
 * Fast server-side lookup for students (returns a maximum of 10 matches).
 * Used by RPC to power the autocomplete dropdown on the frontend.
 * 
 * @param query - The search query string.
 * @returns Array of matching Student objects (up to 10).
 */
function searchStudents(query: string): Student[] {
  if (!query || query.trim().length < 2) return [];
  if (!isStaff() && !mayViewAdmin()) {
    return [];
  }

  const cleanQuery = query.trim().toLowerCase();
  const students = getStudents();
  
  const matches: Student[] = [];
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const fullName = `${s.lastname}, ${s.firstname}`.toLowerCase();
    if (fullName.includes(cleanQuery) || s.email.toLowerCase().includes(cleanQuery)) {
      matches.push(s);
      if (matches.length >= 10) break;
    }
  }

  return matches;
}
