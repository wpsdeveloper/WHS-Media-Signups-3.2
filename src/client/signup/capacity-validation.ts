import * as dom from "../common/dom";
import * as dates from "../common/dates";
import { SignupState, store } from './signup-store';
import { toggleNonInterventions, toggleTutoring } from "./type-input";

/**
 * Calculates if a given date/period is full (too many existing reservations) 
 * */
export const checkFull = (
  currentScheduleBlock: DailyBlock | null,
  signups: Signup[] = [], 
  currentMax: number = 10) => {  
  if (!currentScheduleBlock) return;
  
  // finding signups that match the date and period
  let matching = signups.filter(su => (
    dates.isSameDate(new Date(su.date), currentScheduleBlock.date)) 
    && (currentScheduleBlock.period == "" + su.period)
    && ((su.type === "Non-intervention") 
      || (su.type === "Tutoring")
    )
  );
  const isFull = matching.length >= currentMax;
  toggleNonInterventions(isFull, "Full");
  toggleTutoring(isFull, "Full");
}

/**
 * Pure UI View: Checks if current user is on noFlyList and disables options accordingly.
 */
export const preventSignupForNoFly = (userEmail: string = "") => {
  const students = store.getState().students;
  const student = students.find(st => 
    st.email === userEmail
  )
  if (student?.noFly) {
    dom.setDisabled("input#non-intervention", true);
    dom.setChecked("input#non-intervention", false);
    dom.setVisible("label[for='non-intervention'] span.type-warning", true);
    dom.setText("label[for='non-intervention'] span.type-warning", "Not permitted");
  }
};

/**
 * Subscriber: Listens to relevant state changes and validates UI capacity rules.
 */
export const setupCapacityValidationObserver = () => {
  store.subscribe((state: SignupState) => {
    checkFull(
      state.currentScheduleBlock,
      state.signups,
      state.currentMax
    );
    // preventSignupForNoFly(
    //   state.currentEmail
    // );
  }, ['currentDate', 'currentPeriod', 'signups', 'currentMax', 'currentEmail']);
};

