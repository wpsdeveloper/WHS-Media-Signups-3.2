import * as dom from "../common/dom";
import { SignupState, store } from './signup-store';

/**
 * Pure calculation: Extracts available intervention teachers/subjects from the current schedule block.
 */
export function getAvailableInterventionTeachers(
  currentScheduleBlock: DailyBlock | null,
  currentSubject: string | null = null
): string[] {
  if (!currentScheduleBlock) {
    return [];
  }

  const teachers = [...(currentScheduleBlock.interventionTeachers || [])];

  if (currentSubject && !teachers.includes(currentSubject)) {
    teachers.push(currentSubject);
  }

  return teachers;
}

/**
 * Event Handler: Responds to user subject selection/input changes.
 * Updates store state only.
 */
export const subjectChangeHandler = (event?: Event) => {
  const target = event?.target as HTMLSelectElement | HTMLInputElement | undefined;
  const selectedSubject =
    target?.value ??
    dom.valueOf("#subject-int-select") ??
    dom.valueOf("#subject-int-input") ??
    dom.valueOf("#subject-non-int") ??
    "";
  store.setState({ ui_currentSubject: selectedSubject });
};

/**
 * Pure UI View: Updates the intervention subject select box options based on available teachers.
 */
export const updateSubjectUi = (
  teachersAvailable: string[],
  currentSubject: string | null
) => {
  dom.clearOptions("#subject-int-select");

  teachersAvailable.forEach((teacher) => {
    dom.appendOption("#subject-int-select", teacher, teacher);
  });

  if (currentSubject) {
    const selectElem = dom.qs("#subject-int-select") as HTMLSelectElement | null;
    if (selectElem) {
      dom.setValue("#subject-int-select", currentSubject);
    }
  }
};

/**
 * Orchestrator: Updates options for intervention teachers based on current block and selection.
 */
export const updateSubjectOptions = (
  currentScheduleBlock: DailyBlock | null,
  currentSubject: string | null
) => {
  const teachers = getAvailableInterventionTeachers(currentScheduleBlock, currentSubject);
  updateSubjectUi(teachers, currentSubject);
};

/**
 * Subscriber: Re-calculates and populates subject options when dependencies change.
 */
export const setupSubjectObservers = () => {
  // Updates subject selectbox options based on schedule block
  store.subscribe(
    (state: SignupState) => {
      updateSubjectOptions(state.ui_currentScheduleBlock, state.ui_currentSubject);
    },
    ['ui_currentScheduleBlock']
  );

  // Syncs select and input if subject is changed externally (e.g., during edit mode)
  store.subscribe(
    (state: SignupState) => {
      const selectElem = dom.qs("#subject-int-select") as HTMLSelectElement | null;
      if (selectElem && state.ui_currentSubject && selectElem.value !== state.ui_currentSubject) {
        dom.setValue("#subject-int-select", state.ui_currentSubject);
      }

      const inputElem = dom.qs("#subject-int-input") as HTMLInputElement | null;
      if (inputElem && state.ui_currentSubject && inputElem.value !== state.ui_currentSubject) {
        dom.setValue("#subject-int-input", state.ui_currentSubject);
      }

      const nonIntSelectElem = dom.qs("#subject-non-int") as HTMLSelectElement | null;
      if (nonIntSelectElem && state.ui_currentSubject && nonIntSelectElem.value !== state.ui_currentSubject) {
        dom.setValue("#subject-non-int", state.ui_currentSubject);
      }
    },
    ['ui_currentSubject']
  );
};
