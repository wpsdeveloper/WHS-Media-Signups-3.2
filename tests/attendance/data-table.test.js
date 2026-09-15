import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as dataTable from '../../src/attendance/data-table.js';
import * as dom from '../../src/common/dom.js';
import * as dates from '../../src/common/dates.js';
import { store } from '../../src/common/store.js';
import * as messaging from '../../src/common/messaging.js';
import { DataRow } from '../../src/attendance/data-row.js';

vi.mock('../../src/common/dom.js', () => ({
  qs: vi.fn(),
  qsa: vi.fn(),
  clearOptions: vi.fn(),
  appendOption: vi.fn(),
  setValue: vi.fn(),
  valueOf: vi.fn(),
  setVisible: vi.fn(),
  setText: vi.fn(),
}));

vi.mock('../../src/common/dates.js', () => ({
  parseDateInput: vi.fn(),
  isSameDate: vi.fn(),
}));

vi.mock('../../src/common/store.js', () => ({
  store: {
    subscribe: vi.fn(),
    getState: vi.fn(),
    setState: vi.fn(),
  },
}));

vi.mock('../../src/common/messaging.js', () => ({
  processError: vi.fn(),
}));

vi.mock('../../src/attendance/data-row.js', () => ({
  DataRow: vi.fn().mockImplementation(() => ({
    element: { classList: { toggle: vi.fn() } },
    populate: vi.fn(),
  })),
}));

describe('data-table.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Event Handlers', () => {
    it('dateChangeHandler updates the store with the new date', () => {
      dom.valueOf.mockReturnValue('2023-10-15');
      store.getState.mockReturnValue({ currentDatePeriod: { date: 'old', period: '1' } });
      
      dataTable.dateChangeHandler();
      
      expect(store.setState).toHaveBeenCalledWith({
        currentDatePeriod: { date: '2023-10-15', period: '1' }
      });
    });

    it('periodChangeHandler updates the store with the new period', () => {
      dom.valueOf.mockReturnValue('2');
      store.getState.mockReturnValue({ currentDatePeriod: { date: '2023-10-15', period: '1' } });
      
      dataTable.periodChangeHandler();
      
      expect(store.setState).toHaveBeenCalledWith({
        currentDatePeriod: { date: '2023-10-15', period: '2' }
      });
    });

    it('resort toggles sort order for the same field', () => {
      store.getState.mockReturnValue({ currentSort: { field: 'student', order: 'asc' } });
      dataTable.resort('student');
      expect(store.setState).toHaveBeenCalledWith({ currentSort: { field: 'student', order: 'desc' } });
    });

    it('resort sets asc for a new field', () => {
      store.getState.mockReturnValue({ currentSort: { field: 'student', order: 'desc' } });
      dataTable.resort('teacher');
      expect(store.setState).toHaveBeenCalledWith({ currentSort: { field: 'teacher', order: 'asc' } });
    });
  });

  describe('sortSignups', () => {
    const signups = [
      { lastname: 'Zebra', teacherStudy: 'Apple' },
      { lastname: 'Aardvark', teacherStudy: 'Banana' },
    ];

    it('sorts by student ascending', () => {
      const result = dataTable.sortSignups(signups, 'student', 'asc');
      expect(result[0].lastname).toBe('Aardvark');
    });

    it('sorts by teacherStudy descending', () => {
      const result = dataTable.sortSignups(signups, 'study', 'desc');
      expect(result[0].teacherStudy).toBe('Banana');
    });
  });

  describe('UI Toggles', () => {
    it('showAttendance updates styling and visibility', () => {
      const mockPanel = { style: {} };
      dom.qsa.mockReturnValue([mockPanel]);
      
      dataTable.showAttendance();
      
      expect(mockPanel.style.transform).toBe('translate(0, 0)');
      expect(dom.setVisible).toHaveBeenCalledTimes(2);
    });

    it('showSignupInfo updates styling and visibility based on header width', () => {
      const mockPanel = { style: {} };
      const mockHeader = { getBoundingClientRect: () => ({ width: 124 }) };
      
      dom.qsa.mockReturnValue([mockPanel]);
      dom.qs.mockImplementation((selector) => {
        if (selector.includes('attendance-info')) return mockHeader;
        return {};
      });

      dataTable.showSignupInfo();
      
      expect(mockPanel.style.transform).toBe('translate(-100px, 0)'); // 124 - 24
      expect(dom.setVisible).toHaveBeenCalledTimes(2);
    });
  });

  describe('initObservers', () => {
    it('registers 4 subscribers', () => {
      dataTable.initObservers();
      expect(store.subscribe).toHaveBeenCalledTimes(4);
    });
  });
});