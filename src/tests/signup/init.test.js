import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  initObservers, 
  initializeApp, 
  setUpdateStatus,
  setTooltips 
} from '../../client/signup/init.js';
import * as dom from '../../client/common/dom.js';
import * as messaging from '../../client/common/messaging.js';
import { store } from '../../client/common/store.js';
import * as dateSelect from '../../client/signup/date-select.js';

// 1. Mock all UI and Orchestration Dependencies
vi.mock('../../client/common/dom.js', () => ({
  setVisible: vi.fn(),
  setDisabled: vi.fn(),
  valueOf: vi.fn(),
  qsa: vi.fn(),
  addEventListener: vi.fn(),
  toggleEditorOnlyViews: vi.fn(),
}));

vi.mock('../../client/common/messaging.js', () => ({
  showLoadingModal: vi.fn(),
  hideLoadingModal: vi.fn(),
  processError: vi.fn(),
}));

vi.mock('../../client/signup/parsers.js', () => ({
  parseStudents: vi.fn(),
  parseMaxSignups: vi.fn(),
  parseStudentNames: vi.fn(),
  parseDailySchedules: vi.fn(),
  parseSignups: vi.fn(),
  parseInterventionTeachers: vi.fn(),
  parseStudyTeachers: vi.fn(),
  parseNoFlyList: vi.fn(),
}));

vi.mock('../../client/common/store.js', () => ({
  store: { 
    setState: vi.fn(),
    getState: vi.fn(() => ({ isEditor: true, isStaff: true, isAdmin: true })) ,
    initialize: vi.fn(),
  }
}));

// Mocking one observer heavily to represent the rest for brevity
vi.mock('../../client/signup/date-select.js', () => ({
  setupDateSelectObserver: vi.fn(),
  configureDateSelect: vi.fn(),
  dateChangeHandler: vi.fn(),
}));

// Mock the remaining observer modules with empty functions
const mockObserver = { setupObserver: vi.fn() };
vi.mock('../../client/signup/period-select.js', () => ({ setupPeriodOptionsObserver: vi.fn(), setupPeriodValueObserver: vi.fn(), periodChangeHandler: vi.fn() }));
vi.mock('../../client/signup/type-input.js', () => ({ setupTypeInputObserver: vi.fn(), toggleInterventionsLink: vi.fn(), toggleTutoringLink: vi.fn(), typeChangeHandler: vi.fn() }));
vi.mock('../../client/signup/panels.js', () => ({ setupPanelsObserver: vi.fn() }));
vi.mock('../../client/signup/glass-rooms-input.js', () => ({ setupGlassRoomsObserver: vi.fn() }));
vi.mock('../../client/signup/study-select.js', () => ({ setupStudyOptionsObserver: vi.fn(), setupStudySelectValueObserver: vi.fn(), studyTeacherChangeHandler: vi.fn() }));
vi.mock('../../client/signup/subject-select.js', () => ({ setupSubjectOptionsObserver: vi.fn(), setupSubjectValueObserver: vi.fn(), subjectChangeHandler: vi.fn() }));
vi.mock('../../client/signup/interventions-teacher-select.js', () => ({ setupInterventionTeacherObserver: vi.fn() }));
vi.mock('../../client/common/student-input.js', () => ({ setupStudentInputObserver: vi.fn(), studentInputChangeHandler: vi.fn() }));
vi.mock('../../client/signup/schedule-rules.js', () => ({ setupScheduleRulesObserver: vi.fn() }));
vi.mock('../../client/signup/capacity-validation.js', () => ({ setupCapacityValidationObserver: vi.fn() }));
vi.mock('../../client/signup/form-data.js', () => ({ preventFormSubmit: vi.fn(), submitForm: vi.fn(), startOver: vi.fn() }));
vi.mock('../../client/common/dates.ts', () => ({ toDateInputValue: vi.fn(() => '2023-10-01') }));
vi.mock('../../client/common/debug.js', () => ({ DEBUG: false }));

describe('Init Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
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

    global.bootstrap = {
      Tooltip: vi.fn(),
    };
  });

  describe('initObservers', () => {
    it('should call setup observers for all modules', () => {
      initObservers();
      expect(dateSelect.setupDateSelectObserver).toHaveBeenCalledWith('#date');
    });
  });

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