import * as dom from "./dom.js"

/**
 *  Responds generically to a server error 
 * */
export const processError = (error, consoleMsg) => {
  hideLoadingModal();
  showErrorToast(error.message);
  if (consoleMsg) {
    console.error(consoleMsg, error);
  } else {
    console.error(error);
  }
}

/**
 *  Shows an error (red) toast 
 * */
export const showErrorToast = (errorMessage) => {
  dom.showBootstrapToast("#error-toast");
  dom.setText("#error-toast .toast-body", errorMessage);
}

/**
 *  Shows the loading modal, which waits until cleared 
 * */
export const showLoadingModal = (text) => {
  dom.setText("#loading-modal .loading-text", text);
  dom.showBootstrapModal("#loading-modal");
}

/**
 *  Hides the loading modal 
 * */
export const hideLoadingModal = () => {
  dom.hideBootstrapModal("#loading-modal");
}

/**
 *  Shows a successful (green) submission toast 
 * */
export const showSuccessToast = (text) => {
  dom.showBootstrapToast("#success-toast", text)
}