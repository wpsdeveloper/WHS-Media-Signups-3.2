import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as init from '../../client/attendance/init.js';
import * as dom from '../../client/common/dom.js';
import * as messaging from '../../client/common/messaging.js';
import * as dataTable from '../../client/attendance/data-table.js';
import { store } from '../../client/common/store.js';

vi.mock('../../client/common/dom.js', () => ({
  qs: vi.fn(),
  valueOf: vi.fn(),
  addEventListener: vi.fn(),
  toggleEditorOnlyViews: vi.fn(),
  toggleAdminOnlyViews: vi.fn(),
  setVisible: vi.fn(),
  setValue: vi.fn(),
}));

vi.mock('../../client/common/messaging.js', () => ({
  processError: vi.fn(),
  showLoadingModal: vi.fn(),
  hideLoadingModal: vi.fn(),
}));

vi.mock('../../client/attendance/data-table.js', () => ({
  initObservers: vi.fn(),
  dateChangeHandler: vi.fn(),
  periodChangeHandler: vi.fn(),
  showAttendance: vi.fn(),
  showSignupInfo: vi.fn(),
}));

vi.mock('../../client/common/store.js', () => ({
  store: {
    setState: vi.fn(),
    getState: vi.fn(),
    initialize: vi.fn(),
  },
}));

vi.mock('../../client/common/debug.js', () => ({
  DEBUG: true
}));

describe('init.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.google = {
      script: {
        run: {
          withSuccessHandler: vi.fn().mockReturnThis(),
          withFailureHandler: vi.fn().mockReturnThis(),
          getInitialAttendanceData: vi.fn(),
        },
      },
    };
  });

  describe('initializeApp', () => {
    it('initializes the app and binds events successfully', async () => {
      // Mock getServerData's internal GAS call to immediately resolve
      global.google.script.run.withSuccessHandler.mockImplementation((cb) => {
        cb({ signups: '[]', dailySchedules: '[]' });
        return global.google.script.run;
      });

      dom.valueOf.mockReturnValue('true'); // Mock isAdmin/isEditor
      dom.qs.mockReturnValue({ value: '2023-10-15' }); // Mock date input

      await init.initializeApp();

      expect(dataTable.initObservers).toHaveBeenCalled();
      expect(dom.addEventListener).toHaveBeenCalledTimes(5);
      expect(messaging.showLoadingModal).toHaveBeenCalled();
      expect(store.setState).toHaveBeenCalled();
      expect(messaging.hideLoadingModal).toHaveBeenCalled();
    });

    it('catches and processes errors during initialization', async () => {
      const error = new Error('Network failure');
      dataTable.initObservers.mockImplementation(() => {
        throw error;
      });

      await init.initializeApp();

      expect(messaging.processError).toHaveBeenCalledWith(error, 'Failed to initialize app:');
      expect(messaging.hideLoadingModal).toHaveBeenCalled();
    });
  });

  describe('refreshData', () => {
    it('fetches data, updates the store, and toggles views', async () => {
      // Mock HTML input element with date type and value
      const dateInput = document.createElement('input');
      dateInput.type = 'date';
      dateInput.value = '2023-10-15';
      
      dom.valueOf.mockImplementation((selector) => {
        if (selector === '#is-admin') return 'true';
        if (selector === '#is-editor') return 'false';
        if (selector === '#date') return dateInput.value;
        if (selector === '.admin-only') return adminOnlyEl;
        if (selector === '.editors-only') return editorsOnlyEl;
        return null;
      });

      await init.refreshData();

      expect(store.setState).toHaveBeenCalled();

      expect(dom.toggleEditorOnlyViews).toHaveBeenCalledWith(false);
      expect(dom.toggleAdminOnlyViews).toHaveBeenCalledWith(true);
    });
  });
});