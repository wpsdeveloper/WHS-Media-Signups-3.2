import * as dom from '../common/dom.js';
import { parseDateInput, isSameDate } from "../common/dates.js";
import { store } from "./store.js";


/**
 *  Updates the Glass Room labels if the rooms are already reserved or not 
 * */
export const updateGlassRooms = (currentDateStr, currentPeriod, signups = []) => {
  // marks rooms as available by default
  dom.setVisible("#glass-room-1", true);
  dom.setVisible("#glass-room-2", true);
  dom.setDisabled("#glass-room-1", false);
  dom.setDisabled("#glass-room-2", false);
  dom.setText("#glass-room-1-label .availability", "Available");
  dom.setText("#glass-room-2-label .availability", "Available");

 // Exit early if missing date or period inputs
  if (!currentDateStr || !currentPeriod) {
    return;
  }

  const date = parseDateInput(currentDateStr);

  // Cycles through signup data to calculate availability  
  signups.forEach(signup => {
    const suDate = new Date(signup.date);
    
    // skips if dates or periods don't match
    if (!isSameDate(suDate, date)) {
      return;
    }
    const suPeriod = "" + signup.period;
    if (suPeriod !== period) {
      return;
    }

    const room = signup.room;
    if ((room >= 1) && (room <= 2)) {
      // disables the checkbox
      dom.setDisabled(`#glass-room-${room}`, true);
      dom.setChecked(`#glass-room-${room}`, false);

      // updates the label
      dom.setText(`#glass-room-${room}-label .availability`, "Unavailable");
    } 
  });
}

/**
 * Subscriber: Listens to state changes and updates Glass Room UI elements automatically.
 */
export const setupGlassRoomsObserver = () => {
  store.subscribe((state) => {
    updateGlassRooms(state.currentDate, state.currentPeriod, state.signups);
  }, ['currentDate', 'currentPeriod', 'signups']);
};