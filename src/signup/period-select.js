import * as dom from '../common/dom.js';
import { parseDateInput, isSameDate } from '../common/dates.js';
import { store } from '../common/store';

 /**
  *  Responds to a change in the Period field 
  * */
 export const periodChangeHandler = (event) => {
  const selectedPeriod = event.target.value;
  store.setState({ currentPeriod: selectedPeriod });
 }

 /**
  * Updates the Periods select box based on the date 
  * */
 export const updatePeriodOptions = (currentDateStr, dailySchedules) => {
   // remembers current selection. If this period is available in the new list,
   const oldPeriodVal = dom.valueOf("#period");
   if (!currentDateStr) return;

   const date = parseDateInput(currentDateStr);
   dom.clearOptions("#period");

   if (Array.isArray(dailySchedules)) {
    dailySchedules.forEach(schedule => {
      const schedDate = new Date(schedule.date);  
      if (isSameDate(schedDate, date)) {
        schedule.periods.forEach(period => {
          dom.appendOption("#period", period, period);
        })
      }
    })
  }

  if (wednesdayInterventions(date)) {
    dom.appendOption("#period", "Wed. PM", "Wed. PM");
  }

  // Restore existing selection if valid
  const selectElem = dom.qs("#period");
  const firstAvailableValue = selectElem?.options[0]?.value || "";

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
  store.subscribe((state) => {
    updatePeriodOptions(state.currentDate, state.dailySchedules);
  }, ['currentDate', 'dailySchedules']);
};

/**
 * Subscriber: Keeps the select element state synchronized with store.currentPeriod.
 */
export const setupPeriodValueObserver = () => {
  store.subscribe((state) => {
    const periodSelect = dom.qs("#period");
    if (periodSelect && state.currentPeriod && periodSelect.value !== state.currentPeriod) {
      dom.setValue("#period", state.currentPeriod);
    }
  }, ['currentPeriod']);
};

/**
 * Helper: Determines if Wednesday Interventions should be shown.
 */
function wednesdayInterventions(date) {
  const wednesday = 3;
  const weekday = date.getDay();
  const dateIsWednesday = (weekday === wednesday);
  const wedIntActive = dom.valueOf("#wed-int-active") === "true";

  // console.log("Wed Int - returning "+ (dateIsWednesday && wedIntActive));
  return dateIsWednesday && wedIntActive;
}
 
 