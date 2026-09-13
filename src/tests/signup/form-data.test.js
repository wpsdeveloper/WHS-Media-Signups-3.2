import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitForm, startOver } from '../../signup/form-data.js';
import * as dom from '../../common/dom.js';
import * as messaging from '../../common/messaging.js';
import { store } from '../../signup/store.js';
import { DEBUG } from '../../common/debug.js';

// Mock dependencies
vi.mock('../../common/dom.js', () => ({
  setValue: vi.fn(),
  setChecked: vi.fn(),
  setVisible: vi.fn(),
  valueOf: vi.fn(),
  isVisible: vi.fn(),
  setInvalid: vi.fn(),
}));

vi.mock('../../common/messaging.js', () => ({
  showLoadingModal: vi.fn(),
  hideLoadingModal: vi.fn(),
  showSuccessToast: vi.fn(),
}));

vi.mock('../../signup/store.js', () => ({
  store: { 
    setState: vi.fn(),
    getState: vi.fn(() => ({ updateRowId: null })) 
  }
}));

vi.mock('../../common/debug.js', () => ({
  DEBUG: false
}));

describe('Form Data Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Google Apps Script environment
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

  describe('submitForm', () => {
    it('should abort submission if form data is invalid', async () => {
      // Force validation failure by making required fields empty
      dom.valueOf.mockReturnValue('');
      store.getState.mockReturnValue({});
      
      await submitForm();
      
      expect(dom.setInvalid).toHaveBeenCalled();
      expect(messaging.showLoadingModal).not.toHaveBeenCalled();
    });

    it('should submit new form data when valid and no updateRowId exists', async () => {
      // Mock valid form data
      dom.valueOf.mockImplementation(selector => selector === '#date' ? '2023-11-01' : 'test');
      dom.isVisible.mockReturnValue(false); // Simplifies validation
      store.getState.mockReturnValue({ updateRowId: null, currentDate: '2023-11-01', currentPeriod: '1', currentType: 'Tutoring' });
      
      // Setup successful GAS callback execution
      global.google.script.run.withSuccessHandler.mockImplementation(function (cb) {
        cb(); // Trigger success handler immediately
        return this;
      });

      await submitForm();
      
      expect(messaging.showLoadingModal).toHaveBeenCalledWith('Submitting');
      expect(global.google.script.run.submitForm).toHaveBeenCalled();
      expect(messaging.showSuccessToast).toHaveBeenCalledWith('Submission complete');
      expect(dom.setVisible).toHaveBeenCalledWith('#form', false);
      expect(dom.setVisible).toHaveBeenCalledWith('#success-box', true);
    });
  });

  describe('startOver', () => {
    it('should reset store state and clear DOM fields', () => {
      startOver();
      
      expect(store.setState).toHaveBeenCalledWith({
        currentType: null,
        currentStudyTeacher: null,
        currentSubject: null,
        currentStudentName: '',
      });
      
      expect(dom.setValue).toHaveBeenCalledWith('#student', '');
      expect(dom.setVisible).toHaveBeenCalledWith('#form', true);
      expect(dom.setVisible).toHaveBeenCalledWith('#success-box', false);
    });
  });
});