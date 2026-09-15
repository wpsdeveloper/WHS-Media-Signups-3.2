import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initObservers, initializeApp, initializeUi, setTooltips } from '../../src/admin/init.js';
import * as dom from '../../src/common/dom.js';
import * as messaging from '../../src/common/messaging.js';
import * as parser from '../../src/common/parsers.js';
import * as dataTable from '../../src/admin/data-table.js';
import * as settingsTable from '../../src/admin/settings-table.js';
import * as data from '../../src/admin/data.js';
import * as studentInput from '../../src/common/student-input.js';
import { store } from '../../src/common/store.js';

vi.mock('../../src/common/dom.js', () => ({
  addEventListener: vi.fn(),
  qsa: vi.fn(() => []),
  qs: vi.fn(),
  setValue: vi.fn(),
  valueOf: vi.fn(),
  toggleEditorOnlyViews: vi.fn(),
}));

vi.mock('../../src/common/messaging.js', () => ({
  showLoadingModal: vi.fn(),
  hideLoadingModal: vi.fn(),
  processError: vi.fn(),
}));

vi.mock('../../src/common/parsers.js', () => ({
  parseStudents: vi.fn((x) => x),
  parseStudentNames: vi.fn((x) => x),
  parseSignups: vi.fn((x) => x),
  parseSettings: vi.fn((x) => x),
  parseDailySchedules: vi.fn((x) => x),
}));

vi.mock('../../src/admin/data-table.js', () => ({
  initObservers: vi.fn(),
  showAttendance: vi.fn(),
  showSignupInfo: vi.fn(),
  resort: vi.fn(),
}));

vi.mock('../../src/admin/settings-table.js', () => ({
  initObservers: vi.fn(),
}));

vi.mock('../../src/admin/data.js', () => ({
  setupAuditObserver: vi.fn(),
  getAuditHandler: vi.fn(),
}));

vi.mock('../../src/common/student-input.js', () => ({
  setupStudentInputObserver: vi.fn(),
  studentInputChangeHandler: vi.fn(),
}));

vi.mock('../../src/common/store.js', () => ({
  store: {
    setState: vi.fn(),
    getState: vi.fn(() => ({ isEditor: true })),
    initialize: vi.fn(),
  },
}));

vi.mock('../../src/common/debug.js', () => ({
  DEBUG: true
}));

describe('init module', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.google = {
      script: {
        run: {
          withSuccessHandler: vi.fn().mockReturnThis(),
          withFailureHandler: vi.fn().mockReturnThis(),
          getInitialAdminData: vi.fn(),
        },
      },
    };

    // DOM setup for initializeTabs
    document.body.innerHTML = `
      <div class="nav-tabs">
        <button class="nav-link" data-target="tab1">Tab 1</button>
      </div>
      <div id="tab1" class="tab-panel"></div>
    `;
  });

  describe('initObservers', () => {
    it('registers all observer modules across student input, data, and tables', () => {
      initObservers();

      expect(studentInput.setupStudentInputObserver).toHaveBeenCalledOnce();
      expect(data.setupAuditObserver).toHaveBeenCalledOnce();
      expect(dataTable.initObservers).toHaveBeenCalledOnce();
      expect(settingsTable.initObservers).toHaveBeenCalledOnce();
    });
  });

  describe('initializeApp', () => {
    it('retrieves server data, parses payload, updates store state, and binds event listeners', async () => {
      vi.mocked(dom.valueOf).mockReturnValue('true');

      const initPromise = initializeApp();      
      await initPromise;
      expect(messaging.showLoadingModal).toHaveBeenCalledWith('Retrieving data');

      expect(store.setState).toHaveBeenCalled();

      expect(dom.addEventListener).toHaveBeenCalled();
      expect(messaging.hideLoadingModal).toHaveBeenCalledOnce();
    });

    it('catches and processes errors during initialization', async () => {
      const error = new Error('Network failure');
      dataTable.initObservers.mockImplementation(() => {
        throw error;
      });

      await initializeApp();

      expect(messaging.processError).toHaveBeenCalledWith(error, 'Failed to initialize app:');
      expect(messaging.hideLoadingModal).toHaveBeenCalled();
    });
  });

  describe('initializeUi', () => {
    it('toggles editor-only views based on store state', async () => {
      vi.mocked(store.getState).mockReturnValue({ isEditor: false });

      await initializeUi();

      expect(dom.toggleEditorOnlyViews).toHaveBeenCalledWith(false);
    });
  });

  describe('setTooltips', () => {
    it('instantiates Bootstrap tooltip objects for elements matching selector', () => {
      const mockElement = document.createElement('button');
      vi.mocked(dom.qsa).mockReturnValue([mockElement]);

      const mockTooltipConstructor = vi.fn();
      global.bootstrap = { Tooltip: mockTooltipConstructor };

      setTooltips('.tooltip-target');

      expect(dom.qsa).toHaveBeenCalledWith('.tooltip-target');
      expect(mockTooltipConstructor).toHaveBeenCalledWith(mockElement);
    });
  });
});