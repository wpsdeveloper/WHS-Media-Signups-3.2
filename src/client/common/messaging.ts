import * as dom from "./dom"

/**
 * Responds generically to a server error.
 * @param error The Error object that was caught.
 * @param consoleMsg Optional custom message to log to the console along with the error.
 */
export const processError = (error: Error, consoleMsg?: string) => {
  hideLoadingModal();
  showErrorToast(error.message);
  if (consoleMsg) {
    console.error(consoleMsg, error);
  } else {
    console.error(error);
  }
}

/**
 * Shows an error (red) toast with the specified message.
 * @param errorMessage The error message to display.
 */
export const showErrorToast = (errorMessage: string) => {
  dom.showBootstrapToast("#error-toast", errorMessage);
}

/**
 * Shows the loading modal, which waits until cleared.
 * @param text The text to display in the loading modal.
 */
export const showLoadingModal = (text: string) => {
  dom.setText("#loading-modal .loading-text", text);
  dom.showBootstrapModal("#loading-modal");
}

/**
 * Hides the loading modal.
 */
export const hideLoadingModal = () => {
  dom.hideBootstrapModal("#loading-modal");
}

/**
 * Shows a successful (green) submission toast.
 * @param text The message to display in the success toast.
 */
export const showSuccessToast = (text: string) => {
  dom.showBootstrapToast("#success-toast", text)
}