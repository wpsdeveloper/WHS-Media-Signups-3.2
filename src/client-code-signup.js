/** ======= CLIENT CODE  ========
 * Javascript (client-side) entry point for the Signup Form.
 */

import {
  STUDENT_NAMES,
  DAILY_SCHEDULES,
  INTERVENTION_TEACHERS,
  STUDY_TEACHERS,
  SIGNUPS,
  NO_FLY,
  IS_STAFF,
  IS_ADMIN,
  UPDATE_ROW_ID,
  UPDATE_DATA,
  CURRENT_MAX,
  setIsStaff,
  setIsAdmin,
  setIsEditor,
  setUpdateRowId,
  setUpdateData,
} from "./signup/state.js";
import {
  $,
  $$,
  valueOf,
  setVisible,
  setText,
  setValue,
  appendOption,
  parseJsonValue,
} from "./signup/dom.js";
import {
  getInitialData as requestInitialData,
  getDailySchedules as requestDailySchedules,
  getInterventionTeachers as requestInterventionTeachers,
  getNoFlyList as requestNoFlyList,
  getMaxSignups as requestMaxSignups,
  getSignups as requestSignups,
  getStudents as requestStudents,
  getStudyTeachers as requestStudyTeachers,
} from "./signup/server.js";
import { bindEvents, initializePage } from "./signup/startup.js";
import { initializeLinks } from "./signup/links.js";
import { validateForm } from "./signup/validation.js";
import { submitForm as submitSignup } from "./signup/submission.js";
import {
  parseDateInput,
  toDateInputValue,
  updatePeriodList as renderPeriodList,
  getTeachersForSelection,
  updateSubjectList as renderSubjectList,
  updateStudyList as renderStudyList,
} from "./signup/schedule.js";
import {
  wednesdayInterventions,
  checkFull as checkCapacity,
  updateGlassRooms as refreshGlassRooms,
  updateTypeOptions as refreshTypeOptions,
  setSpecialScheduleAdjustments,
} from "./signup/availability.js";
import { collectData, populateData, startOver } from "./signup/form-data.js";
import {
  hideLoadingModal,
  initializeStudentDatalist,
  initializeUi,
  showStudyAltInput,
  showIntTeacherAltInput,
  updateDetailsPanel,
  showErrorToast,
  showLoadingModal,
  showSuccessToast,
} from "./signup/ui.js";
import {
  parseInitialData,
  parseDailySchedules,
  parseInterventionTeachers,
  parseNoFlyList,
  parseMaxSignups,
  parseSignups,
  parseStudents,
  parseStudyTeachers,
  disableOption,
} from "./signup/parsers.js";

function parserHooks() {
  return {
    hideLoadingModal,
    typeChanged,
    getUpdateData: () => UPDATE_DATA,
    populateData: signup => populateData(signup, { dateChanged, periodChanged, typeChanged }),
    updatePeriodList,
    showIntTeacherAltInput,
    getInterventionTeachers: () => INTERVENTION_TEACHERS,
    updateSubjectList,
    showStudyAltInput,
    getStudyTeachers: () => STUDY_TEACHERS,
    updateStudyList,
    initializeStudentDatalist: () => initializeStudentDatalist(STUDENT_NAMES),
  };
}

function getInitialData() {
  requestInitialData(data => parseInitialData(data, parserHooks()), processError);
}

function submitForm() {
  submitSignup({
    validateForm: () => validateForm({ collectData, parseDateInput }),
    collectData,
    showLoadingModal,
    processError,
    showSuccessToast,
    hideLoadingModal,
  });
}

function wireEvents() {
  bindEvents({ typeChanged, dateChanged, periodChanged, submitForm, startOver });
}

document.addEventListener("DOMContentLoaded", () => initializePage({
  initializeLinks,
  initializeUi,
  bindEvents: wireEvents,
  showLoadingModal,
  updateDetailsPanel,
  setUpdateStatus,
  checkStaffStatus,
  checkAdminStatus,
  getInitialData,
}));

function checkFull() {
  checkCapacity({ signups: SIGNUPS, currentMax: CURRENT_MAX });
}

function checkStaffStatus() {
  setIsStaff(valueOf("input#email").indexOf("@walpole.k12.ma.us") > 0);
  $$(".staff-only").forEach(element => {
    element.classList.remove("d-flex");
    setVisible(element, IS_STAFF);
  });
}

function checkAdminStatus() {
  setIsAdmin(valueOf("#is-admin") === "true");
  $$(".admin-only").forEach(element => {
    element.classList.remove("d-flex");
    setVisible(element, IS_ADMIN);
  });
}

function dateChanged() {
  updatePeriodList();
  refreshForm();
}

function periodChanged() {
  refreshForm();
}

function typeChanged() {
  refreshForm();
}

function refreshForm() {
  updateTypeOptions();
  updateDetailsPanel();
  updateSubjectList();
  updateStudyList();
  refreshGlassRooms({ signups: SIGNUPS });
  checkFull();
}

function updatePeriodList() {
  renderPeriodList({
    valueOf,
    appendOption,
    setValue,
    wednesdayInterventions: date => wednesdayInterventions(date, valueOf),
    processError,
    dailySchedules: DAILY_SCHEDULES,
  });
}

function updateSubjectList() {
  renderSubjectList({
    valueOf,
    appendOption,
    showIntTeacherAltInput,
    interventionTeachers: INTERVENTION_TEACHERS,
    dailySchedules: DAILY_SCHEDULES,
  });
}

function updateStudyList() {
  renderStudyList({
    valueOf,
    appendOption,
    setVisible,
    studyTeachers: STUDY_TEACHERS,
    dailySchedules: DAILY_SCHEDULES,
  });
}

function updateTypeOptions() {
  refreshTypeOptions({
    tutoringActive: valueOf("#tutoring-active") === "On",
    noFlyList: NO_FLY,
    setSpecialScheduleAdjustments: () => setSpecialScheduleAdjustments({
      dailySchedules: DAILY_SCHEDULES,
      checkFull,
      showOption: type => {
        disableOption(`#${type}`, "Not available");
        if (type === "non-intervention") {
          $("label[for='purpose']")?.insertAdjacentHTML("beforeend", "<span class='type-warning'> <i>Not available</i></span>");
          $$(`input[name='purpose']`).forEach(element => {
            element.disabled = true;
            element.checked = false;
          });
        }
      },
      showWednesday: () => disableOption("#non-intervention", "Not available"),
    }),
  });
}

function getDailySchedules() {
  requestDailySchedules(data => parseDailySchedules(data, parserHooks()), processError);
}

function getInterventionTeachers() {
  requestInterventionTeachers(data => parseInterventionTeachers(data, parserHooks()), processError);
}

function getNoFlyList() {
  requestNoFlyList(parseNoFlyList, processError);
}

function getMaxSignups() {
  requestMaxSignups(parseMaxSignups, processError);
}

function getSignups() {
  requestSignups(parseSignups, processError);
}

function getStudents() {
  requestStudents(data => parseStudents(data, parserHooks()), processError);
}

function getStudyTeachers() {
  requestStudyTeachers(data => parseStudyTeachers(data, parserHooks()), processError);
}

function setUpdateStatus() {
  setIsEditor(valueOf("#is-editor") === "true");
  setUpdateRowId(valueOf("#update-row-id"));
  $("#email").disabled = !IS_EDITOR;
  $$(".editors-only").forEach(element => setVisible(element, IS_EDITOR));
  if (!IS_EDITOR || UPDATE_ROW_ID === "") return;
  setVisible($("#btn-submit"), false);
  setVisible($("#btn-update"), true);
  google.script.run
    .withSuccessHandler(parseUpdateStudent)
    .withFailureHandler(processError)
    .getSignupByRow(UPDATE_ROW_ID);
}

function parseUpdateStudent(signupJson) {
  if (signupJson === null) {
    processError(new Error("Invalid URL parameters"));
    return;
  }
  setUpdateData(parseJsonValue(signupJson));
}

function processError(error) {
  hideLoadingModal();
  showErrorToast(error.message);
  console.error(error);
}
