import { describe, it, expect, vi, beforeEach } from 'vitest';
import { periodChangeHandler, updatePeriodOptions, setupPeriodObservers } from '../../client/attendance/period-select';
import * as dom from '../../client/common/dom';
import { store } from '../../client/attendance/attendance-store';

vi.mock('../../client/common/dom', () => ({
  valueOf: vi.fn(),
  clearOptions: vi.fn(),
  appendOption: vi.fn(),
  qs: vi.fn().mockReturnValue({ options: [{ value: '1' }] }),
  setValue: vi.fn(),
}));

vi.mock('../../client/attendance/attendance-store', () => ({
  store: {
    setState: vi.fn(),
    getState: vi.fn().mockReturnValue({ ui_currentPeriod: '1', appConfig: { wedInt: true } }),
    subscribe: vi.fn(),
  },
}));

describe('Period Select Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('periodChangeHandler', () => {
    it('updates store with selected period', () => {
      dom.valueOf.mockReturnValue('2');
      periodChangeHandler();
      expect(store.setState).toHaveBeenCalledWith({ ui_currentPeriod: '2' });
    });
  });

  describe('updatePeriodOptions', () => {
    it('clears and populates period options based on schedule', () => {
      const date = new Date('2023-10-15');
      const schedules = [{ date, period: '1' }, { date, period: '2' }];
      updatePeriodOptions(date, schedules);
      expect(dom.clearOptions).toHaveBeenCalledWith('#period');
      expect(dom.appendOption).toHaveBeenCalledWith('#period', '1', 'Period 1');
      expect(dom.appendOption).toHaveBeenCalledWith('#period', '2', 'Period 2');
    });
  });

  describe('setupPeriodObservers', () => {
    it('subscribes to date, schedules and period changes', () => {
      setupPeriodObservers();
      expect(store.subscribe).toHaveBeenCalledTimes(2);
    });
  });
});
