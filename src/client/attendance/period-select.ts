import * as dom from '../common/dom';
import { isSameDate } from '../common/dates';
import { AttendanceState, store } from './attendance-store';

/**
*  Responds to a change in the Period field 
* */
export const periodChangeHandler = (event?: MouseEvent) => {
  const target = event?.target as HTMLSelectElement | undefined;
  const selectedPeriod = (target?.value || dom.valueOf("#period")) as Period;
  if (!selectedPeriod) return;
  store.setState({ ui_currentPeriod: selectedPeriod });
};

 /**
  * Updates the Periods select box based on the date 
  * */
export const updatePeriodOptions = (
  currentDate: Date | null, 
  dailySchedules: DailyBlock[]
) => {
  if (!currentDate || !dailySchedules) return;
  // remembers current selection. If this period is available in the new list,
  const oldPeriodVal = store.getState().ui_currentPeriod;

  dom.clearOptions("#period");

  dailySchedules.forEach(schedule => {
    if (isSameDate(schedule.date, currentDate)) {
      const periodName = schedule.period.length === 1 ? `Period ${schedule.period}` : schedule.period;
      dom.appendOption("#period", schedule.period, periodName);
    }
  });

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
    store.setState({ ui_currentPeriod: firstAvailableValue });
  }
};

 /**
 * Subscriber: Re-renders available options when date or schedule data changes.
 */
export const setupPeriodObservers = () => {
  // updates the period selectbox options when date or schedule changes
  store.subscribe((state: AttendanceState) => {
    updatePeriodOptions(state.ui_currentDate, state.dailySchedules);
  }, ['ui_currentDate', 'dailySchedules']);

  // updates the selected period ui if data is changed externally
  store.subscribe((state: AttendanceState) => {
    const periodSelect = dom.qs("#period") as HTMLSelectElement;
    if (periodSelect && state.ui_currentPeriod && periodSelect.value !== state.ui_currentPeriod) {
      dom.setValue("#period", state.ui_currentPeriod);
    }
  }, ['ui_currentPeriod']);
};

/**
 * Helper: Determines if Wednesday Interventions should be shown.
 */
function wednesdayInterventions(date: Date) {
  const wednesday = 3;
  const weekday = date.getDay();
  const dateIsWednesday = (weekday === wednesday);
  
  const wedIntActive = store.getState().appConfig?.wedInt;
  return dateIsWednesday && wedIntActive;
}
