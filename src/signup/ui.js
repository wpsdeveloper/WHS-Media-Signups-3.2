import { $, $$, setChecked, setDisabled, setText, setValue, setVisible, hideBootstrapModal, showBootstrapModal, showBootstrapToast } from "./dom.js";
import { toDateInputValue } from "./schedule.js";

export function hideLoadingModal() {
  hideBootstrapModal("#loading-modal");
}

export function hideTypes() {
  $$(".intervention-only, .assessment-only, .tutoring-only, .non-intervention-only, .alt-setting-only, .staff-reservation-only")
    .forEach(element => setVisible(element, false));
}

export function initializeStudentDatalist(studentNames) {
  const input = $(".student-autocomplete");
  if (!input) return;
  let list = $("#student-suggestions");
  if (!list) {
    list = document.createElement("datalist");
    list.id = "student-suggestions";
    document.body.append(list);
  }
  input.setAttribute("list", list.id);
  input.oninput = () => {
    if (input.value.trim().length < 3) {
      list.replaceChildren();
      return;
    }
    list.replaceChildren(...(studentNames || []).map(name => {
      const option = document.createElement("option");
      option.value = name;
      return option;
    }));
  };
  list.replaceChildren();
}

export function initializeUi() {
  const today = new Date();
  const dateInput = $(".date-input");
  if (dateInput) {
    dateInput.type = "date";
    dateInput.min = toDateInputValue(new Date(today.getTime() - 14 * 86400000));
    dateInput.max = toDateInputValue(new Date(today.getTime() + 14 * 86400000));
    dateInput.value = toDateInputValue(today);
  }
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  if (( $(".int-link")?.getAttribute("href") || "").length > 58) $(".int-link").classList.remove("d-none");
  if (( $(".tut-link")?.getAttribute("href") || "").length > 58) $(".tut-link").classList.remove("d-none");
}

export function showStudyAltInput(show) {
  setVisible($("#study-teacher-select"), !show);
  setVisible($("#study-teacher-input"), show);
}

export function showIntTeacherAltInput(show) {
  setVisible($("#subject-int-select"), !show);
  setVisible($("#subject-int-input"), show);
}

export function showType(typeClass) {
  hideTypes();
  $$(typeClass).forEach(element => setVisible(element, true));
}

export function updateDetailsPanel() {
  if ($("input#intervention").checked) showType(".intervention-only");
  else if ($("input#assessment").checked) showType(".assessment-only");
  else if ($("input#tutoring").checked) showType(".tutoring-only");
  else if ($("input#non-intervention").checked) showType(".non-intervention-only");
  else if ($("input#alt-setting").checked) showType(".alt-setting-only");
  else if ($("input#staff-reservation").checked) showType(".staff-reservation-only");
}

export function submitComplete() {
  showSuccessToast("Submission complete");
  hideLoadingModal();
  setVisible($("#form"), false);
  setVisible($("#success-box"), true);
}

export function updateComplete() {
  showSuccessToast("Update complete.");
  hideLoadingModal();
  setVisible($("#form"), false);
  setVisible($("#success-update-box"), true);
}

export function showErrorToast(errorMessage) {
  setText("#error-toast .toast-body", errorMessage);
  showBootstrapToast("#error-toast");
}

export function showLoadingModal(text) {
  setText("#loading-modal .loading-text", text);
  showBootstrapModal("#loading-modal");
}

export function showSuccessToast(text) {
  setText("#success-toast .toast-body", text);
  showBootstrapToast("#success-toast");
}
