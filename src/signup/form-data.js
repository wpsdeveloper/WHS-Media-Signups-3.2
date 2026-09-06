import { $, $$, isVisible, setChecked, setValue, setVisible, valueOf } from "./dom.js";
import { toDateInputValue } from "./schedule.js";

export function collectData() {
  const data = {};
  data.email = valueOf("#email");
  data.firstname = "";
  data.lastname = "";

  if (isVisible($("#student"))) {
    const student = valueOf("#student");
    const brackets = student.indexOf(" <") > 0 ? student.split(" <") : [];
    const names = brackets.length > 0 ? brackets[0].split(", ") : [];
    data.firstname = names.length > 0 ? names[1] : "";
    data.lastname = names.length > 0 ? names[0] : "";
    data.emailStudent = brackets.length === 2
      ? brackets[1].trim().substring(0, brackets[1].length - 1)
      : "";
  } else {
    data.emailStudent = valueOf("#email");
  }

  data.date = valueOf("#date");
  data.period = valueOf("#period");
  data.type = valueOf("input[name='signup-type']:checked");

  const visibleSubject = $$(".subject-int").find(isVisible);
  if (visibleSubject) {
    data.subject = visibleSubject.value || "";
  } else if (isVisible($("#subject-non-int"))) {
    data.subject = valueOf("#subject-non-int");
  }

  data.purpose = isVisible($("#purpose")) ? valueOf("#purpose input[type='radio']:checked") : "";
  data.room = isVisible($("#glass-room")) ? valueOf("#glass-room input[type='radio']:checked") : "";
  data.teacherStudy = "";
  const visibleStudyTeacher = $$(".study-teacher").find(isVisible);
  if (visibleStudyTeacher) data.teacherStudy = visibleStudyTeacher.value || "";
  data.teacherAcad = isVisible($("#acad-teacher")) ? valueOf("#acad-teacher") : "";
  data.comments = valueOf("#topic-intervention");
  return data;
}

export function populateData(signup, hooks) {
  setValue("#student", `${signup.lastname}, ${signup.firstname} <${signup.emailStudent}`);
  setValue("#date", toDateInputValue(new Date(signup.date)));
  hooks.dateChanged();
  setValue("#period", "" + signup.period);
  hooks.periodChanged();
  setValue("#subject-non-int", signup.subject);
  setValue("#subject-int-select", signup.subject);
  setValue("#study-teacher-select", signup.teacherStudy);
  setValue("#study-teacher-input", signup.teacherStudy);
  setValue("#acad-teacher", signup.teacherAcad);
  setChecked("#type input", false);
  setChecked(`#type input[value="${signup.type}"]`, true);
  hooks.typeChanged();
  setChecked("#purpose input", false);
  setChecked(`#purpose input[value="${signup.purpose}"]`, true);
  setChecked("#glass-room input", false);
  setChecked(`#glass-room input[value="${signup.room}"]`, true);
  setValue("#topic-intervention", signup.comments);
}

export function startOver() {
  setValue("#student", "");
  setChecked("#purpose input", false);
  setValue("#study-teacher-input", "");
  setValue("#acad-teacher", "");
  setValue("#topic-intervention", "");
  setValue("#subject-int-select", "");
  setVisible($("#form"), true);
  setVisible($("#success-box"), false);
}
