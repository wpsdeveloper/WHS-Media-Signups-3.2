import { parseDateInput, toDateInputValue } from '../common/dates';
import * as dom from '../common/dom';
import { SignupState, store } from './signup-store';

/**
 * Responds to a change in the Date input field.
 * Parses the new date and updates the global store state.
 * 
 * @returns {void}
 */
export const dateChangeHandler = (): void => {
  // Get the current value from the date input field
  const newDate = dom.valueOf("#date");
  if (!newDate) return;

  try {
    // Attempt to parse the date input and update the UI current date state
    store.setState({
      ui_currentDate: parseDateInput(newDate),
    });
  } catch {
    // Keep existing date if format is invalid
  }
};

/**
 * Initializes the attendance date input field.
 * Sets the date bounds (-7 days to +14 days) and defaults to today's date if empty.
 * 
 * @returns {void}
 */
export const initDateInput = (): void => {
  // Retrieve the date input element from the DOM
  const dateInput = dom.qs(".date-input") as HTMLInputElement | null;
  if (!dateInput) return;

  // Calculate today's date, the minimum allowed date (7 days ago), and max date (14 days ahead)
  const today = new Date();
  const minDate = new Date(today);
  const maxDate = new Date(today);
  minDate.setDate(today.getDate() - 7);
  maxDate.setDate(today.getDate() + 14);

  // Configure the date input attributes
  dateInput.type = "date";
  dateInput.min = toDateInputValue(minDate);
  dateInput.max = toDateInputValue(maxDate);

  // If the date input is currently empty, set it to today's date
  if (!dateInput.value) {
    dateInput.value = toDateInputValue(today);
  }
};

/**
 * Subscribes to the global store to keep the date input DOM element in sync 
 * if the `ui_currentDate` state updates externally (e.g., initial server load or editing an existing signup record).
 * 
 * @returns {void}
 */
export const setupDateObserver = (): void => {
  // Subscribe to state changes in the store
  store.subscribe((state: SignupState) => {
      // If there is no current date in the state, exit early
      if (!state.ui_currentDate) return;

      // Retrieve the date input element
      const dateInput = dom.qs('#date') as HTMLInputElement | null;
      if (!dateInput) return;

      // Convert the state date to a string format suitable for the input field
      const dateStr = toDateInputValue(state.ui_currentDate);
      
      // Update the input value if it differs from the state
      if (dateInput.value !== dateStr) {
        dateInput.value = dateStr;
      }
    },
    ['ui_currentDate'] // Only trigger this observer when ui_currentDate changes
  );
};
