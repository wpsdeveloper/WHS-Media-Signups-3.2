import { parseDateInput, toDateInputValue } from '../common/dates';
import * as dom from '../common/dom';
import { SignupState, store } from './signup-store';

/**
 * Responds to a change in the Date input field
 */
export const dateChangeHandler = () => {
  const newDate = dom.valueOf("#date");
  if (!newDate) return;

  try {
    store.setState({
      ui_currentDate: parseDateInput(newDate),
    });
  } catch {
    // Keep existing date if format is invalid
  }
};

/*
 * Initializes the attendance date input with bounds (-14 days to +7 days) and today's date
 */
export const initDateInput = () => {
  const dateInput = dom.qs(".date-input") as HTMLInputElement | null;
  if (!dateInput) return;

  const today = new Date();
  const minDate = new Date(today);
  const maxDate = new Date(today);
  minDate.setDate(today.getDate() - 7);
  maxDate.setDate(today.getDate() + 14);

  dateInput.type = "date";
  dateInput.min = toDateInputValue(minDate);
  dateInput.max = toDateInputValue(maxDate);

  if (!dateInput.value) {
    dateInput.value = toDateInputValue(today);
  }
};

/**
 * Subscriber: Keeps the date input DOM element in sync if state updates externally
 * (e.g. initial server load or editing an existing signup record).
 */
export const setupDateObserver = () => {
  store.subscribe((state: SignupState) => {
      if (!state.ui_currentDate) return;

      const dateInput = dom.qs('#date') as HTMLInputElement | null;
      if (!dateInput) return;

      const dateStr = toDateInputValue(state.ui_currentDate);
      if (dateInput.value !== dateStr) {
        dateInput.value = dateStr;
      }
    },
    ['ui_currentDate']
  );
};
