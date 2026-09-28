/**
 * Defines the allowed types of signups.
 */
type SignupType = 'Non-intervention' | 'Intervention' | 'Tutoring' | 'Assessment' | 'Staff reservation' | 'Alt setting';

/**
 * Represents a student's signup record.
 */
type Signup = {
  /** The timestamp when the signup was created */
  timestamp: Date,
  /** Email of the person who created the signup (could be student or staff) */
  email: string,
  /** Email of the student the signup is for */
  emailStudent: string,
  /** Student's last name */
  lastname: string,
  /** Student's first name */
  firstname: string,
  /** The date the signup is for */
  date: Date,
  /** The period the signup is for */
  period: string,
  /** The category/type of signup */
  type: SignupType,
  /** The teacher for the study period */
  teacherStudy: string,
  /** The subject being studied or focused on */
  subject: string,
  /** The purpose of the signup */
  purpose: string,
  /** The academic teacher associated with the signup, if applicable */
  teacherAcad: string,
  /** Assigned room number, if any */
  room: '1' | '2' | null,
  /** Additional comments provided during signup */
  comments: string,
  /** Unique row identifier in the spreadsheet */
  rowId: string,
  /** Check-in time for study */
  studyIn1: string,
  /** Check-in time for media center */
  mediaIn: string,
  /** Check-out time for media center */
  mediaOut: string,
  /** Second check-in time for study, if applicable */
  studyIn2: string ,
}

/**
 * Represents the raw signup data received from the spreadsheet before date parsing.
 */
type RawSignup = Omit<Signup, 'date' | 'timestamp'> & { 
  /** String representation of the signup date */
  date: string, 
  /** Timestamp when the signup was created */
  timestamp: Date
}


