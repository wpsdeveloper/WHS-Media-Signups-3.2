/**
 * @file attendance-filter.ts
 * @description Pure functions for filtering and sorting attendance signup records.
 */

import { isSameDate } from "../common/dates";
import { AttendanceState } from "./attendance-store";

/**
 * Pure filter function for attendance signups based on date, period, and study teacher.
 * 
 * @param signups - Array of Signup records.
 * @param targetDate - Target date to filter by.
 * @param currentPeriod - Current period to filter by.
 * @param currentStudy - Selected study teacher filter.
 * @returns Filtered array of Signup records.
 */
export function filterSignups(
  signups: Signup[] = [],
  targetDate: Date | null,
  currentPeriod: Period | null,
  currentStudy: string
): Signup[] {
  if (!targetDate || !currentPeriod || !Array.isArray(signups)) {
    return [];
  }

  return signups.filter((su) => {
    const signupDate = su.date instanceof Date ? su.date : new Date(su.date);
    const isMatchingDate = isSameDate(signupDate, targetDate);
    const isMatchingPeriod = su.period === currentPeriod;
    const isMatchingStudy =
      currentStudy === "All studies" ||
      currentStudy === su.teacherStudy ||
      su.type === "Staff reservation";

    return isMatchingDate && isMatchingPeriod && isMatchingStudy;
  });
}

/**
 * Pure sort function for attendance signups by student (lastname, firstname) or study.
 * 
 * @param signups - Array of Signup records to sort.
 * @param field - Field to sort by ("student" or "study").
 * @param order - Sort order ("asc" or "desc").
 * @returns Sorted array of Signup records.
 */
export const sortSignups = (
  signups: Signup[],
  field: AttendanceState["ui_currentSortField"],
  order: AttendanceState["ui_currentSortOrder"]
): Signup[] => {
  if (!Array.isArray(signups)) return [];

  const modifier = order === "asc" ? 1 : -1;

  return [...signups].sort((a, b) => {
    if (field === "study") {
      const studyComparison = (a.teacherStudy || "").localeCompare(
        b.teacherStudy || "",
        undefined,
        { sensitivity: "base" }
      );
      if (studyComparison !== 0) {
        return studyComparison * modifier;
      }
    }

    // Primary or secondary sort: lastname, then firstname
    const lastNameComparison = (a.lastname || "").localeCompare(
      b.lastname || "",
      undefined,
      { sensitivity: "base" }
    );
    if (lastNameComparison !== 0) {
      return lastNameComparison * modifier;
    }

    return (
      (a.firstname || "").localeCompare(b.firstname || "", undefined, {
        sensitivity: "base",
      }) * modifier
    );
  });
};
