import * as dom from '../common/dom';
import { parseDateInput, isSameDate } from "../common/dates";
import { AttendanceState, store } from './attendance-store';


/**
 *  Updates the Glass Room labels if the rooms are already reserved or not 
 * */
export const updateGlassRooms = (
  currentDate: Date | null, 
  currentPeriod: Period | null,
  signups: Signup[] = []
) => {
  // marks rooms as available by default
  dom.setText("#glass-rooms-status .status", " ");
  dom.qs("#glass-rooms-status room")?.classList.add('available');
  dom.qs("#glass-rooms-status room")?.classList.remove('booked');
  
  // Exit early if missing date or period inputs
  if (!currentDate || !currentPeriod ) {
    return;
  }
    
  // Cycles through signup data to calculate availability  
  const matchingSignups = signups.filter( su =>
    isSameDate(su.date, currentDate)
    && (su.period === currentPeriod)
  );
  
  if (matchingSignups.length === 0) {
    return;
  }

  dom.setText("#glass-rooms-status .status", "Available");

  matchingSignups.forEach(signup => {
    const room = signup.room;
    if (room) {
      // updates the label
      const name = `${signup.lastname}, ${signup.firstname}`;
      dom.setText(`#glass-rooms-status .room-${room} .status`, name);
      dom.qs(`#glass-rooms-status .room-${room}`)?.classList.add('booked');
    } 
  });
}


export const getRoomBadge = (room: Signup['room']) => {
  const roomNum = String(room);
  if (roomNum === '1') {
    return ` <span class="badge text-bg-success room-badge">Room 1</span>`;
  }
  if (roomNum === '2') {
    return ` <span class="badge text-bg-danger room-badge">Room 2</span>`;
  }
  return '';
}


/**
 * Subscriber: Listens to state changes and updates Glass Room UI elements automatically.
 */
export const setupGlassRoomsObserver = () => {
  store.subscribe((state: AttendanceState) => {
    updateGlassRooms(state.ui_currentDate, state.ui_currentPeriod, state.signups);
  }, ['currentDate', 'currentPeriod' , 'signups']);
};