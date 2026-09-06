import { $, isVisible } from "./dom.js";

export function getInvalidFields({ collectData, parseDateInput }) {
  const invalidFields = [];
  const data = collectData();

  if (isVisible($("#student"))) {
    if (data.firstname.length <= 0) invalidFields.push("#student");
    if (data.lastname.length <= 0) invalidFields.push("#student");
  }

  const dateReq = parseDateInput(data.date);
  if (data.date.length <= 0 || Number.isNaN(dateReq.getTime())) {
    invalidFields.push("#date");
  }

  if (data.period.length <= 0) invalidFields.push("#period");
  if (isVisible($("#study-teacher-select")) && data.teacherStudy.length <= 0) {
    invalidFields.push("#study-teacher");
  }
  if (data.type.length <= 0) invalidFields.push("#type");

  if ((data.type === "Non-intervention") || (data.type === "Assessment") || (data.type === "Alt setting")) {
    if (data.teacherAcad.length <= 0) invalidFields.push("#acad-teacher");
  }

  return invalidFields;
}

export function validateForm({ collectData, parseDateInput }) {
  document.querySelectorAll("input, select, textarea, div")
    .forEach(element => element.classList.remove("invalid"));
  const invalidFields = getInvalidFields({ collectData, parseDateInput });
  if (invalidFields.length > 0) {
    invalidFields.forEach(field => $(field)?.classList.add("invalid"));
    return false;
  }
  return true;
}
