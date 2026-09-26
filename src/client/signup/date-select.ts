import { parseDateInput, toDateInputValue } from '../common/dates';
import * as dom from '../common/dom';
import { SignupState, store } from './signup-store';

/**
 * Pure calculation: Computes default min and max allowable dates
 * for the signup date input (-14 days to +14 days from reference date).
 */
export function getDateBounds(baseDate: Date = new Date()): { minDate: string; maxDate: string; initialDate: string } {
  const min = new Date(baseDate);
  const max = new Date(baseDate);
  min.setDate(baseDate.getDate() - 14);
  max.setDate(baseDate.getDate() + 14);

  return {
    minDate: toDateInputValue(min),
    maxDate: toDateInputValue(max),
    initialDate: toDateInputValue(baseDate),
  };
}

/**
 * Responds to a change in the Date input field.
 * Extracts the date string, parses it, and publishes to store.
 */
export const dateChangeHandler = (event?: Event) => {
  const target = event?.target as HTMLInputElement | undefined;
  const rawValue = target ? target.value : dom.valueOf('#date');
  if (!rawValue) return;

  try {
    const selectedDate = parseDateInput(rawValue);
    store.setState({ ui_currentDate: selectedDate });
  } catch {
    // Retain previous state if parsing fails
  }
};

/**
 * Configures the date input bounds and optional initial value.
 */
export const configureDateSelect = (
  selector: string = '#date',
  minDate: string,
  maxDate: string,
  initialDate?: string
) => {
  const dateInput = dom.qs(selector) as HTMLInputElement | null;
  if (!dateInput) return;

  dateInput.type = 'date';
  dateInput.min = minDate;
  dateInput.max = maxDate;
  if (initialDate && !dateInput.value) {
    dateInput.value = initialDate;
  }
};

/**
 * Initializes the signup date input with standard bounds (-14 days to +14 days)
 * parallel to attendance date-input initialization.
 */
export const initDateInput = (selector: string = '#date', baseDate: Date = new Date()) => {
  const { minDate, maxDate, initialDate } = getDateBounds(baseDate);
  configureDateSelect(selector, minDate, maxDate, initialDate);
};

/**
 * Subscriber: Keeps the date input DOM element in sync if state updates externally
 * (e.g. initial server load or editing an existing signup record).
 */
export const setupDateObserver = () => {
  store.subscribe(
    (state: SignupState) => {
      const { ui_currentDate } = state;
      if (!ui_currentDate) return;

      const dateInput = dom.qs('#date') as HTMLInputElement | null;
      if (!dateInput) return;

      const dateStr = toDateInputValue(ui_currentDate);
      if (dateInput.value !== dateStr) {
        dateInput.value = dateStr;
      }
    },
    ['ui_currentDate']
  );
};
