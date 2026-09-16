import * as dom from "../common/dom.js"
import { store } from "../common/store";

/**
 * Pure UI View: Toggles between select dropdown and text input depending on state.
 */
export const toggleIntTeacherAltInput = (interventionTeachers, currentPeriod) => {
  // If period is Wed. PM or no teachers array configured, show text input
  const isWedPm = currentPeriod === "Wed. PM";
  const hasNoTeachers = !interventionTeachers || interventionTeachers.length === 0;
  const showAltInput = isWedPm || hasNoTeachers;

  dom.setVisible("#subject-int-select", !showAltInput);
  dom.setVisible("#subject-int-input", showAltInput);
};

/**
 * Subscriber: Listens to interventionTeachers and currentPeriod updates to adjust input visibility.
 */
export const setupInterventionTeacherObserver = () => {
  store.subscribe((state) => {
    toggleIntTeacherAltInput(state.interventionTeachers, state.currentPeriod);
  }, ['interventionTeachers', 'currentPeriod']);
};