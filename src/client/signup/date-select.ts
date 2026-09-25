import { parseDateInput, toDateInputValue } from '../common/dates';
import * as dom from '../common/dom';
import { SignupState, store } from './signup-store';

/**
  *  Responds to a change in the Date field 
  * */
 export const dateChangeHandler = (event: MouseEvent) => {
  const target = event.target as HTMLInputElement;
  const selectedDate = target.value !== "" ? parseDateInput(target.value) : null;
  store.setState({ ui_currentDate: selectedDate });
 }

 export const configureDateSelect = (
  selector: string, 
  minDate: string, 
  maxDate: string, 
  initialDate: string
) => {
   const dateInput = dom.qs(selector) as HTMLInputElement;
   if (dateInput) {
     dateInput.type = "date";
     dateInput.min = minDate;
     dateInput.max = maxDate;
     if (initialDate) {
      dateInput.value = initialDate;
    }
   }
 }

 /**
 * Subscriber: Keeps the date input DOM element in sync if state updates externally.
 */
export const setupDateObserver = () => {
  // updates date field if data is changed externally
  store.subscribe((state: SignupState) => {
    const { ui_currentDate: currentDate } = state;
    if (!currentDate) return;

    const dateInput = dom.qs('#date') as HTMLInputElement;
    if (!dateInput) return;
    dom.setValue('#date', toDateInputValue(currentDate));
  }, ['currentDate']);
};

 

