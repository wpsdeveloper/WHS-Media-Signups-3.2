import * as dom from '../common/dom';
import { parseDateInput, isSameDate } from '../common/dates';
import { getAppConfig } from '../common/app-config';
import { SignupState, store } from './signup-store';

/**
 * Responds to a change in the Period field drop-down.
 * Updates the global store state with the selected period.
 * 
 * @param {MouseEvent} event - The mouse event triggered by changing the select input.
 * @returns {void}
 * */
export const periodChangeHandler = (event: MouseEvent): void => {
  const target = event.target as HTMLSelectElement;
  if (!target) return;
  const selectedPeriod = target.value as Period;
  store.setState({ ui_currentPeriod: selectedPeriod });
}

/**
  * Updates the Periods select box options based on the currently selected date.
  * Preserves the previously selected period if it is still available.
  * 
  * @param {Date | null} currentDate - The currently selected date.
  * @param {DailyBlock[]} dailySchedules - The list of all daily schedule blocks.
  * @returns {void}
  * */
export const updatePeriodOptions = (
  currentDate: Date | null, 
  dailySchedules: DailyBlock[]
): void => {
  if (!currentDate || !dailySchedules) return;
  // remembers current selection. If this period is available in the new list,
  const oldPeriodVal = store.getState().ui_currentPeriod;

  dom.clearOptions("#period");

  dailySchedules.forEach(schedule => {
    if (isSameDate(schedule.date, currentDate)) {
      const periodName = schedule.period.length === 1 ? `Period ${schedule.period}` : schedule.period;
      dom.appendOption("#period", schedule.period, periodName);
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
    store.setState({ui_currentPeriod: firstAvailableValue});
  }
 }

 /**
 * Subscriber: Re-renders available options when date or schedule data changes.
 * Keeps the UI in sync if the period is changed externally.
 * 
 * @returns {void}
 */
export const setupPeriodObservers = (): void => {
  // updates the period selectbox options when date or schedule changes
  store.subscribe((state: SignupState) => {
    updatePeriodOptions(state.ui_currentDate, state.dailySchedules);
  }, ['ui_currentDate', 'dailySchedules']);

  // updates the selected period ui id data is changed externally
  store.subscribe((state: SignupState) => {
    const periodSelect = dom.qs("#period") as HTMLSelectElement;
    if (periodSelect && state.ui_currentPeriod && periodSelect.value !== state.ui_currentPeriod) {
      dom.setValue("#period", state.ui_currentPeriod);
    }
  }, ['ui_currentPeriod']);
};

/**
 * Helper: Determines if Wednesday Interventions should be shown for a given date.
 * 
 * @param {Date} date - The selected date.
 * @returns {boolean} True if the date is a Wednesday and Wednesday interventions are enabled.
 */
function wednesdayInterventions(date: Date): boolean {
  const wednesday = 3;
  const weekday = date.getDay();
  const dateIsWednesday = (weekday === wednesday);
  
  const wedIntActive = store.getState().appConfig?.wedInt;
  return dateIsWednesday && wedIntActive;
}
 
 