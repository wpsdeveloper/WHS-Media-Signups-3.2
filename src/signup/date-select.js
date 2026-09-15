import * as dom from '../common/dom.js';
import { store } from '../common/store';

/**
  *  Responds to a change in the Date field 
  * */
 export const dateChangeHandler = (event) => {
  const selectedDate = event.target.value;
  store.setState({ currentDate: selectedDate });
 }

 export const configureDateSelect = (selector, minDate, maxDate, initialDate) => {
   const dateInput = dom.qs(selector);
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
export const setupDateSelectObserver = (selector) => {
  store.subscribe((state) => {
    const dateInput = dom.qs(selector);
    if (dateInput && state.currentDate && dateInput.value !== state.currentDate) {
      dateInput.value = state.currentDate;
    }
  }, ['currentDate']);
};

export const chooseSemester = (currentDate, rolloverDate) => {
  if (!(currentDate instanceof Date) || !(rolloverDate instanceof Date)) {
    return null;
  }
  if (currentDate.getTime() >= rolloverDate.getTime()) {
    return '2';
  } else {
    return '1';
  }
}
 

