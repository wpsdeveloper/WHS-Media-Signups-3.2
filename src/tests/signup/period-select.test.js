import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  periodChangeHandler, 
  updatePeriodOptions, 
  setupPeriodObservers
} from '../../client/signup/period-select.js';
import * as dom from '../../client/common/dom.js';
import * as dates from '../../client/common/dates.ts';
import { store } from '../../client/signup/signup-store.js';

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
  isSameDate: vi.fn((d1, d2) => new Date(d1).toDateString() === new Date(d2).toDateString()),
}));

vi.mock('../../client/signup/signup-store.js', () => {
  const store = { 
    setState: vi.fn(),
    subscribe: vi.fn(),
    getState: vi.fn(() => ({ ui_currentPeriod: '1' }))
  };
  return { store };
});

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
      
      expect(store.setState).toHaveBeenCalledWith({ ui_currentPeriod: '2' });
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
        date: new Date('2023-10-02'), // Monday
        period: '1'
      }, {
        date: new Date('2023-10-02'), // Monday
        period: '2'
      }];

      updatePeriodOptions(new Date('2023-10-02'), schedules);

      expect(dom.clearOptions).toHaveBeenCalledWith('#period');
      expect(dom.appendOption).toHaveBeenCalledWith('#period', '1', 'Period 1');
      expect(dom.appendOption).toHaveBeenCalledWith('#period', '2', 'Period 2');
      expect(dom.setValue).toHaveBeenCalledWith('#period', '1'); // '99' wasn't in options
    });

    it('should append Wed. PM option if the date is Wednesday and #wed-int-active is true', () => {
      // 2023-10-04 is a Wednesday
      dates.parseDateInput.mockReturnValue(new Date('2023-10-04T12:00:00Z'));
      dom.valueOf.mockImplementation(selector => selector === '#wed-int-active' ? 'true' : null);
      dom.qs.mockReturnValue({ options: [{ value: 'Wed. PM' }] });

      updatePeriodOptions(new Date('2023-10-04'), [{date: new Date('2023-10-04'), period: 'Wed. PM'}]);

      expect(dom.appendOption).toHaveBeenCalledWith('#period', 'Wed. PM', 'Wed. PM');
    });

    it('should retain the previously selected period if it still exists in the new options', () => {
      dom.valueOf.mockImplementation(selector => selector === '#period' ? '3' : 'false');
      dom.qs.mockReturnValue({ options: [{ value: '1' }, { value: '3' }] });
      
      updatePeriodOptions(new Date('2023-10-02'), []);

      expect(dom.setValue).toHaveBeenCalledWith('#period', '1');
    });
  });

  /**
   * Tests for the setupPeriodObservers function.
   * Ensures the observer is properly registered to track date, schedule, and period changes.
   */
  describe('setupPeriodObservers', () => {
    it('should subscribe to currentDate, dailySchedules, and ui_currentPeriod', () => {
      setupPeriodObservers();
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['ui_currentDate', 'dailySchedules']
      );
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['ui_currentPeriod']
      );
    });

    it('should update DOM if ui_currentPeriod values differ', () => {
      setupPeriodObservers();
      const subscriberCallback = store.subscribe.mock.calls[1][0];

      dom.qs.mockReturnValue({ value: '1' });
      
      // Simulate state update
      subscriberCallback({ ui_currentPeriod: '2' });

      expect(dom.setValue).toHaveBeenCalledWith('#period', '2');
    });

    it('should not update DOM if the select element value already matches state', () => {
      setupPeriodObservers();
      const subscriberCallback = store.subscribe.mock.calls[1][0];

      dom.qs.mockReturnValue({ value: '3' });
      
      // Simulate state update
      subscriberCallback({ ui_currentPeriod: '3' });

      expect(dom.setValue).not.toHaveBeenCalled();
    });
  });
});