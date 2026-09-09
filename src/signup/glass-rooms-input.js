import * as dom from './dom.js';
import { parseDateInput, isSameDate } from "./dates.js";
import { getState } from "./state.js";


/**
 *  Updates the Glass Room labels if the rooms are already reserved or not 
 * */
export const updateGlassRooms = () => {
  // marks rooms as available by default
  dom.setVisible("#glass-room-1", true);
  dom.setVisible("#glass-room-2", true);
  dom.setDisabled("#glass-room-1", false);
  dom.setDisabled("#glass-room-2", false);
  dom.setText("#glass-room-1-label .availability", "Available");
  dom.setText("#glass-room-2-label .availability", "Available");

  // returns if date or period are blank
  const dateStr = dom.valueOf("#date");
  if (dateStr.length === 0) {
    return;
  }
  const date = parseDateInput(dateStr);
  
  // const date = new Date();
  // date.setFullYear(
  //   parseInt(dateStr.split('-')[0]),
  //   parseInt(dateStr.split('-')[1]) - 1,
  //   parseInt(dateStr.split('-')[2])
  // );
  // date.setHours(0, 0, 0, 0); // Midnight in local timezone

  const period = dom.valueOf("#period");
  if (typeof period === "undefined") {
    return;
  }

  const signups = getState().signups;
  // cycles through signup data
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

      // unchecks the checkbox
      dom.setChecked(`#glass-room-${room}`, false);

      // updates the label
      dom.setText(`#glass-room-${room}-label .availability`, "Unavailable");
    } 
  });
}