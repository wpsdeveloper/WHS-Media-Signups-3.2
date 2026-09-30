import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  initObservers, 
  initializeApp, 
  setUpdateStatus,
  setTooltips 
} from '../../client/signup/init.js';
import * as dom from '../../client/common/dom.js';
import * as messaging from '../../client/common/messaging.js';
import { store } from '../../client/signup/signup-store.js';
import * as dateSelect from '../../client/signup/date-select.js';

// 1. Mock all UI and Orchestration Dependencies
vi.mock('../../client/common/dom.js', () => ({
  setVisible: vi.fn(),
  setDisabled: vi.fn(),
  valueOf: vi.fn(),
  qsa: vi.fn(),
  addEventListener: vi.fn(),
  toggleEditorOnlyViews: vi.fn(),
  toggleStaffOnlyViews: vi.fn(),
  toggleAdminOnlyViews: vi.fn(),
  setValue: vi.fn(),
}));

vi.mock('../../client/common/messaging.js', () => ({
  showLoadingModal: vi.fn(),
  hideLoadingModal: vi.fn(),
  processError: vi.fn(),
}));

vi.mock('../../client/signup/signup-store.js', () => ({
  Store: vi.fn().mockImplementation((state) => ({
    state,
    getState: vi.fn().mockReturnValue(state),
    setState: vi.fn(),
    subscribe: vi.fn(),
  })),
  store: { 
    setState: vi.fn(),
    subscribe: vi.fn(),
    getState: vi.fn(() => ({ isEditor: true, isStaff: true, isAdmin: true, updateData: null })) ,
  },
  registerUpdateData: vi.fn(),
}));

vi.mock('../../client/signup/date-select.js', () => ({
  setupDateObserver: vi.fn(),
  initDateInput: vi.fn(),
  dateChangeHandler: vi.fn(),
}));

// Mock other observers
vi.mock('../../client/signup/period-select.js', () => ({ setupPeriodObservers: vi.fn() }));
vi.mock('../../client/signup/type-select.js', () => ({ setupTypeInputObserver: vi.fn() }));
vi.mock('../../client/signup/panels.js', () => ({ setupPanelsObserver: vi.fn() }));
vi.mock('../../client/signup/glass-rooms-input.js', () => ({ setupGlassRoomsObserver: vi.fn() }));
vi.mock('../../client/signup/study-select.js', () => ({ setupStudyObservers: vi.fn() }));
vi.mock('../../client/signup/subject-select.js', () => ({ setupSubjectObservers: vi.fn() }));
vi.mock('../../client/signup/interventions-teacher-select.js', () => ({ setupInterventionTeacherObserver: vi.fn() }));
vi.mock('../../client/common/student-input.js', () => ({ setupStudentInputObserver: vi.fn() }));
vi.mock('../../client/signup/schedule-rules.js', () => ({ setupScheduleRulesObserver: vi.fn() }));
vi.mock('../../client/signup/capacity-validation.js', () => ({ setupCapacityValidationObserver: vi.fn() }));
vi.mock('../../client/signup/form-data.js', () => ({ submitForm: vi.fn(), startOver: vi.fn() }));
vi.mock('../../client/common/app-config.js', () => ({ getAppConfig: vi.fn().mockResolvedValue({ email: 'test@example.com', isStaff: true, isAdmin: true, isEditor: true }), updateScriptLinks: vi.fn() }));
vi.mock('../../client/common/debug.js', () => ({ IS_DEBUG: false, getMockData: vi.fn() }));
vi.mock('../../client/signup/parsers.js', () => ({ 
  parseDailyBlocks: vi.fn(() => []),
  parseSignups: vi.fn(() => []),
  parseSettings: vi.fn(() => []),
  safeJsonParse: vi.fn(() => ({})),
  parseStudentDataList: vi.fn(() => []),
}));

/**
 * Test suite for the Init Module.
 * Contains tests for initialization logic, observer setup, and UI configuration.
 */
describe('Init Module', () => {
  beforeEach(() => {
    // Clear all mock history to ensure test isolation
    vi.clearAllMocks();
    
    // Mock global Google Apps Script API
    global.google = {
      script: {
        run: {
          withSuccessHandler: vi.fn().mockReturnThis(),
          withFailureHandler: vi.fn().mockReturnThis(),
          getInitialSignupFormData: vi.fn(),
          getSignupByRow: vi.fn(),
        }
      }
    };

    // Mock global Bootstrap API
    global.bootstrap = {
      Tooltip: vi.fn(),
    };
  });

  /**
   * Tests for the initObservers function.
   * Ensures that all component observers are initialized correctly.
   */
  describe('initObservers', () => {
    it('should call setup observers for all modules', () => {
      initObservers();
      expect(dateSelect.setupDateObserver).toHaveBeenCalled();
    });
  });

  /**
   * Tests for the initializeApp function.
   * Verifies data loading, store initialization, and loading modal toggling.
   */
  describe('initializeApp', () => {
    it('should initialize the app, load data, and bind events', async () => {
      dom.qsa.mockReturnValue([]);
      
      global.google.script.run.withSuccessHandler.mockImplementation(cb => {
        cb({ students: [] }); // Simulate successful data return
        return global.google.script.run;
      });

      await initializeApp();

      expect(messaging.showLoadingModal).toHaveBeenCalledWith('Retrieving data');
      expect(store.setState).toHaveBeenCalled();
      expect(messaging.hideLoadingModal).toHaveBeenCalled();
    });
  });

  /**
   * Tests for the setUpdateStatus function.
   * Ensures correct UI configuration when a signup is being updated.
   */
  describe('setUpdateStatus', () => {
    it('should abort if user is not an editor', async () => {
      store.getState.mockReturnValueOnce({ isEditor: false });
      await setUpdateStatus();
      expect(dom.valueOf).toHaveBeenCalledWith('#update-row-id');
      expect(store.setState).not.toHaveBeenCalled();
    });

    it('should configure UI for updates if valid rowId exists and user is editor', async () => {
      dom.valueOf.mockReturnValue('row123');
      
      global.google.script.run.withSuccessHandler.mockImplementation(cb => {
        cb({ id: 'row123' }); 
        return global.google.script.run;
      });

      await setUpdateStatus();

      expect(store.setState).toHaveBeenCalledWith({ updateRowId: 'row123' });
      expect(dom.setDisabled).toHaveBeenCalledWith('#email', false); // isEditor is true
      expect(dom.setVisible).toHaveBeenCalledWith('#btn-submit', false);
      expect(dom.setVisible).toHaveBeenCalledWith('#btn-update', true);
    });
  });

  /**
   * Tests for the setTooltips function.
   * Verifies that Bootstrap Tooltips are initialized for the selected elements.
   */
  describe('setTooltips', () => {
    it('should map over tooltip elements and instantiate Bootstrap Tooltips', () => {
      const mockElements = [{}, {}];
      dom.qsa.mockReturnValue(mockElements);
      
      setTooltips('.tooltips');
      
      expect(dom.qsa).toHaveBeenCalledWith('.tooltips');
      expect(global.bootstrap.Tooltip).toHaveBeenCalledTimes(2);
    });
  });
});