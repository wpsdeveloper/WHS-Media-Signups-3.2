import { $, $$ } from "./dom.js";

export function bindEvents({ typeChanged, dateChanged, periodChanged, submitForm, startOver }) {
  $$('input[name="signup-type"]').forEach(input => input.addEventListener("change", typeChanged));
  $("#date")?.addEventListener("change", dateChanged);
  $("#period")?.addEventListener("change", periodChanged);
  $("#btn-submit")?.addEventListener("click", submitForm);
  $("#btn-update")?.addEventListener("click", submitForm);
  $(".success-box-start-over")?.addEventListener("click", startOver);
}

export function preventFormSubmit() {
  const forms = document.querySelectorAll("form");
  forms.forEach(form => form.addEventListener("submit", event => event.preventDefault()));
}

export function initializePage({
  initializeLinks,
  initializeUi,
  bindEvents: bindPageEvents,
  showLoadingModal,
  updateDetailsPanel,
  setUpdateStatus,
  checkStaffStatus,
  checkAdminStatus,
  getInitialData,
}) {
  console.log("Initializing page");
  initializeLinks();
  initializeUi();
  bindPageEvents();
  showLoadingModal("Retrieving data");
  updateDetailsPanel();
  setUpdateStatus();
  checkStaffStatus();
  checkAdminStatus();
  getInitialData();
}
