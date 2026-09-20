import { parseDateInput } from '../common/dates';
import * as dom from '../common/dom';
import { SignupState, store } from './signup-store';

/**
  *  Responds to a change in the Date field 
  * */
 export const dateChangeHandler = (event: MouseEvent) => {
  const target = event.target as HTMLInputElement;
  const selectedDate = target.value !== "" ? parseDateInput(target.value) : null;
  store.setState({ currentDate: selectedDate });
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
export const setupDateSelectObserver = (selector: string) => {
  store.subscribe((state: SignupState) => {
    const dateInput = dom.qs(selector) as HTMLInputElement;
    const newDate = parseDateInput(dateInput.value);
    if (state.currentDate !== newDate) {
      store.setState({ currentDate: newDate });
    }
  }, ['currentDate']);
};

 

