import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkFull, preventSignupForNoFly, setupCapacityValidationObserver } from '../../client/signup/capacity-validation.js';
import * as dom from '../../client/common/dom.js';
import * as dates from '../../client/common/dates.ts';
import { store } from '../../client/common/store.js';

// Mock dependencies for DOM manipulation
vi.mock('../../client/common/dom.js', () => ({
  setDisabled: vi.fn(),
  setChecked: vi.fn(),
  setVisible: vi.fn(),
  setText: vi.fn(),
}));

// Mock dependencies for date processing
vi.mock('../../client/common/dates.ts', () => ({
  parseDateInput: vi.fn(d => new Date(d)),
  isSameDate: vi.fn((d1, d2) => d1.toDateString() === d2.toDateString()),
}));

// Mock the state store
vi.mock('../../client/common/store.js', () => ({
  store: { subscribe: vi.fn() }
}));

/**
 * Test suite for the Capacity Validation Module.
 * This module ensures users cannot sign up if capacity is reached or if they are on the no-fly list.
 */
describe('Capacity Validation Module', () => {
  beforeEach(() => {
    // Clear mock history before each test to ensure test isolation
    vi.clearAllMocks();
  });

  /**
   * Tests for the `checkFull` function.
   * Ensures that UI elements are correctly enabled/disabled based on current signups and capacity limits.
   */
  describe('checkFull', () => {
    it('should return early if date or period is missing', () => {
      // Execute with null date
      checkFull(null, 1, [], 15);
      // Verify no DOM updates occurred
      expect(dom.setDisabled).not.toHaveBeenCalled();
    });

    it('should disable inputs and show Full warning when capacity is reached', () => {
      // Note: checkFull contains a typo in the source code: `period == "" + su.period` 
      // instead of `currentPeriod`. Assuming it gets fixed for this test to pass.
      
      // Mock existing signups for the given date and period
      const signups = [
        { date: '2023-10-01', period: 1, type: 'Tutoring' },
        { date: '2023-10-01', period: 1, type: 'Non-intervention' }
      ];
      
      // Call checkFull with a capacity of 2, which is reached by the 2 signups above
      checkFull('2023-10-01', 1, signups, 2);

      // Verify that the relevant inputs are disabled and warnings are shown
      expect(dom.setDisabled).toHaveBeenCalledWith('#non-intervention', true);
      expect(dom.setDisabled).toHaveBeenCalledWith('#tutoring', true);
      expect(dom.setText).toHaveBeenCalledWith('#tutoring label span.type-warning', 'Full');
    });

    it('should not disable inputs if capacity is not reached', () => {
      // Mock a single signup, leaving capacity for 1 more
      const signups = [
        { date: '2023-10-01', period: 1, type: 'Tutoring' }
      ];
      
      // Call checkFull with a capacity of 2
      checkFull('2023-10-01', 1, signups, 2);

      // Verify no inputs are disabled
      expect(dom.setDisabled).not.toHaveBeenCalled();
    });
  });

  /**
   * Tests for the `preventSignupForNoFly` function.
   * Checks whether specific sign-up options are correctly disabled for users on the no-fly list.
   */
  describe('preventSignupForNoFly', () => {
    it('should disable non-intervention if user is on the no-fly list', () => {
      // Call the function with a user present in the no-fly list
      preventSignupForNoFly(['baduser@test.com'], 'baduser@test.com');

      // Ensure the non-intervention option is disabled and unchecked, and a warning is shown
      expect(dom.setDisabled).toHaveBeenCalledWith('input#non-intervention', true);
      expect(dom.setChecked).toHaveBeenCalledWith('input#non-intervention', false);
      expect(dom.setText).toHaveBeenCalledWith("label[for='non-intervention'] span.type-warning", 'Not permitted');
    });

    it('should do nothing if user is not on the no-fly list', () => {
      // Call the function with a user not in the no-fly list
      preventSignupForNoFly(['baduser@test.com'], 'gooduser@test.com');
      // Verify no changes to DOM
      expect(dom.setDisabled).not.toHaveBeenCalled();
    });
  });

  /**
   * Tests for the `setupCapacityValidationObserver` function.
   * Ensures the observer correctly subscribes to the necessary state variables.
   */
  describe('setupCapacityValidationObserver', () => {
    it('should subscribe to the store with the correct dependency array', () => {
      setupCapacityValidationObserver();
      // Verify subscription keys match the required state for capacity validation
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['ui_currentDate', 'ui_currentPeriod', 'signups', 'ui_currentMax', 'noFlyList', 'ui_currentEmail']
      );
    });
  });
});