import { parseDateInput, isSameDate } from "../common/dates";
import { SignupState, store } from './signup-store';
import { 
  resetAllTypes, 
  toggleInterventions, 
  toggleAssessmentMakeups, 
  toggleAltSetting, 
  toggleTutoring, 
  toggleWednesdayInterventions, 
  toggleNonInterventions 
} from "./type-input";

/**
 * Evaluates special schedule rules based on state parameters and updates UI inputs.
 * Returns special max capacity if defined, or null if no special max apply.
 */
export const evaluateScheduleRules = (
  currentDate: Date | null, 
  currentPeriod: Period | null, 
  dailySchedules: DailyBlock[] = []
) => {  
  resetAllTypes();  

  if (!currentDate || !currentPeriod) return null;

  // enables Wed PN Int is the period was set to it already. 
  // This is for the update existing signup procedure
  const periodIsWedInt = (currentPeriod === "Wed. PM");
  if (periodIsWedInt) toggleWednesdayInterventions(periodIsWedInt);
  
  // finds schedule matches with special schedules, returns if none
  const match = dailySchedules.filter(sched => (
    isSameDate(new Date(sched.date), currentDate) 
    && (sched.period === currentPeriod)
  ));

  if (match.length == 0) return null;
  const sched = match[0];
  // for the IF statements below ANY text value counts as "not allowed".
  // if not allowed, disables the check, unchecks, and adds a label warning
  toggleInterventions(sched.allowInterventions);
  toggleAssessmentMakeups(sched.allowAssessmentMakeups && !periodIsWedInt);
  toggleAltSetting(sched.allowAltSetting);
  toggleTutoring(sched.allowTutoring && !periodIsWedInt);
  toggleNonInterventions(sched.allowNonInterventions || periodIsWedInt);

  return sched.max;
};

/**
 * Subscriber: Applies schedule UI rules and updates state.currentMax if special rules apply.
 */
export const setupScheduleRulesObserver = () => {
  store.subscribe((state: SignupState) => {
    const specialMax = evaluateScheduleRules(
      state.currentDate,
      state.currentPeriod,
      state.dailySchedules
    );

    // If a special schedule defines a max capacity, reflect it in store state.
    // Otherwise fallback to defaultMax.
    const targetMax = (specialMax && specialMax > 0) ? Number(specialMax) : state.defaultMax;
    if (state.currentMax !== targetMax) {
      store.setState({ currentMax: targetMax });
    }
  }, ['currentDate', 'currentPeriod', 'dailySchedules']);
};