import { AdminState } from "./admin-store";

/**
 * Pure filter function for admin signups based on requested student email.
 */
export function filterSignups(
  signups: Signup[] = [],
  requestedStudentEmail: string
): Signup[] {
  if (!Array.isArray(signups)) {
    return [];
  }

  const targetEmail = (requestedStudentEmail || '').toLowerCase().trim();
  if (!targetEmail) {
    return [];
  }

  return signups.filter(su => {
    const studentEmail = (su.emailStudent || '').toLowerCase().trim();
    const submitterEmail = (su.email || '').toLowerCase().trim();
    return studentEmail === targetEmail || submitterEmail === targetEmail || !studentEmail;
  });
}

/**
 * Pure sort function for admin signups by date or period.
 */
export const sortSignups = (
  signups: Signup[],
  field: AdminState['ui_currentSortField'],
  order: AdminState['ui_currentSortOrder']
): Signup[] => {
  if (!Array.isArray(signups)) return [];

  const modifier = order === "asc" ? 1 : -1;
  const targetField = field === "date" ? "date" : "period";

  return [...signups].sort((a, b) => {
    if (a[targetField] < b[targetField]) return -1 * modifier;
    if (a[targetField] > b[targetField]) return 1 * modifier;
    return 0;
  });
};
