import * as dom from "../common/dom"
import { SignupState, store } from "./signup-store";

/**
 * Pure UI View: Toggles between select dropdown and text input depending on state.
 */
export const toggleIntTeacherAltInput = (
  currentScheduleBlock: DailyBlock
) => {
  // If period is Wed. PM or no teachers array configured, show text input
  const isWedPm = currentScheduleBlock.period === "Wed. PM";
  const interventionTeachers = currentScheduleBlock.interventionTeachers;
  const hasNoTeachers = !interventionTeachers || interventionTeachers.length === 0;
  const showAltInput = isWedPm || hasNoTeachers;

  dom.setVisible("#subject-int-select", !showAltInput);
  dom.setVisible("#subject-int-input", showAltInput);
};

/**
 * Subscriber: Listens to interventionTeachers and currentPeriod updates to adjust input visibility.
 */
export const setupInterventionTeacherObserver = () => {
  store.subscribe((state: SignupState) => {
    if (state.ui_currentScheduleBlock) toggleIntTeacherAltInput(state.ui_currentScheduleBlock);
  }, ['currentPeriod']);
};