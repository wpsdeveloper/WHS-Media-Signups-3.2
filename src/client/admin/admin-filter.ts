/**
 * @file admin-filter.ts
 * @description Pure functions for filtering and sorting admin audit signup records.
 */

import { AdminState } from "./admin-store";

/**
 * Pure filter function for admin signups based on requested student email.
 * 
 * @param signups - Array of Signup records.
 * @param requestedStudentEmail - Email of the student being audited.
 * @returns Filtered array of Signup records.
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
 * 
 * @param signups - Array of Signup records to sort.
 * @param field - Field to sort by ("date" or "period").
 * @param order - Sort order ("asc" or "desc").
 * @returns Sorted array of Signup records.
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
