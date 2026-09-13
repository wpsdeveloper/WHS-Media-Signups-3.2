import { parseDateInput, isSameDate } from "../common/dates.js";
import { store } from "./store.js";
import { 
  resetAllTypes, 
  disableInterventions, 
  disableAssessmentMakeups, 
  disableAltSetting, 
  disableTutoring, 
  disableWednesdayInterventions, 
  disableNonInterventions 
} from "./type-input.js";

/**
 * Evaluates special schedule rules based on state parameters and updates UI inputs.
 * Returns special max capacity if defined, or null if no special max apply.
 */
export const evaluateScheduleRules = (currentDateStr, currentPeriod, dailySchedules = []) => {  
  resetAllTypes();  

  if (!currentDateStr || !currentPeriod) return null;

  const date = parseDateInput(currentDateStr);
  const isWednesdayInterventions = (currentPeriod === "Wed. PM");

  if (isWednesdayInterventions) disableWednesdayInterventions();
  
  // finds schedule matches with special schedules, returns if none
  const match = dailySchedules.filter(sched => (
    isSameDate(new Date(sched.date), date) && (sched.specials !== null)
  ));

  if (match.length == 0) return null;
  
  const specials = match[0].specials;
  if (!specials || !specials.hasOwnProperty(currentPeriod)) return null;

  const special = specials[currentPeriod];
  
  // for the IF statements below ANY text value counts as "not allowed".
  // if not allowed, disables the check, unchecks, and adds a label warning
  if (special.allowInterventions?.length > 0) disableInterventions();
  if ((special.allowAssessmentMakeups?.length > 0) || isWednesdayInterventions) disableAssessmentMakeups();
  if (special.allowAltSetting?.length > 0) disableAltSetting();
  if ((special.allowTutoring?.length > 0) || isWednesdayInterventions) disableTutoring();
  if ((special.allowNonInterventions?.length > 0) && !isWednesdayInterventions) disableNonInterventions();

  return special?.max ? Number(special.max) : 0;
};

/**
 * Subscriber: Applies schedule UI rules and updates state.currentMax if special rules apply.
 */
export const setupScheduleRulesObserver = () => {
  store.subscribe((state) => {
    const specialMax = evaluateScheduleRules(
      state.currentDate,
      state.currentPeriod,
      state.dailySchedules
    );

    // If a special schedule defines a max capacity, reflect it in store state.
    // Otherwise fallback to defaultMax.
    const targetMax = specialMax > 0 ? Number(specialMax) : state.defaultMax;
    if (state.currentMax !== targetMax) {
      store.setState({ currentMax: targetMax });
    }
  }, ['currentDate', 'currentPeriod', 'dailySchedules']);
};