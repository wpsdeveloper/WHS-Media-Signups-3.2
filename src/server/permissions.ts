/**
 * Returns whether the current user may edit signup records
 */
function mayEdit(): boolean {
  const userEmail = getEmail();
  const editors = getDataEditors();

  let allowed = false;
  editors.forEach(editor => {
   if (userEmail == editor) {
      // allowed if the user is one of the editors
      allowed = true;
   }
  });
  return allowed;
}

/**
 * Returns whether this user has permission to submit the form
 */
function maySubmit(): boolean {
  const userEmail = getEmail();
  let allowed = false;

  ALLOWED_SUBMITTERS.forEach(domain => {
    if (userEmail.indexOf(domain) > 0) {
      // allowed if the allowed domains are part of the user's email address
      allowed = true;
    }
  });
  return allowed;
}  

/**
 * Returns whether this user may view and set the admin page
 */
function mayViewAdmin(): boolean {
  const userEmail = getEmail().toLowerCase();
  let allowed = false;

  let range = SPREADSHEET.getRangeByName(ADMIN_ACCESS_RANGE_NAME);
  if (!range) throw STANDARD_SERVER_ERROR;

  let admins = range.getValues().map(row => row[0].toLowerCase().trim());
  admins = admins.filter(item => item.length > 0);

  admins.forEach(admin => {
    if (userEmail === admin) {
      // allowed if the allowed domains are part of the user's email address
      allowed = true;
    }
  });
  return allowed;
}

/**
 * Returns whether this user may view and set attendance
 */
function mayViewAttendance(): boolean {
  const userEmail = getEmail();
  let allowed = false;

  ALLOWED_ATTENDANCE.forEach(domain => {
    if (userEmail.indexOf(domain) > 0) {
      // allowed if the allowed domains are part of the user's email address
      allowed = true;
    }
  });
  return allowed;
}

function isStaff() {
  const userEmail = getEmail();
  return userEmail && userEmail.indexOf("@walpole.k12.ma.us") >0;
}

