import * as dom from './dom';
import { parseDateInput, isSameDate } from './dates';
import { SignupState, store } from '../signup/signup-store';

/**
*  Responds to a change in the Period field 
* */
export const periodChangeHandler = (event: MouseEvent) => {
  const target = event.target as HTMLSelectElement;
  if (!target) return;
  const selectedPeriod = target.value as Period;
  store.setState({ currentPeriod: selectedPeriod });
}

 /**
  * Updates the Periods select box based on the date 
  * */
export const updatePeriodOptions = (
  currentDate: Date | null, 
  dailySchedules: DailyBlock[]
) => {
  if (!currentDate) return;
  // remembers current selection. If this period is available in the new list,
  const oldPeriodVal = store.getState().currentPeriod;

  dom.clearOptions("#period");

  dailySchedules.forEach(schedule => {
    if (isSameDate(schedule.date, currentDate)) {
      dom.appendOption("#period", schedule.period, schedule.period);
    }
  })

  if (wednesdayInterventions(currentDate)) {
    dom.appendOption("#period", "Wed. PM", "Wed. PM");
  }

  // Restore existing selection if valid
  const selectElem = dom.qs("#period") as HTMLSelectElement;
  const firstAvailableValue = (selectElem?.options[0]?.value ?? "") as Period;

  if (oldPeriodVal && [...(selectElem?.options || [])].some(opt => opt.value === oldPeriodVal)) {
    dom.setValue("#period", oldPeriodVal);
  } else {
    dom.setValue("#period", firstAvailableValue);
    store.setState({currentPeriod: firstAvailableValue});
  }
 }

 /**
 * Subscriber: Re-renders available options when date or schedule data changes.
 */
export const setupPeriodOptionsObserver = () => {
  store.subscribe((state: SignupState) => {
    updatePeriodOptions(state.currentDate, state.dailySchedules);
  }, ['currentDate', 'dailySchedules']);
};

/**
 * Subscriber: Keeps the select element state synchronized with store.currentPeriod.
 */
export const setupPeriodValueObserver = () => {
  store.subscribe((state: SignupState) => {
    const periodSelect = dom.qs("#period") as HTMLSelectElement;
    if (periodSelect && state.currentPeriod && periodSelect.value !== state.currentPeriod) {
      dom.setValue("#period", state.currentPeriod);
    }
  }, ['currentPeriod']);
};

/**
 * Helper: Determines if Wednesday Interventions should be shown.
 */
function wednesdayInterventions(date: Date) {
  const wednesday = 3;
  const weekday = date.getDay();
  const dateIsWednesday = (weekday === wednesday);
  const wedIntActive = dom.valueOf("#wed-int-active") === "true";

  // console.log("Wed Int - returning "+ (dateIsWednesday && wedIntActive));
  return dateIsWednesday && wedIntActive;
}
 
 