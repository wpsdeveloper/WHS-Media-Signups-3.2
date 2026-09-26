import * as dom from "../common/dom";
import { isSameDate } from "../common/dates";
import { AttendanceState, store } from "./attendance-store";

export interface RoomReservation {
  room: string;
  isBooked: boolean;
  reservedBy?: string;
}

const GLASS_ROOM_IDS = ["1", "2"];

/**
 * Pure calculation: Returns the reservation status for each glass room.
 */
export function getGlassRoomReservations(
  signups: Signup[] = [],
  currentDate: Date | null,
  currentPeriod: Period | null
): Record<string, RoomReservation> {
  const result: Record<string, RoomReservation> = {};
  for (const roomId of GLASS_ROOM_IDS) {
    result[roomId] = { room: roomId, isBooked: false };
  }

  if (!currentDate || !currentPeriod) {
    return result;
  }

  const matchingSignups = signups.filter(
    (su) => su.room && isSameDate(su.date, currentDate) && su.period === currentPeriod
  );

  for (const signup of matchingSignups) {
    if (signup.room && result[signup.room]) {
      result[signup.room] = {
        room: signup.room,
        isBooked: true,
        reservedBy: `${signup.lastname}, ${signup.firstname}`,
      };
    }
  }

  return result;
}

/**
 * Updates the Glass Room DOM widget based on current date, period, and signups.
 */
export const updateGlassRooms = (
  currentDate: Date | null,
  currentPeriod: Period | null,
  signups: Signup[] = []
) => {
  const reservations = getGlassRoomReservations(signups, currentDate, currentPeriod);

  for (const roomId of GLASS_ROOM_IDS) {
    const reservation = reservations[roomId];
    const roomEl = dom.qs(`#glass-rooms-status .room-${roomId}`);
    if (!roomEl) continue;

    if (reservation.isBooked && reservation.reservedBy) {
      roomEl.classList.add("booked");
      roomEl.classList.remove("available");
      dom.setText(`#glass-rooms-status .room-${roomId} .status`, reservation.reservedBy);
    } else {
      roomEl.classList.add("available");
      roomEl.classList.remove("booked");
      dom.setText(
        `#glass-rooms-status .room-${roomId} .status`,
        currentDate && currentPeriod ? "Available" : ""
      );
    }
  }
};

/**
 * Generates badge HTML for table rows indicating which glass room is assigned.
 */
export const getRoomBadge = (room: string): string => {
  if (room === "1") {
    return ` <span class="badge text-bg-success room-badge">Room 1</span>`;
  }
  if (room === "2") {
    return ` <span class="badge text-bg-danger room-badge">Room 2</span>`;
  }
  return "";
};

/**
 * Subscriber: Listens to state changes and updates Glass Room UI elements automatically.
 */
export const setupGlassRoomsObserver = () => {
  store.subscribe(
    (state: AttendanceState) => {
      updateGlassRooms(state.ui_currentDate, state.ui_currentPeriod, state.signups);
    },
    ["ui_currentDate", "ui_currentPeriod", "signups"]
  );
};
