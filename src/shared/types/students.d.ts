/**
 * Represents a student in the system.
 */
type Student = {
  /** The student's email address */
  email: string,
  /** The student's last name */
  lastname: string,
  /** The student's first name */
  firstname: string,
  /** Optional flag indicating if the student is restricted from signing up */
  noFly?: boolean,
}
