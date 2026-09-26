import { isSameDate } from "../common/dates";
import { AttendanceState } from "./attendance-store";

/**
 * Pure filter function for attendance signups based on date, period, and study teacher.
 */
export function filterSignups(
  signups: Signup[] = [],
  targetDate: Date | null,
  currentPeriod: string | null,
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
 * Pure sort function for attendance signups by student (lastname, firstname) or study (teacherStudy, lastname, firstname).
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
