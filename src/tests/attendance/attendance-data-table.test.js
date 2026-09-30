import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initObservers, renderTable, resort } from '../../client/attendance/attendance-data-table';
import * as dom from '../../client/common/dom';
import { store } from '../../client/attendance/attendance-store';

vi.mock('../../client/common/dom', () => ({
  qs: vi.fn(),
  qsa: vi.fn().mockReturnValue([]),
  setVisible: vi.fn(),
}));

vi.mock('../../client/attendance/attendance-store', () => ({
  store: {
    subscribe: vi.fn(),
    getState: vi.fn().mockReturnValue({ ui_currentSortField: 'student', ui_currentSortOrder: 'asc' }),
    setState: vi.fn(),
  },
}));

vi.mock('../../client/attendance/attendance-panels', () => ({
  setPanelView: vi.fn(),
}));

describe('Attendance Data Table Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initObservers', () => {
    it('subscribes to store state changes', () => {
      initObservers();
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), expect.any(Array));
    });
  });

  describe('resort', () => {
    it('toggles sort order if same field', () => {
      resort('student');
      expect(store.setState).toHaveBeenCalledWith({ ui_currentSortField: 'student', ui_currentSortOrder: 'desc' });
    });

    it('sets asc order for new field', () => {
      resort('study');
      expect(store.setState).toHaveBeenCalledWith({ ui_currentSortField: 'study', ui_currentSortOrder: 'asc' });
    });
  });

  describe('renderTable', () => {
    it('shows empty states if date or period missing', () => {
      const state = { ui_currentDate: null, ui_currentPeriod: null, signups: [] };
      renderTable(state);
      expect(dom.setVisible).toHaveBeenCalledWith('.student-row-empty', true);
      expect(dom.setVisible).toHaveBeenCalledWith('.staff-row-empty', true);
    });
  });
});
