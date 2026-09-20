import * as dom from "./dom"

/**
 *  Responds generically to a server error 
 * */
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
 *  Shows an error (red) toast 
 * */
export const showErrorToast = (errorMessage: string) => {
  dom.showBootstrapToast("#error-toast", errorMessage);
}

/**
 *  Shows the loading modal, which waits until cleared 
 * */
export const showLoadingModal = (text: string) => {
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
export const showSuccessToast = (text: string) => {
  dom.showBootstrapToast("#success-toast", text)
}