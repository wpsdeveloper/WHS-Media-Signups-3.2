import * as dom from "../common/dom.js";
import * as dates from "../common/dates.js";
import { store } from "./store.js";

/**
 * Calculates if a given date/period is full (too many existing reservations) 
 * */
export const checkFull = (currentDateStr, currentPeriod, signups = [], currentMax = 15) => {  
  if (!currentDateStr || !currentPeriod) return;
  
  const date = dates.parseDateInput(currentDateStr);
  
  // finding signups that match the date and period
  let matching = signups.filter(su => (
    dates.isSameDate(new Date(su.date), date)) && (period == "" + su.period)
  );

  // filters for only non-intervention and tutoring
  matching = matching.filter(su => (su.type === "Non-intervention") || (su.type === "Tutoring"));
 
  if (matching.length >= currentMax) {
    ["#non-intervention", "#tutoring"].forEach(selector => {
      dom.setDisabled(selector, true);
      dom.setChecked(selector, false);
      dom.setVisible(`${selector} label span.type-warning`, true);
      dom.setText(`${selector} label span.type-warning`, "Full");
    });
  }
}

/**
 * Pure UI View: Checks if current user is on noFlyList and disables options accordingly.
 */
export const preventSignupForNoFly = (noFlyList = [], userEmail = "") => {
  if (Array.isArray(noFlyList) && userEmail && noFlyList.includes(userEmail)) {
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
  store.subscribe((state) => {
    checkFull(
      state.currentDate,
      state.currentPeriod,
      state.signups,
      state.currentMax
    );
    preventSignupForNoFly(
      state.noFlyList,
      state.currentEmail
    );
  }, ['currentDate', 'currentPeriod', 'signups', 'currentMax', 'noFlyList', 'currentEmail']);
};

