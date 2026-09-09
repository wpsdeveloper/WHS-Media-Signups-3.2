import * as dom from './dom.js';
import { updatePeriodOptions, periodChangeHandler } from './period-select.js';
/**
  *  Responds to a change in the Date field 
  * */
 export const dateChangeHandler = () => {
   updatePeriodOptions();
   periodChangeHandler();
 }

 export const configureDateSelect = (selector, minDate, maxDate, initialDate) => {
   const dateInput = dom.$(selector);
   if (dateInput) {
     dateInput.type = "date";
     dateInput.min = minDate;
     dateInput.max = maxDate;
     dateInput.value = initialDate;
   }
 }
 

