import * as dom from "../common/dom";
import { SignupState, store } from "./signup-store";

/**
 * Pure calculation: Determines whether the text fallback input should be displayed
 * instead of the select dropdown for intervention teachers/subjects.
 * (e.g. Wednesday PM or when no pre-populated intervention teachers exist for the block).
 * 
 * @param {DailyBlock | null} currentScheduleBlock - The currently selected schedule block.
 * @returns {boolean} True if the alternate text input should be shown, false otherwise.
 */
export function shouldShowInterventionAltInput(
  currentScheduleBlock: DailyBlock | null
): boolean {
  if (!currentScheduleBlock) {
    return false;
  }

  const isWedPm = currentScheduleBlock.period === "Wed. PM";
  const interventionTeachers = currentScheduleBlock.interventionTeachers;
  const hasNoTeachers = !interventionTeachers || interventionTeachers.length === 0;

  return isWedPm || hasNoTeachers;
}

/**
 * Pure UI View: Toggles between select dropdown and text input depending on whether alt input is needed.
 * 
 * @param {boolean} showAltInput - True to show the text input and hide the select; false to do the reverse.
 * @returns {void}
 */
export const toggleIntTeacherAltInput = (showAltInput: boolean): void => {
  dom.setVisible("#subject-int-select", !showAltInput);
  dom.setVisible("#subject-int-input", showAltInput);
};

/**
 * Orchestrator: Evaluates schedule block conditions and updates intervention input visibility.
 * 
 * @param {DailyBlock | null} currentScheduleBlock - The currently selected schedule block.
 * @returns {void}
 */
export const updateInterventionTeacherInputVisibility = (
  currentScheduleBlock: DailyBlock | null
): void => {
  const showAltInput = shouldShowInterventionAltInput(currentScheduleBlock);
  toggleIntTeacherAltInput(showAltInput);
};

/**
 * Subscriber: Listens to schedule block and period changes to adjust input visibility.
 * 
 * @returns {void}
 */
export const setupInterventionTeacherObserver = (): void => {
  store.subscribe(
    (state: SignupState) => {
      updateInterventionTeacherInputVisibility(state.ui_currentScheduleBlock);
    },
    ['ui_currentScheduleBlock', 'ui_currentPeriod']
  );
};
