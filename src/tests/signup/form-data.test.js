import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitForm, startOver } from '../../client/signup/form-data.js';
import * as dom from '../../client/common/dom.js';
import * as messaging from '../../client/common/messaging.js';
import { store } from '../../client/signup/signup-store.js';
import { DEBUG } from '../../client/common/debug.js';

// Mock dependencies
vi.mock('../../client/common/dom.js', () => ({
  setValue: vi.fn(),
  setChecked: vi.fn(),
  setVisible: vi.fn(),
  valueOf: vi.fn(),
  isVisible: vi.fn(),
  setInvalid: vi.fn(),
}));

vi.mock('../../client/common/messaging.js', () => ({
  showLoadingModal: vi.fn(),
  hideLoadingModal: vi.fn(),
  showSuccessToast: vi.fn(),
}));

vi.mock('../../client/signup/signup-store.js', () => ({
  store: { 
    setState: vi.fn(),
    getState: vi.fn(() => ({ updateRowId: null })) 
  }
}));

vi.mock('../../client/common/debug.js', () => ({
  DEBUG: false
}));

/**
 * Test suite for the Form Data Module.
 * Tests functions handling form submissions, validations, and state resets.
 */
describe('Form Data Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Google Apps Script environment, which is used for server-side communication
    global.google = {
      script: {
        run: {
          withSuccessHandler: vi.fn().mockReturnThis(),
          withFailureHandler: vi.fn().mockReturnThis(),
          submitForm: vi.fn(),
        }
      }
    };
  });

  /**
   * Tests for `submitForm`.
   * Verifies that form submissions handle invalid data correctly and successfully submit valid data to the backend.
   */
  describe('submitForm', () => {
    it('should abort submission if form data is invalid', async () => {
      // Force validation failure by making required fields empty
      dom.valueOf.mockReturnValue('');
      store.getState.mockReturnValue({});
      
      await submitForm();
      
      // Ensure UI reflects the validation error and loading is not shown
      expect(dom.setInvalid).toHaveBeenCalled();
      expect(messaging.showLoadingModal).not.toHaveBeenCalled();
    });

    it('should submit new form data when valid and no updateRowId exists', async () => {
      // Mock valid form data from DOM
      dom.valueOf.mockImplementation(selector => selector === '#date' ? '2023-11-01' : 'test');
      dom.isVisible.mockReturnValue(false); // Simplifies validation by hiding conditional fields
      store.getState.mockReturnValue({ updateRowId: null, currentDate: '2023-11-01', currentPeriod: '1', currentType: 'Tutoring' });
      
      // Setup successful GAS callback execution by immediately invoking the success handler
      global.google.script.run.withSuccessHandler.mockImplementation(function (cb) {
        cb(); // Trigger success handler immediately
        return this;
      });

      await submitForm();
      
      // Verify correct UI loading states and backend call
      expect(messaging.showLoadingModal).toHaveBeenCalledWith('Submitting');
      expect(global.google.script.run.submitForm).toHaveBeenCalled();
      
      // Verify success feedback
      expect(messaging.showSuccessToast).toHaveBeenCalledWith('Submission complete');
      expect(dom.setVisible).toHaveBeenCalledWith('#form', false);
      expect(dom.setVisible).toHaveBeenCalledWith('#success-box', true);
    });
  });

  /**
   * Tests for `startOver`.
   * Confirms that the application state and form fields are reset to their default empty states.
   */
  describe('startOver', () => {
    it('should reset store state and clear DOM fields', () => {
      startOver();
      
      // Verify state is wiped clean
      expect(store.setState).toHaveBeenCalledWith({
        currentType: null,
        currentStudyTeacher: null,
        currentSubject: null,
        currentStudentName: '',
      });
      
      // Verify UI is reset to the initial form view
      expect(dom.setValue).toHaveBeenCalledWith('#student', '');
      expect(dom.setVisible).toHaveBeenCalledWith('#form', true);
      expect(dom.setVisible).toHaveBeenCalledWith('#success-box', false);
    });
  });
});