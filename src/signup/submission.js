import { UPDATE_ROW_ID } from "./state.js";
import { setVisible } from "./dom.js";

export function submitComplete({ showSuccessToast, hideLoadingModal }) {
  showSuccessToast("Submission complete");
  hideLoadingModal();
  setVisible(document.querySelector("#form"), false);
  setVisible(document.querySelector("#success-box"), true);
}

export function updateComplete({ showSuccessToast, hideLoadingModal }) {
  showSuccessToast("Update complete.");
  hideLoadingModal();
  setVisible(document.querySelector("#form"), false);
  setVisible(document.querySelector("#success-update-box"), true);
}

export function submitForm({ validateForm, collectData, showLoadingModal, processError, showSuccessToast, hideLoadingModal }) {
  if (!validateForm()) {
    return;
  }

  const data = collectData();
  const successHandler = UPDATE_ROW_ID === null || UPDATE_ROW_ID === ""
    ? () => submitComplete({ showSuccessToast, hideLoadingModal })
    : () => updateComplete({ showSuccessToast, hideLoadingModal });

  if (UPDATE_ROW_ID !== null && UPDATE_ROW_ID !== "") {
    data.rowId = UPDATE_ROW_ID;
  }

  google.script.run
    .withSuccessHandler(successHandler)
    .withFailureHandler(processError)
    .submitForm(data);

  showLoadingModal("Submitting");
}
