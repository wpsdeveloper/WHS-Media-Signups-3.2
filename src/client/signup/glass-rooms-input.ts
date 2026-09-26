import * as dom from '../common/dom';
import { isSameDate } from '../common/dates';
import { SignupState, store } from './signup-store';

export interface GlassRoomAvailability {
  room: string;
  isAvailable: boolean;
  reservedBy?: string;
}

const GLASS_ROOM_IDS = ['1', '2'];

/**
 * Pure calculation: Returns the reservation availability for each glass room
 * for the current schedule block date and period.
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
 */
export const setupGlassRoomsObserver = () => {
  store.subscribe(
    (state: SignupState) => {
      updateGlassRooms(state.ui_currentScheduleBlock, state.signups);
    },
    ['ui_currentScheduleBlock', 'signups']
  );
};
