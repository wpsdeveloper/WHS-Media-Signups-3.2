import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as init from '../../client/admin/init';
import * as dom from '../../client/common/dom';
import * as messaging from '../../client/common/messaging';
import * as dataTable from '../../client/admin/admin-data-table';
import * as settingsTable from '../../client/admin/settings-table';
import * as data from '../../client/admin/data';
import * as studentInput from '../../client/admin/student-input';
import { store } from '../../client/admin/admin-store';

vi.mock('../../client/common/dom', () => ({
  qs: vi.fn(),
  qsa: vi.fn().mockReturnValue([]),
  valueOf: vi.fn(),
  addEventListener: vi.fn(),
  toggleEditorOnlyViews: vi.fn(),
  setVisible: vi.fn(),
  setValue: vi.fn(),
}));

vi.mock('../../client/common/messaging', () => ({
  processError: vi.fn(),
  showLoadingModal: vi.fn(),
  hideLoadingModal: vi.fn(),
}));

vi.mock('../../client/admin/admin-data-table', () => ({
  initObservers: vi.fn(),
}));

vi.mock('../../client/admin/settings-table', () => ({
  initObservers: vi.fn(),
}));

vi.mock('../../client/admin/data', () => ({
  setupAuditObserver: vi.fn(),
}));

vi.mock('../../client/admin/student-input', () => ({
  setupStudentInputObserver: vi.fn(),
}));

vi.mock('../../client/admin/admin-store', () => ({
  store: {
    setState: vi.fn(),
    getState: vi.fn().mockReturnValue({ isStaff: true, isAdmin: true, isEditor: false }),
    subscribe: vi.fn(),
  },
}));

vi.mock('../../client/common/debug', () => ({
  IS_DEBUG: false,
}));

vi.mock('../../client/common/app-config', () => ({
  getAppConfig: vi.fn().mockResolvedValue({ email: 'test@example.com', isStaff: true, isAdmin: true, isEditor: false, scriptUrl: 'http://script.com' }),
  updateScriptLinks: vi.fn(),
}));

describe('Admin Init Module', () => {
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
          getInitialAdminData: vi.fn().mockImplementation(() => {
            if (successCb) {
              successCb(JSON.stringify({ students: '[]', signups: '[]', settings: '[]', dailySchedules: '[]' }));
            }
          }),
        },
      },
    };
  });

  describe('initializeApp', () => {
    it('initializes the app successfully', async () => {
      global.google.script.run.withSuccessHandler.mockImplementation((cb) => {
        cb(JSON.stringify({ students: '[]', signups: '[]', settings: '[]', dailySchedules: '[]' }));
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
