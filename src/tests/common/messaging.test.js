import { vi, describe, test, beforeEach, expect } from 'vitest';
import * as dom from '../../client/common/dom.js';
import {
  processError,
  showErrorToast,
  showLoadingModal,
  hideLoadingModal,
  showSuccessToast,
} from '../../client/common/messaging.js';

vi.mock('../../client/common/dom.js', () => ({
  showBootstrapToast: vi.fn(),
  showBootstrapModal: vi.fn(),
  hideBootstrapModal: vi.fn(),
  setText: vi.fn(),
}));

describe('Messaging Utilities', () => {
  const mockError = { message: 'Sample error message' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('processError', () => {
    test('shows error toast, hides loading modal, and calls console.error', () => {
      processError(mockError, undefined);

      expect(dom.hideBootstrapModal).toHaveBeenCalledWith('#loading-modal');
      expect(dom.showBootstrapToast).toHaveBeenCalledWith('#error-toast', mockError.message);
      expect(console.error).toHaveBeenCalledWith(mockError);
    });

    test('shows error toast and logs custom console message', () => {
      processError(mockError, 'Custom console message');

      expect(dom.showBootstrapToast).toHaveBeenCalledWith('#error-toast', mockError.message);
      expect(console.error).toHaveBeenCalledWith('Custom console message', mockError);
    });
  });

  describe('showErrorToast', () => {
    test('shows error toast with provided message', () => {
      showErrorToast('An error occurred');
      expect(dom.showBootstrapToast).toHaveBeenCalledWith('#error-toast', 'An error occurred');
    });
  });

  describe('showLoadingModal', () => {
    test('shows loading modal with custom text', () => {
      showLoadingModal('Please wait...');
      expect(dom.showBootstrapModal).toHaveBeenCalledWith('#loading-modal');
      expect(dom.setText).toHaveBeenCalledWith('#loading-modal .loading-text', 'Please wait...');
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
  });
});
