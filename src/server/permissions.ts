/**
 * Returns whether the current user may edit signup records
 * 
 * @returns True if the user is authorized to edit data, otherwise false
 */
function mayEdit(): boolean {
  const userEmail = getEmail();
  const editors = getDataEditors();

  let allowed = false;
  editors.forEach(editor => {
   if (userEmail == editor) {
      // Allowed if the user's email matches one of the specified editors
      allowed = true;
   }
  });
  return allowed;
}

/**
 * Returns whether this user has permission to submit the signup form
 * 
 * @returns True if the user's email domain is in the allowed submitter list, otherwise false
 */
function maySubmit(): boolean {
  const userEmail = getEmail();
  let allowed = false;

  ALLOWED_SUBMITTERS.forEach(domain => {
    if (userEmail.indexOf(domain) > 0) {
      // Allowed if one of the allowed domains is part of the user's email address
      allowed = true;
    }
  });
  return allowed;
}  

/**
 * Returns whether this user may view and set the admin page
 * 
 * @returns True if the user is an admin, otherwise false
 * @throws Error if the admin access range is not found in the spreadsheet
 */
function mayViewAdmin(): boolean {
  const userEmail = getEmail().toLowerCase();
  let allowed = false;

  let range = SPREADSHEET.getRangeByName(ADMIN_ACCESS_RANGE_NAME);
  if (!range) throw STANDARD_SERVER_ERROR;

  // Retrieve comma-separated admin emails and clean them up
  const adminsCellValue = range.getValue();
  const admins: string[] = adminsCellValue.split(",").map((ad: String) => ad.trim().toLowerCase());

  admins.forEach(admin => {
    if (userEmail === admin) {
      // Allowed if the user's email is found in the admins list
      allowed = true;
    }
  });
  return allowed;
}

/**
 * Returns whether this user may view and set attendance
 * 
 * @returns True if the user's email domain is in the allowed attendance list, otherwise false
 */
function mayViewAttendance(): boolean {
  const userEmail = getEmail();
  let allowed = false;

  ALLOWED_ATTENDANCE.forEach(domain => {
    if (userEmail.indexOf(domain) > 0) {
      // Allowed if one of the allowed domains is part of the user's email address
      allowed = true;
    }
  });
  return allowed;
}

/**
 * Checks if the current user is a staff member based on their email domain
 * 
 * @returns True if the user's email includes the staff domain, otherwise false
 */
function isStaff() {
  const userEmail = getEmail();
  return userEmail && userEmail.indexOf("@walpole.k12.ma.us") > 0;
}
