import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  periodChangeHandler, 
  updatePeriodOptions, 
  setupPeriodOptionsObserver, 
  setupPeriodValueObserver 
} from '../../client/signup/period-select.js';
import * as dom from '../../client/common/dom.js';
import * as dates from '../../client/common/dates.ts';
import { store } from '../../client/common/store.js';

// Mock dependencies
vi.mock('../../client/common/dom.js', () => ({
  valueOf: vi.fn(),
  clearOptions: vi.fn(),
  appendOption: vi.fn(),
  qs: vi.fn(),
  setValue: vi.fn(),
}));

vi.mock('../../client/common/dates.ts', () => ({
  parseDateInput: vi.fn(d => new Date(d)),
  isSameDate: vi.fn((d1, d2) => d1.toDateString() === d2.toDateString()),
}));

vi.mock('../../client/common/store.js', () => ({
  store: { 
    setState: vi.fn(),
    subscribe: vi.fn() 
  }
}));

/**
 * Test suite for the Period Select Module.
 * Contains tests for period options generation and state observation.
 */
describe('Period Select Module', () => {
  beforeEach(() => {
    // Clear all mock history to ensure test isolation
    vi.clearAllMocks();
  });

  /**
   * Tests for the periodChangeHandler function.
   * Verifies that period changes are properly dispatched to the store.
   */
  describe('periodChangeHandler', () => {
    afterEach(() => {
      delete global.event;
    });

    it('should update the store with the newly selected period', () => {
      // Note: periodChangeHandler expects a global event object in the source
      const event = { target: { value: '2' } };
      
      periodChangeHandler(event);
      
      expect(store.setState).toHaveBeenCalledWith({ currentPeriod: '2' });
    });
  });

  /**
   * Tests for the updatePeriodOptions function.
   * Ensures the correct period options are available based on the selected date.
   */
  describe('updatePeriodOptions', () => {
    it('should return early if currentDateStr is missing', () => {
      updatePeriodOptions(null, []);
      expect(dom.clearOptions).not.toHaveBeenCalled();
    });

    it('should populate options based on matching dailySchedules and select the first available if old value is invalid', () => {
      dom.valueOf.mockImplementation(selector => selector === '#period' ? '99' : 'false');
      dom.qs.mockReturnValue({ options: [{ value: '1' }, { value: '2' }] });
      
      const schedules = [{
        date: '2023-10-02', // Monday
        periods: ['1', '2']
      }];

      updatePeriodOptions('2023-10-02', schedules);

      expect(dom.clearOptions).toHaveBeenCalledWith('#period');
      expect(dom.appendOption).toHaveBeenCalledWith('#period', '1', '1');
      expect(dom.appendOption).toHaveBeenCalledWith('#period', '2', '2');
      expect(dom.setValue).toHaveBeenCalledWith('#period', '1'); // '99' wasn't in options
    });

    it('should append Wed. PM option if the date is Wednesday and #wed-int-active is true', () => {
      // 2023-10-04 is a Wednesday
      dates.parseDateInput.mockReturnValue(new Date('2023-10-04T12:00:00Z'));
      dom.valueOf.mockImplementation(selector => selector === '#wed-int-active' ? 'true' : null);
      dom.qs.mockReturnValue({ options: [{ value: 'Wed. PM' }] });

      updatePeriodOptions('2023-10-04', []);

      expect(dom.appendOption).toHaveBeenCalledWith('#period', 'Wed. PM', 'Wed. PM');
    });

    it('should retain the previously selected period if it still exists in the new options', () => {
      dom.valueOf.mockImplementation(selector => selector === '#period' ? '3' : 'false');
      dom.qs.mockReturnValue({ options: [{ value: '1' }, { value: '3' }] });
      
      updatePeriodOptions('2023-10-02', []);

      expect(dom.setValue).toHaveBeenCalledWith('#period', '3');
    });
  });

  /**
   * Tests for the setupPeriodOptionsObserver function.
   * Ensures the observer is properly registered to track date and schedule changes.
   */
  describe('setupPeriodOptionsObserver', () => {
    it('should subscribe to currentDate and dailySchedules', () => {
      setupPeriodOptionsObserver();
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['ui_currentDate', 'dailySchedules']
      );
    });
  });

  /**
   * Tests for the setupPeriodValueObserver function.
   * Verifies that store changes to currentPeriod update the DOM appropriately.
   */
  describe('setupPeriodValueObserver', () => {
    it('should subscribe to currentPeriod and update DOM if values differ', () => {
      setupPeriodValueObserver();
      const subscriberCallback = store.subscribe.mock.calls[0][0];

      dom.qs.mockReturnValue({ value: '1' });
      
      // Simulate state update
      subscriberCallback({ currentPeriod: '2' });

      expect(dom.setValue).toHaveBeenCalledWith('#period', '2');
    });

    it('should not update DOM if the select element value already matches state', () => {
      setupPeriodValueObserver();
      const subscriberCallback = store.subscribe.mock.calls[0][0];

      dom.qs.mockReturnValue({ value: '3' });
      
      // Simulate state update
      subscriberCallback({ currentPeriod: '3' });

      expect(dom.setValue).not.toHaveBeenCalled();
    });
  });
});