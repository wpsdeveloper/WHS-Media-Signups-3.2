import * as dom from "../common/dom";
import { SignupState, store } from './signup-store';

/**
 * Pure calculation: Computes available study teachers based on the schedule block
 * and current signup type.
 */
export function getAvailableStudyTeachers(
  currentScheduleBlock: DailyBlock | null,
  currentType: SignupType | null,
  currentStudyTeacher: string | null = null
): string[] {
  if (!currentScheduleBlock || !currentType) {
    return [];
  }

  // Clone list so we don't mutate store dailySchedules
  const teachers: string[] = [...(currentScheduleBlock.studyTeachers || [])];

  if (currentType === "Alt setting" && !teachers.includes("Directly from class")) {
    teachers.push("Directly from class");
  }

  if (
    currentScheduleBlock.period !== "Wed. PM" &&
    !["Non-intervention", "Intervention"].includes(currentType) &&
    !teachers.includes("Coming from class")
  ) {
    teachers.push("Coming from class");
  }

  if (currentStudyTeacher && !teachers.includes(currentStudyTeacher)) {
    teachers.push(currentStudyTeacher);
  }

  return teachers;
}

/**
 * Pure UI View: Updates the select dropdown and fallback input visibility.
 */
export function updateStudyUi(
  currentScheduleBlock: DailyBlock | null,
  teachersAvailable: string[],
  currentSelectedTeacher: string | null
) {
  dom.clearOptions("#study-teacher-select");

  if (!currentScheduleBlock) {
    toggleStudyInputVisibility(false);
    return;
  }

  // Toggle outer section visibility for Wed. PM
  dom.setVisible("#study-div", currentScheduleBlock.period !== "Wed. PM");

  teachersAvailable.forEach((teacher) => {
    dom.appendOption("#study-teacher-select", teacher, teacher, false);
  });

  // Toggle dropdown vs. text input based on whether options exist
  const hasOptions = teachersAvailable.length > 0;
  toggleStudyInputVisibility(hasOptions);

  // Restore/maintain selection value in select element if present
  if (currentSelectedTeacher) {
    dom.setValue("#study-teacher-select", currentSelectedTeacher);
  }
}

/**
 * Pure UI Helper: Toggles visibility between dropdown and fallback input.
 */
export function toggleStudyInputVisibility(hasOptions: boolean) {
  dom.setVisible("#study-teacher-select", hasOptions);
  dom.setVisible("#study-teacher-input", !hasOptions);
}

/**
 * Event Handler: Responds to user change in the study teacher select element.
 */
export const studyTeacherChangeHandler = (event?: Event) => {
  const target = event?.target as HTMLSelectElement | HTMLInputElement | undefined;
  const selectedTeacher = target?.value ?? dom.valueOf("#study-teacher-select") ?? dom.valueOf("#study-teacher-input") ?? "";
  store.setState({ ui_currentStudyTeacher: selectedTeacher });
};

/**
 * Orchestrator: Calculates available teachers and renders UI accordingly.
 */
export const updateStudyOptions = (
  currentScheduleBlock: DailyBlock | null,
  currentType: SignupType | null,
  currentStudyTeacher: string | null
) => {
  const teachers = getAvailableStudyTeachers(currentScheduleBlock, currentType, currentStudyTeacher);
  updateStudyUi(currentScheduleBlock, teachers, currentStudyTeacher);
};

/**
 * Subscriber: Re-calculates options when relevant state changes and keeps element synced.
 */
export const setupStudyObservers = () => {
  // Sets study teacher options based on schedule block and signup type
  store.subscribe(
    (state: SignupState) => {
      updateStudyOptions(
        state.ui_currentScheduleBlock,
        state.ui_currentType,
        state.ui_currentStudyTeacher
      );
    },
    ['ui_currentScheduleBlock', 'ui_currentPeriod', 'ui_currentType']
  );

  // Syncs input/select if study teacher is updated externally (e.g. edit mode registration)
  store.subscribe(
    (state: SignupState) => {
      const selectElem = dom.qs("#study-teacher-select") as HTMLSelectElement | null;
      if (selectElem && state.ui_currentStudyTeacher && selectElem.value !== state.ui_currentStudyTeacher) {
        dom.setValue("#study-teacher-select", state.ui_currentStudyTeacher);
      }
      const inputElem = dom.qs("#study-teacher-input") as HTMLInputElement | null;
      if (inputElem && state.ui_currentStudyTeacher && inputElem.value !== state.ui_currentStudyTeacher) {
        dom.setValue("#study-teacher-input", state.ui_currentStudyTeacher);
      }
    },
    ['ui_currentStudyTeacher']
  );
};
