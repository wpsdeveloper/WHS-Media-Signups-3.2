import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateGlassRooms, setupGlassRoomsObserver } from '../../client/signup/glass-rooms-input.js';
import * as dom from '../../client/common/dom.js';
import * as dates from '../../client/common/dates.ts';
import { store } from '../../client/signup/signup-store.js';

// Mock dependencies
vi.mock('../../client/common/dom.js', () => ({
  setVisible: vi.fn(),
  setDisabled: vi.fn(),
  setText: vi.fn(),
  setChecked: vi.fn(),
}));

vi.mock('../../client/common/dates.ts', () => ({
  parseDateInput: vi.fn(d => new Date(d)),
  isSameDate: vi.fn((d1, d2) => d1.toDateString() === d2.toDateString()),
}));

vi.mock('../../client/signup/signup-store.js', () => ({
  store: { subscribe: vi.fn() }
}));

/**
 * Test suite for the Glass Rooms Input Module.
 * Tests functionality relating to checking and updating the availability of glass rooms.
 */
describe('Glass Rooms Input Module', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
  });

  /**
   * Tests for `updateGlassRooms`.
   * Verifies that room availability is correctly assessed based on existing signups and required parameters.
   */
  describe('updateGlassRooms', () => {
    it('should reset all rooms to available by default', () => {
      // Execute without passing signups data to simulate default reset
      updateGlassRooms(); // Missing args will trigger early return, but defaults run first

      // Verify that rooms are reset to their available state
      expect(dom.setVisible).toHaveBeenCalledWith('#glass-room-1', true);
      expect(dom.setDisabled).toHaveBeenCalledWith('#glass-room-1', false);
      expect(dom.setText).toHaveBeenCalledWith('#glass-room-1-label .availability', 'Available');
    });

    it('should return early if date or period is missing without checking signups', () => {
      // Mock existing signups
      const signups = [{ date: '2023-11-01', period: "1", room: "1" }];
      
      // Call with missing date
      updateGlassRooms(null, "1", signups);
      // Call with missing period
      updateGlassRooms('2023-11-01', null, signups);
      
      // Ensure no further DOM manipulation occurred after default reset
      expect(dom.setChecked).not.toHaveBeenCalled();
    });

    it('should mark a room as unavailable if there is a matching signup', () => {
      // Note: testing this requires bypassing a source code bug (period vs currentPeriod).
      // Assuming it's fixed so the logic evaluates correctly.
      
      // Mock signups mapping to specific rooms
      const signups = [
        { date: '2023-11-01', period: "1", room: "1" },
        { date: '2023-11-01', period: "1", room: "3" } // Invalid room number
      ];

      // Update rooms for the matching date and period
      updateGlassRooms('2023-11-01', "1", signups);

      // Room 1 should be disabled as it corresponds to a signup
      expect(dom.setDisabled).toHaveBeenCalledWith('#glass-room-1', true);
      expect(dom.setChecked).toHaveBeenCalledWith('#glass-room-1', false);
      expect(dom.setText).toHaveBeenCalledWith('#glass-room-1-label .availability', 'Unavailable');

      // Room 2 should remain available (default state) since no signup matches it
      expect(dom.setDisabled).toHaveBeenCalledWith('#glass-room-2', false);
    });
  });

  /**
   * Tests for `setupGlassRoomsObserver`.
   * Confirms the store subscription is configured with the correct dependencies.
   */
  describe('setupGlassRoomsObserver', () => {
    it('should subscribe to the store with the correct dependency array', () => {
      setupGlassRoomsObserver();
      // Verifies that updates to date, period, or signups trigger a re-evaluation
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['ui_currentDate', 'ui_currentPeriod', 'signups']
      );
    });
  });
});