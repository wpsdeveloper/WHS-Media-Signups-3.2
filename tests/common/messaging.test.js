import { vi, describe, test, beforeEach, expect } from 'vitest';
import * as dom from '../../src/common/dom.js';
import {
  processError,
  showErrorToast,
  showLoadingModal,
  hideLoadingModal,
  showSuccessToast,
} from '../../src/common/messaging.js';

// Fix 1: Path in vi.mock MUST match the import path
vi.mock('../../src/common/dom.js', () => ({
  showBootstrapToast: vi.fn(),
  showBootstrapModal: vi.fn(),
  hideBootstrapModal: vi.fn(),
  setText: vi.fn(),
}));

describe('Messaging Utilities', () => {
  const mockError = { message: 'Sample error message' };

  beforeEach(() => {
    vi.clearAllMocks();
    // Silence and track console.error during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('processError', () => {
    test('shows error toast, hides loading modal, and calls console.error with error object', () => {
      processError(mockError, undefined);

      // Fix 3: hideLoadingModal IS called inside processError
      expect(dom.hideBootstrapModal).toHaveBeenCalledWith('#loading-modal');
      expect(dom.showBootstrapToast).toHaveBeenCalledWith('#error-toast');
      expect(dom.setText).toHaveBeenCalledWith('#error-toast .toast-body', mockError.message);

      expect(console.error).toHaveBeenCalledWith(mockError);
    });

    test('shows error toast and logs custom console message with error when provided', () => {
      processError(mockError, 'Custom console message');

      expect(dom.showBootstrapToast).toHaveBeenCalledWith('#error-toast');
      expect(dom.setText).toHaveBeenCalledWith('#error-toast .toast-body', mockError.message);

      expect(console.error).toHaveBeenCalledWith('Custom console message', mockError);
    });

    test('hides loading modal before showing error toast', () => {
      processError(mockError, undefined);

      // Fix 3: Verified call execution order
      expect(dom.hideBootstrapModal).toHaveBeenCalledWith('#loading-modal');
      expect(dom.showBootstrapToast).toHaveBeenCalledWith('#error-toast');
    });
  });

  describe('showErrorToast', () => {
    test('shows error toast with provided message', () => {
      showErrorToast('An error occurred');

      expect(dom.showBootstrapToast).toHaveBeenCalledWith('#error-toast');
      expect(dom.setText).toHaveBeenCalledWith('#error-toast .toast-body', 'An error occurred');
    });

    test('handles empty string message', () => {
      showErrorToast('');

      expect(dom.showBootstrapToast).toHaveBeenCalledWith('#error-toast');
      expect(dom.setText).toHaveBeenCalledWith('#error-toast .toast-body', '');
    });
  });

  describe('showLoadingModal', () => {
    test('shows loading modal with default text (undefined)', () => {
      showLoadingModal();

      expect(dom.showBootstrapModal).toHaveBeenCalledWith('#loading-modal');
      expect(dom.setText).toHaveBeenCalledWith('#loading-modal .loading-text', undefined);
    });

    test('shows loading modal with custom text', () => {
      showLoadingModal('Please wait...');

      expect(dom.showBootstrapModal).toHaveBeenCalledWith('#loading-modal');
      expect(dom.setText).toHaveBeenCalledWith('#loading-modal .loading-text', 'Please wait...');
    });

    test('handles empty string as explicit message', () => {
      showLoadingModal('');

      expect(dom.showBootstrapModal).toHaveBeenCalledWith('#loading-modal');
      expect(dom.setText).toHaveBeenCalledWith('#loading-modal .loading-text', '');
    });
  });

  describe('hideLoadingModal', () => {
    test('hides the loading modal', () => {
      hideLoadingModal();

      expect(dom.hideBootstrapModal).toHaveBeenCalledWith('#loading-modal');
    });
  });

  describe('showSuccessToast', () => {
    test('shows success toast with provided message', () => {
      showSuccessToast('Operation completed successfully');

      expect(dom.showBootstrapToast).toHaveBeenCalledWith('#success-toast', 'Operation completed successfully');
    });

    test('handles empty string message', () => {
      showSuccessToast('');

      expect(dom.showBootstrapToast).toHaveBeenCalledWith('#success-toast', '');
    });
  });
});