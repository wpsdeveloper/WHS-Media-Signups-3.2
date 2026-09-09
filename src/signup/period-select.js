import * as dom from './dom';
import { parseDateInput, isSameDate } from './dates';
import { updateTypeOptions } from './type-input';
import { updateSubjectOptions } from './subject-select';
import { updateStudyOptions } from './study-select';
import { updateGlassRooms } from './glass-rooms-input';
import { checkFull } from './capacity-validation';
import { getState } from './state.js';
 /**
  *  Responds to a change in the Period field 
  * */
 export const periodChangeHandler = () => {
   updateTypeOptions();
   updateSubjectOptions();
   updateStudyOptions();
   updateGlassRooms();
   checkFull();
 }

 /**
  * Updates the Periods select box based on the date 
  * */
 export const updatePeriodOptions = () => {
   // remembers current selection. If this period is available in the new list,
   const oldPeriodVal = dom.valueOf("#period");
   const dateVal = dom.valueOf("#date");
   if (dateVal === "") return;
   const date = parseDateInput(dateVal);
 
   // clear previous options
   dom.clearOptions("#period");
   
   const dailySchedules = getState().dailySchedules;
   // cycles through daily schedules...
   dailySchedules.forEach(schedule => {
     const schedDate = new Date(schedule.date);
 
     // for a matching date, creates an option for each period
     if (isSameDate(schedDate, date)) {
       schedule.periods.forEach(period => {
         const option = document.createElement("option");
         option.value = period;
         option.textContent = period;
         dom.appendOption("#period", period, period);
       })
     }
   })
 
   // console.log(date, wednesdayInterventions(date));
   if (wednesdayInterventions(date)) {
     dom.appendOption("#period", "Wed. PM", "Wed. PM");
   }
 
   // reselects the previously selected period, if possible
   if (oldPeriodVal !== null) {
     dom.setValue("#period", oldPeriodVal);
   } else {
     dom.setValue("#period", dom.valueOf("#period option") || "");
   }
 }

 /**
 * Determines if the Wednesday Interventions is active and should be shown.
 * 
 * param {Date} - the date to show
 * return {boolean} - True is should be shown
 */
function wednesdayInterventions(date) {
  const wednesday = 3;
  const weekday = date.getDay();
  const dateIsWednesday = (weekday === wednesday);
  const wedIntActive = dom.valueOf("#wed-int-active") === "true";

  // console.log("Wed Int - returning "+ (dateIsWednesday && wedIntActive));
  return dateIsWednesday && wedIntActive;
}
 
 