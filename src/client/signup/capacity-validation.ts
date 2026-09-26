import * as dom from "../common/dom";
import * as dates from "../common/dates";
import { SignupState, store } from './signup-store';
import { toggleNonInterventions, toggleTutoring } from "./type-select";

export interface CapacityStatus {
  isFull: boolean;
  count: number;
  max: number;
}

/**
 * Pure calculation: Computes whether non-intervention / tutoring capacity is reached
 * for the selected schedule block.
 */
export const getCapacityStatus = (
  currentScheduleBlock: DailyBlock | null,
  signups: Signup[] = [],
  currentMax: number = 10
): CapacityStatus => {
  if (!currentScheduleBlock) {
    return { isFull: false, count: 0, max: currentMax };
  }

  const matching = signups.filter((su) =>
    dates.isSameDate(new Date(su.date), currentScheduleBlock.date) &&
    String(currentScheduleBlock.period) === String(su.period) &&
    (su.type === "Non-intervention" || su.type === "Tutoring")
  );

  return {
    isFull: matching.length >= currentMax,
    count: matching.length,
    max: currentMax,
  };
};

/**
 * UI View Updater: Updates the type selection options and warning labels
 * based on the capacity status.
 */
export const updateCapacityUi = (status: CapacityStatus) => {
  toggleNonInterventions(!status.isFull, "Full");
  toggleTutoring(!status.isFull, "Full");
};

/**
 * Pure UI View: Checks if current user is on noFlyList and disables options accordingly.
 * (Preserved for upcoming student eligibility refactoring)
 */
export const preventSignupForNoFly = (userEmail: string = "") => {
  const students = store.getState().students;
  const student = students.find((st) => st.email === userEmail);
  if (student?.noFly) {
    dom.setDisabled("input#non-intervention", true);
    dom.setChecked("input#non-intervention", false);
    dom.setVisible("label[for='non-intervention'] span.type-warning", true);
    dom.setText("label[for='non-intervention'] span.type-warning", "Not permitted");
  }
};

/**
 * Observer / Subscriber: Listens to relevant state changes and validates UI capacity rules.
 */
export const setupCapacityValidationObserver = () => {
  store.subscribe((state: SignupState) => {
    const status = getCapacityStatus(
      state.ui_currentScheduleBlock,
      state.signups,
      state.ui_currentMax
    );
    updateCapacityUi(status);
  }, ['ui_currentDate', 'ui_currentPeriod', 'signups', 'ui_currentMax', 'ui_currentScheduleBlock']);
};
