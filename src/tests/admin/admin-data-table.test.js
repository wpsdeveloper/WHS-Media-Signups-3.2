import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initObservers, renderTable, resort, showAttendance, showSignupInfo } from '../../client/admin/admin-data-table';
import * as dom from '../../client/common/dom';
import { store } from '../../client/admin/admin-store';

vi.mock('../../client/common/dom', () => ({
  qs: vi.fn(),
  qsa: vi.fn().mockReturnValue([]),
  setVisible: vi.fn(),
}));

vi.mock('../../client/admin/admin-store', () => ({
  store: {
    subscribe: vi.fn(),
    getState: vi.fn().mockReturnValue({ ui_currentSortField: 'date', ui_currentSortOrder: 'asc' }),
    setState: vi.fn(),
  },
}));

vi.mock('../../client/admin/admin-panels', () => ({
  setPanelView: vi.fn(),
  panelViewListener: vi.fn(),
}));

describe('Admin Data Table Module', () => {
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
      resort('date');
      expect(store.setState).toHaveBeenCalledWith({ ui_currentSortField: 'date', ui_currentSortOrder: 'desc' });
    });

    it('sets asc order for new field', () => {
      resort('period');
      expect(store.setState).toHaveBeenCalledWith({ ui_currentSortField: 'period', ui_currentSortOrder: 'asc' });
    });
  });

  describe('renderTable', () => {
    it('returns early if requestedStudentEmail is missing', () => {
      const state = { ui_requestedStudentEmail: '', signups: [] };
      renderTable(state);
      expect(dom.qsa).toHaveBeenCalledWith('#student-table .student-row');
    });
  });
});
