import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dateChangeHandler, initDateInput, setupDateObserver } from '../../client/attendance/date-input';
import * as dom from '../../client/common/dom';
import * as dates from '../../client/common/dates';
import { store } from '../../client/attendance/attendance-store';

vi.mock('../../client/common/dom', () => ({
  qs: vi.fn(),
  valueOf: vi.fn(),
}));

vi.mock('../../client/common/dates', () => ({
  parseDateInput: vi.fn((val) => new Date(val)),
  toDateInputValue: vi.fn((d) => '2023-10-15'),
}));

vi.mock('../../client/attendance/attendance-store', () => ({
  store: {
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

describe('Date Input Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('dateChangeHandler', () => {
    it('updates store with parsed date', () => {
      dom.valueOf.mockReturnValue('2023-10-15');
      dateChangeHandler();
      expect(dates.parseDateInput).toHaveBeenCalledWith('2023-10-15');
      expect(store.setState).toHaveBeenCalledWith({ ui_currentDate: expect.any(Date) });
    });

    it('does nothing if value is missing', () => {
      dom.valueOf.mockReturnValue('');
      dateChangeHandler();
      expect(store.setState).not.toHaveBeenCalled();
    });
  });

  describe('initDateInput', () => {
    it('configures date input min, max and default value', () => {
      const mockInput = {};
      dom.qs.mockReturnValue(mockInput);
      initDateInput();
      expect(mockInput.type).toBe('date');
      expect(mockInput.min).toBeDefined();
      expect(mockInput.max).toBeDefined();
      expect(mockInput.value).toBe('2023-10-15');
    });
  });

  describe('setupDateObserver', () => {
    it('subscribes to ui_currentDate changes', () => {
      setupDateObserver();
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), ['ui_currentDate']);
    });
  });
});
