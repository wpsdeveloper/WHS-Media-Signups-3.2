import * as dom from "../common/dom";
import { SignupState, store } from "./signup-store";

/**
 * Pure calculation: Determines whether the text fallback input should be displayed
 * instead of the select dropdown for intervention teachers/subjects.
 * (e.g. Wednesday PM or when no pre-populated intervention teachers exist for the block).
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
 */
export const toggleIntTeacherAltInput = (showAltInput: boolean) => {
  dom.setVisible("#subject-int-select", !showAltInput);
  dom.setVisible("#subject-int-input", showAltInput);
};

/**
 * Orchestrator: Evaluates schedule block conditions and updates intervention input visibility.
 */
export const updateInterventionTeacherInputVisibility = (
  currentScheduleBlock: DailyBlock | null
) => {
  const showAltInput = shouldShowInterventionAltInput(currentScheduleBlock);
  toggleIntTeacherAltInput(showAltInput);
};

/**
 * Subscriber: Listens to schedule block and period changes to adjust input visibility.
 */
export const setupInterventionTeacherObserver = () => {
  store.subscribe(
    (state: SignupState) => {
      updateInterventionTeacherInputVisibility(state.ui_currentScheduleBlock);
    },
    ['ui_currentScheduleBlock', 'ui_currentPeriod']
  );
};
