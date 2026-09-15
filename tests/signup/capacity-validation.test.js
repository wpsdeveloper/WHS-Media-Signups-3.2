import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkFull, preventSignupForNoFly, setupCapacityValidationObserver } from '../../src/signup/capacity-validation.js';
import * as dom from '../../src/common/dom.js';
import * as dates from '../../src/common/dates.js';
import { store } from '../../src/signup/store.js';

// Mock dependencies
vi.mock('../../src/common/dom.js', () => ({
  setDisabled: vi.fn(),
  setChecked: vi.fn(),
  setVisible: vi.fn(),
  setText: vi.fn(),
}));

vi.mock('../../src/common/dates.js', () => ({
  parseDateInput: vi.fn(d => new Date(d)),
  isSameDate: vi.fn((d1, d2) => d1.toDateString() === d2.toDateString()),
}));

vi.mock('../../src/signup/store.js', () => ({
  store: { subscribe: vi.fn() }
}));

describe('Capacity Validation Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkFull', () => {
    it('should return early if date or period is missing', () => {
      checkFull(null, 1, [], 15);
      expect(dom.setDisabled).not.toHaveBeenCalled();
    });

    it('should disable inputs and show Full warning when capacity is reached', () => {
      // Note: checkFull contains a typo in the source code: `period == "" + su.period` 
      // instead of `currentPeriod`. Assuming it gets fixed for this test to pass.
      const signups = [
        { date: '2023-10-01', period: 1, type: 'Tutoring' },
        { date: '2023-10-01', period: 1, type: 'Non-intervention' }
      ];
      
      checkFull('2023-10-01', 1, signups, 2);

      expect(dom.setDisabled).toHaveBeenCalledWith('#non-intervention', true);
      expect(dom.setDisabled).toHaveBeenCalledWith('#tutoring', true);
      expect(dom.setText).toHaveBeenCalledWith('#tutoring label span.type-warning', 'Full');
    });

    it('should not disable inputs if capacity is not reached', () => {
      const signups = [
        { date: '2023-10-01', period: 1, type: 'Tutoring' }
      ];
      
      checkFull('2023-10-01', 1, signups, 2);

      expect(dom.setDisabled).not.toHaveBeenCalled();
    });
  });

  describe('preventSignupForNoFly', () => {
    it('should disable non-intervention if user is on the no-fly list', () => {
      preventSignupForNoFly(['baduser@test.com'], 'baduser@test.com');

      expect(dom.setDisabled).toHaveBeenCalledWith('input#non-intervention', true);
      expect(dom.setChecked).toHaveBeenCalledWith('input#non-intervention', false);
      expect(dom.setText).toHaveBeenCalledWith("label[for='non-intervention'] span.type-warning", 'Not permitted');
    });

    it('should do nothing if user is not on the no-fly list', () => {
      preventSignupForNoFly(['baduser@test.com'], 'gooduser@test.com');
      expect(dom.setDisabled).not.toHaveBeenCalled();
    });
  });

  describe('setupCapacityValidationObserver', () => {
    it('should subscribe to the store with the correct dependency array', () => {
      setupCapacityValidationObserver();
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['currentDate', 'currentPeriod', 'signups', 'currentMax', 'noFlyList', 'currentEmail']
      );
    });
  });
});