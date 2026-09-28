import * as dom from '../common/dom';
import { isSameDate } from '../common/dates';
import { SignupState, store } from './signup-store';

/**
 * Interface representing the reservation status of a glass room.
 */
export interface GlassRoomAvailability {
  /** Room identifier (e.g., '1', '2') */
  room: string;
  /** Whether the glass room is available for reservation */
  isAvailable: boolean;
  /** Name of the student or staff member who reserved the room if unavailable */
  reservedBy?: string;
}

const GLASS_ROOM_IDS = ['1', '2'];

/**
 * Pure calculation: Returns the reservation availability for each glass room
 * for the current schedule block date and period.
 * 
 * @param currentScheduleBlock - The active daily schedule block, or null.
 * @param signups - Array of existing signup records.
 * @returns A record mapping room IDs to their respective GlassRoomAvailability status.
 */
export function getGlassRoomAvailability(
  currentScheduleBlock: DailyBlock | null,
  signups: Signup[] = []
): Record<string, GlassRoomAvailability> {
  const result: Record<string, GlassRoomAvailability> = {};
  for (const roomId of GLASS_ROOM_IDS) {
    result[roomId] = { room: roomId, isAvailable: true };
  }

  if (!currentScheduleBlock) {
    return result;
  }

  const matchingSignups = signups.filter(
    (su) =>
      su.room &&
      isSameDate(su.date, currentScheduleBlock.date) &&
      su.period === currentScheduleBlock.period
  );

  for (const su of matchingSignups) {
    if (su.room && result[su.room]) {
      result[su.room] = {
        room: su.room,
        isAvailable: false,
        reservedBy: `${su.lastname}, ${su.firstname}`,
      };
    }
  }

  return result;
}

/**
 * DOM View: Updates radio button disabled states and availability labels.
 * 
 * @param availabilityMap - Record mapping room IDs to GlassRoomAvailability status.
 */
export function updateGlassRoomsUi(availabilityMap: Record<string, GlassRoomAvailability>) {
  for (const roomId of GLASS_ROOM_IDS) {
    const item = availabilityMap[roomId];
    const radioSelector = `#glass-room-${roomId}`;
    const labelAvailabilitySelector = `#glass-room-${roomId}-label .availability`;

    dom.setVisible(radioSelector, true);

    if (item && !item.isAvailable) {
      dom.setDisabled(radioSelector, true);
      // Uncheck if currently selected room became booked
      if (dom.isChecked(radioSelector)) {
        dom.setChecked(radioSelector, false);
        dom.setChecked('#glass-room-none', true);
      }
      dom.setText(labelAvailabilitySelector, 'Unavailable');
    } else {
      dom.setDisabled(radioSelector, false);
      dom.setText(labelAvailabilitySelector, 'Available');
    }
  }
}

/**
 * Orchestrator: Computes glass room availability and updates UI.
 * 
 * @param currentScheduleBlock - The active daily schedule block or null.
 * @param signups - Array of active signups.
 */
export const updateGlassRooms = (
  currentScheduleBlock: DailyBlock | null,
  signups: Signup[] = []
) => {
  const availability = getGlassRoomAvailability(currentScheduleBlock, signups);
  updateGlassRoomsUi(availability);
};

/**
 * Direct setter: Selects a specific glass room directly (used during edit / update mode).
 * 
 * @param room - Room identifier string or null to clear selection.
 */
export const directSet = (room: string | null) => {
  if (!room) {
    dom.setChecked('#glass-room-none', true);
    return;
  }
  dom.setDisabled(`#glass-room-${room}`, false);
  dom.setChecked(`#glass-room-${room}`, true);
  dom.setText(`#glass-room-${room}-label .availability`, 'Current');
};

/**
 * Subscriber: Listens to state changes and updates Glass Room UI elements automatically.
 * Registers store observer for schedule block and signup changes.
 */
export const setupGlassRoomsObserver = () => {
  store.subscribe(
    (state: SignupState) => {
      updateGlassRooms(state.ui_currentScheduleBlock, state.signups);
    },
    ['ui_currentScheduleBlock', 'signups']
  );
};
