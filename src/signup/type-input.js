import * as dom from "./dom.js"
import * as capacity from "./capacity-validation.js";
import * as scheduling from "./schedule-rules.js";
import * as panels from "./panels.js";
import * as studySelect from "./study-select.js";
import * as subjectSelect from "./subject-select.js";

/**
*  Responds to a change in the Type field 
* */
export const typeChangeHandler = (state) => {
  updateTypeOptions(state);
  capacity.checkFull(state.signups, state.currentMax);
  panels.updateDetailsPanel(state.dailySchedules);
  studySelect.updateStudyOptions(state);
  subjectSelect.updateSubjectOptions(state.interventionTeachers, state.dailySchedules);
}

export const toggleInterventionsLink = () => {
  const isVisible = (dom.getAttribute('.int-link', 'href') || '').length > 58;
  dom.setVisible('.int-link', isVisible);
}

export const toggleTutoringLink = () => {
  const isVisible = (dom.getAttribute('href') || '').length > 58;
  dom.setVisible('.tut-link', isVisible);
}


/**
*  Updates the Type options is there is a special schedule that period 
* */
export const updateTypeOptions = (state) => {
  resetAllTypes();

  toggleTutoringActive();
  capacity.preventSignupForNoFly(state.noFlyList);
  scheduling.setSpecialScheduleAdjustments(state);
}

export const resetAllTypes = () => {
  dom.setDisabled(`input[name='signup-type'], input[name='purpose']`, false);
  dom.setVisible('span.type-warning', false);
}

 
export const markTutoringDisabled = () => {
  dom.setDisabled("input#tutoring", true);
  dom.setChecked("input#tutoring", false);
  showTutoring();
}

export const showInterventions = () => {
  dom.setDisabled("input#intervention", true);
  dom.setChecked("input#intervention", false);
  dom.setVisible("label[for='intervention'] span.type-warning", true);
  dom.setText("label[for='intervention'] span.type-warning", "Not available");
}

export const showAssessmentMakeups = () => {
  dom.setDisabled("input#assessment", true);
  dom.setChecked("input#assessment", false);
  dom.setVisible("label[for='assessment'] span.type-warning", true);
  dom.setText("label[for='assessment'] span.type-warning", "Not available");
}

export const showAltSetting = () => {
  dom.setDisabled("input#alt-setting", true);
  dom.setChecked("input#alt-setting", false);
  dom.setVisible("label[for='alt-setting'] span.type-warning", true);
  dom.setText("label[for='alt-setting'] span.type-warning", "Not available");
}

export const showTutoring = () => {
  dom.setDisabled("input#tutoring", true);
  dom.setChecked("input#tutoring", false);
  dom.setVisible("label[for='tutoring'] span.type-warning", true);
  dom.setText("label[for='tutoring'] span.type-warning", "Not available");
}

export const showWednesdayInterventions = () => {
  dom.setDisabled("input#non-intervention", true);
  dom.setChecked("input#non-intervention", false);
  dom.setVisible("label[for='non-intervention'] span.type-warning", true);
  dom.setText("label[for='non-intervention'] span.type-warning", "Not available");
}

export const showNonInterventions = () => {
  dom.setDisabled("input#non-intervention", true);
  dom.setChecked("input#non-intervention", false);
  dom.setDisabled("input[name='purpose']", true);
  dom.setChecked("input[name='purpose']", false);
  dom.setVisible("label[for='purpose'] span.type-warning", true);
  dom.setText("label[for='purpose'] span.type-warning", "Not available");
}

export const toggleTutoringActive = () => {
  const tutoringActive = dom.valueOf('#tutoring-active') === "On";
  if (!tutoringActive) {
    markTutoringDisabled();
  }
}
