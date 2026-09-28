/**
 * Sends an email confirmation to the user after a form submission
 * 
 * @param signup The user submitted form data containing email addresses and reservation details
 * @throws Error if the email fails to send
 */
function sendConfirmationMessage(signup: Signup) {
  try {
    var message = createEmailMessage(signup);
    var options = buildEmailOptions(signup.email);
    GmailApp.sendEmail(signup.emailStudent, "WHS Media Center Reservation", message, options);
  } catch (error) {
    throw new Error("Submission complete, but there was an error sending the confirmation email.");
  }
}

/**
 * Builds the body of the confirmation email message
 * 
 * @param signup The user submitted form data
 * @returns A formatted string containing the email message body
 * @throws Error if there's an issue communicating with the database or fetching settings
 */
function createEmailMessage(signup: Signup): string {
    var date = new Date(signup.date);
    var dateFormatted = WEEKDAYS[date.getDay()] +", " + MONTHS[date.getMonth()] + " " + date.getDate() +", " + date.getFullYear();
    var room = signup.room? "Glass Room "+ signup.room : "";

    if (!SPREADSHEET) throw STANDARD_SERVER_ERROR;
    
    // Retrieve the contact emails from the spreadsheet settings
    var emailContactRange = SPREADSHEET.getRangeByName("Email_contacts");
    if (!emailContactRange) throw STANDARD_SERVER_ERROR;

    var emailContactVal = emailContactRange.getValue();
    var emailContacts = emailContactVal.split(",");
    
    // Construct the email message step-by-step
    let message = "Thank you for signing up for time in the WHS Media Center. Here is your reservation confirmation.\n";
    message += "\n";
    message += "Date requested: " + dateFormatted +"\n";
    message += "Period requested: " + signup.period +"\n";

    if (room !== "") {
      message += "Room reserved: " + signup.room +"\n";
    }

    message += "\nReason for visit: " + signup.type +"\n";
    
    // Include optional fields only if they were provided
    if (signup.purpose !== "") {
      message += "Purpose: " + signup.purpose +"\n";
    }
    
    if (signup.subject !== "") {
      message += "Subject: " + signup.subject +"\n";
    }
    
    message += "Study hall teacher: " + signup.teacherStudy +"\n";
    
    if (signup.teacherAcad !== "") {
      message += "Teacher you are doing work for: " + signup.teacherAcad +"\n";
    }

    if (signup.comments !== "") {
      message += "Message: " + signup.comments +"\n";
    }

    message += "\n";
    message += "If you need to modify or cancel this booking, please contact " + emailContacts.join(" or ") + ".";

    return message;
}

/**
 * Builds the options object for sending the email, including setting CC if necessary
 * 
 * @param teacherEmail The email address of the teacher (if a teacher submitted the form)
 * @returns An object containing email options (e.g., noReply, cc)
 */
function buildEmailOptions(teacherEmail: string) {
  const options: {noReply: boolean, cc?: string } = {noReply: true};

  // If a teacher submitted the form, adds the teacher as a cc to the email so they receive a copy
  if ((typeof teacherEmail === "string") && (teacherEmail.length > 0)) {
    options.cc = teacherEmail;
  }

  return options;
}