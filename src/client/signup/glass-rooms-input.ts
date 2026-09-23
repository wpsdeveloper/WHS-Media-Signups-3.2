import * as dom from '../common/dom';
import { parseDateInput, isSameDate } from "../common/dates";
import { SignupState, store } from './signup-store';


/**
 *  Updates the Glass Room labels if the rooms are already reserved or not 
 * */
export const updateGlassRooms = (
  currentScheduleBlock: DailyBlock | null, 
  signups: Signup[] = []
) => {
  // marks rooms as available by default
  dom.setVisible("#glass-room-1", true);
  dom.setVisible("#glass-room-2", true);
  dom.setDisabled("#glass-room-1", false);
  dom.setDisabled("#glass-room-2", false);
  dom.setText("#glass-room-1-label .availability", "Available");
  dom.setText("#glass-room-2-label .availability", "Available");

 // Exit early if missing date or period inputs
  if (!currentScheduleBlock) {
    return;
  }

  // Cycles through signup data to calculate availability  
  const matchingSignups = signups.filter( su =>
    isSameDate(su.date, currentScheduleBlock.date)
    && (su.period === currentScheduleBlock.period)
  );

  matchingSignups.forEach(signup => {
    const room = signup.room;
    if (room) {
      // disables the checkbox
      dom.setDisabled(`#glass-room-${room}`, true);
      dom.setChecked(`#glass-room-${room}`, false);

      // updates the label
      dom.setText(`#glass-room-${room}-label .availability`, "Unavailable");
    } 
  });
}

export const directSet = (room: string | null) => {
  dom.setText(`#glass-room-${room}-label .availability`, "");
  dom.setChecked(`#glass-room-${room}`, true);
}

/**
 * Subscriber: Listens to state changes and updates Glass Room UI elements automatically.
 */
export const setupGlassRoomsObserver = () => {
  store.subscribe((state: SignupState) => {
    updateGlassRooms(state.currentScheduleBlock, state.signups);
  }, ['currentScheduleBlock', 'signups']);
};