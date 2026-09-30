import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGlassRoomReservations, updateGlassRooms, getRoomBadge, setupGlassRoomsObserver } from '../../client/attendance/glass-rooms-status';
import * as dom from '../../client/common/dom';
import { store } from '../../client/attendance/attendance-store';

vi.mock('../../client/common/dom', () => ({
  qs: vi.fn().mockReturnValue({
    classList: { add: vi.fn(), remove: vi.fn() }
  }),
  setText: vi.fn(),
}));

vi.mock('../../client/attendance/attendance-store', () => ({
  store: {
    subscribe: vi.fn(),
  },
}));

describe('Glass Rooms Status Module', () => {
  const date = new Date('2023-10-15');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGlassRoomReservations', () => {
    it('returns unbooked rooms when no signups match', () => {
      const res = getGlassRoomReservations([], date, '1');
      expect(res['1'].isBooked).toBe(false);
      expect(res['2'].isBooked).toBe(false);
    });

    it('returns booked rooms when signup matches room, date and period', () => {
      const signups = [{ room: '1', date, period: '1', lastname: 'Doe', firstname: 'John' }];
      const res = getGlassRoomReservations(signups, date, '1');
      expect(res['1'].isBooked).toBe(true);
      expect(res['1'].reservedBy).toBe('Doe, John');
    });
  });

  describe('getRoomBadge', () => {
    it('returns correct badge HTML for room 1 or 2', () => {
      expect(getRoomBadge('1')).toContain('Room 1');
      expect(getRoomBadge('2')).toContain('Room 2');
      expect(getRoomBadge('3')).toBe('');
    });
  });

  describe('setupGlassRoomsObserver', () => {
    it('subscribes to date, period, and signups', () => {
      setupGlassRoomsObserver();
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), ['ui_currentDate', 'ui_currentPeriod', 'signups']);
    });
  });
});
