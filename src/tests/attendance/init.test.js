import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as init from '../../client/attendance/init';
import * as dom from '../../client/common/dom';
import * as messaging from '../../client/common/messaging';
import * as dataTable from '../../client/attendance/attendance-data-table';
import { store } from '../../client/attendance/attendance-store';

vi.mock('../../client/common/dom', () => ({
  qs: vi.fn(),
  qsa: vi.fn().mockReturnValue([]),
  valueOf: vi.fn(),
  addEventListener: vi.fn(),
  toggleStaffOnlyViews: vi.fn(),
  toggleEditorOnlyViews: vi.fn(),
  toggleAdminOnlyViews: vi.fn(),
  setVisible: vi.fn(),
  setValue: vi.fn(),
}));

vi.mock('../../client/common/messaging', () => ({
  processError: vi.fn(),
  showLoadingModal: vi.fn(),
  hideLoadingModal: vi.fn(),
}));

vi.mock('../../client/attendance/attendance-data-table', () => ({
  initObservers: vi.fn(),
}));

vi.mock('../../client/attendance/attendance-store', () => ({
  store: {
    setState: vi.fn(),
    getState: vi.fn().mockReturnValue({ isStaff: true, isAdmin: true, isEditor: false }),
    subscribe: vi.fn(),
  },
}));

vi.mock('../../client/common/debug', () => ({
  IS_DEBUG: false,
  getMockData: vi.fn(),
}));

vi.mock('../../client/common/app-config', () => ({
  getAppConfig: vi.fn().mockResolvedValue({ email: 'test@example.com', isStaff: true, isAdmin: true, isEditor: false }),
  updateScriptLinks: vi.fn(),
}));

describe('Attendance Init Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    let successCb = null;
    global.google = {
      script: {
        run: {
          withSuccessHandler: vi.fn().mockImplementation((cb) => {
            successCb = cb;
            return global.google.script.run;
          }),
          withFailureHandler: vi.fn().mockReturnThis(),
          getInitialAttendanceData: vi.fn().mockImplementation(() => {
            if (successCb) {
              successCb(JSON.stringify({ signups: '[]', dailySchedules: '[]' }));
            }
          }),
        },
      },
    };
  });

  describe('initializeApp', () => {
    it('initializes the app successfully', async () => {
      global.google.script.run.withSuccessHandler.mockImplementation((cb) => {
        cb(JSON.stringify({ signups: '[]', dailySchedules: '[]' }));
        return global.google.script.run;
      });

      await init.initializeApp();

      expect(dataTable.initObservers).toHaveBeenCalled();
      expect(messaging.showLoadingModal).toHaveBeenCalled();
      expect(store.setState).toHaveBeenCalled();
      expect(messaging.hideLoadingModal).toHaveBeenCalled();
    });

    it('processes errors during initialization', async () => {
      const error = new Error('Failure');
      dataTable.initObservers.mockImplementation(() => {
        throw error;
      });

      await init.initializeApp();

      expect(messaging.processError).toHaveBeenCalledWith(error, 'Failed to initialize app:');
      expect(messaging.hideLoadingModal).toHaveBeenCalled();
    });
  });
});
