import * as dom from "../common/dom";
import * as dates from "../common/dates";
import { SignupState, store } from './signup-store';
import { toggleNonInterventions, toggleTutoring } from "./type-select";

/**
 * Represents the current capacity status for non-intervention and tutoring signups.
 */
export interface CapacityStatus {
  /** Indicates whether the capacity has reached the maximum allowed limit. */
  isFull: boolean;
  /** The current number of relevant signups for the selected block. */
  count: number;
  /** The maximum number of signups allowed. */
  max: number;
}

/**
 * Computes whether the non-intervention or tutoring capacity is reached
 * for the selected schedule block.
 *
 * @param {DailyBlock | null} currentScheduleBlock - The currently selected schedule block.
 * @param {Signup[]} signups - The list of all signups. Defaults to an empty array.
 * @param {number} currentMax - The maximum capacity limit. Defaults to 10.
 * @returns {CapacityStatus} The calculated capacity status.
 */
export const getCapacityStatus = (
  currentScheduleBlock: DailyBlock | null,
  signups: Signup[] = [],
  currentMax: number = 10
): CapacityStatus => {
  // If no schedule block is selected, return a default non-full status
  if (!currentScheduleBlock) {
    return { isFull: false, count: 0, max: currentMax };
  }

  // Filter signups to find those that match the current date, period, and restricted types
  const matching = signups.filter((su) =>
    dates.isSameDate(new Date(su.date), currentScheduleBlock.date) &&
    String(currentScheduleBlock.period) === String(su.period) &&
    (su.type === "Non-intervention" || su.type === "Tutoring")
  );

  // Return the capacity status based on the matching signups count and max limit
  return {
    isFull: matching.length >= currentMax,
    count: matching.length,
    max: currentMax,
  };
};

/**
 * Updates the user interface based on the current capacity status.
 * Disables or enables the specific type selection options and updates warning labels.
 *
 * @param {CapacityStatus} status - The current capacity status.
 */
export const updateCapacityUi = (status: CapacityStatus) => {
  // Toggle the availability of Non-intervention and Tutoring options based on whether capacity is full
  toggleNonInterventions(!status.isFull, "Full");
  toggleTutoring(!status.isFull, "Full");
};

/**
 * Checks if the current user is on a restricted list (noFly) and disables signup options accordingly.
 * (Preserved for upcoming student eligibility refactoring)
 *
 * @param {string} userEmail - The email of the current user. Defaults to an empty string.
 */
export const preventSignupForNoFly = (userEmail: string = "") => {
  // Retrieve the list of students from the global store
  const students = store.getState().students;
  
  // Find the student matching the provided email
  const student = students.find((st) => st.email === userEmail);
  
  // If the student is on the noFly list, disable the non-intervention option and show a warning
  if (student?.noFly) {
    dom.setDisabled("input#non-intervention", true);
    dom.setChecked("input#non-intervention", false);
    dom.setVisible("label[for='non-intervention'] span.type-warning", true);
    dom.setText("label[for='non-intervention'] span.type-warning", "Not permitted");
  }
};

/**
 * Subscribes to relevant state changes and validates UI capacity rules.
 * Whenever specific store state changes occur, this observer recalculates capacity and updates UI.
 */
export const setupCapacityValidationObserver = () => {
  // Subscribe to the store and provide a callback for state changes
  store.subscribe((state: SignupState) => {
    // Calculate the current capacity status based on the latest state
    const status = getCapacityStatus(
      state.ui_currentScheduleBlock,
      state.signups,
      state.ui_currentMax
    );
    
    // Update the UI with the newly calculated capacity status
    updateCapacityUi(status);
  }, ['ui_currentDate', 'ui_currentPeriod', 'signups', 'ui_currentMax', 'ui_currentScheduleBlock']); // Only trigger when these specific state properties change
};
