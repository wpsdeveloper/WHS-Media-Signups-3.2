import * as dom from '../common/dom.js';
import * as messaging from '../common/messaging.js';
import * as parser from './parsers.js';
import * as dates from '../common/dates.js';
import * as panels from './panels.js';
import * as capacity from './capacity-validation.js';
import * as dateSelect from './date-select.js';
import * as periodSelect from './period-select.js';
import * as typeInput from './type-input.js';
import * as studentInput from './student-input.js';
import * as interventionTeacherSelect from './interventions-teacher-select.js';
import * as studySelect from './study-select.js';
import * as subjectSelect from './subject-select.js';
import * as glassRoomsInput from './glass-rooms-input.js';
import * as scheduleRules from './schedule-rules.js';
import * as formData from './form-data.js';
import { store } from './store.js';
import { DEBUG } from "../common/debug.js";

/**
 * Registers all UI observers/subscribers to listen to store updates.
 */
export const initObservers = () => {
  dateSelect.setupDateSelectObserver('#date');
  periodSelect.setupPeriodOptionsObserver();
  periodSelect.setupPeriodValueObserver();
  typeInput.setupTypeInputObserver();
  panels.setupPanelsObserver();
  glassRoomsInput.setupGlassRoomsObserver();
  studySelect.setupStudyOptionsObserver();
  studySelect.setupStudySelectValueObserver();
  subjectSelect.setupSubjectOptionsObserver();
  subjectSelect.setupSubjectValueObserver();
  interventionTeacherSelect.setupInterventionTeacherObserver();
  studentInput.setupStudentInputObserver();
  scheduleRules.setupScheduleRulesObserver();
  capacity.setupCapacityValidationObserver();
};

// builds page based on existing schedules and settings
export const initializeApp = async () => {
  messaging.showLoadingModal('Retrieving data');
  initObservers();

  try {
    const rawData = await getServerData();
    const parsedData = parseServerData(rawData);

    store.setState(parsedData);

    await initializeUi();
    bindEvents();
  } catch (error) {
    messaging.processError(error, 'Failed to initialize app:');
  }

  messaging.hideLoadingModal();
}

const getServerData = async () => {
  if (DEBUG) {
    return await setMockData(parseServerData);
  } else {
  return new Promise((resolve, reject) => {
    google.script.run
      .withFailureHandler(reject)
      .withSuccessHandler(resolve)
      .getInitialSignupFormData();
    });
  }
};

function parseServerData(data) {
  const students = parser.parseStudents(data.students)
  const defaultMax = parser.parseMaxSignups(data.defaultMaxSignups);
  const today = new Date();
  const initialDateStr = dates.toDateInputValue(today);

  return {
    students,
    studentNames: parser.parseStudentNames(students),
    dailySchedules: parser.parseDailySchedules(data.dailySchedules),
    signups: parser.parseSignups(data.signups),
    interventionTeachers: parser.parseInterventionTeachers(data.interventionTeachers),
    studyTeachers: parser.parseStudyTeachers(data.studyTeachers),
    noFlyList: parser.parseNoFlyList(data.noFlyList),
    currentMax: defaultMax,
    currentDate: initialDateStr,
    currentPeriod: null,
    currentType: 'Non-intervention',
    currentStudyTeacher: null,
    currentSubject: null,
    currentStudentName: '',
    currentEmail: dom.valueOf('input#email') || '',
    isStaff: dom.valueOf('input#email')?.indexOf('@walpole.k12.ma.us') > 0,
    isAdmin: dom.valueOf('#is-admin') === 'true',
    isEditor: dom.valueOf('#is-editor') === 'true', 
  };
}

export const initializeUi = async () => {
  const state = store.getState();
  await setUpdateStatus();

  formData.preventFormSubmit();
  setTooltips('[data-bs-toggle="tooltip"]');
  toggleStaffOnlyViews(state.isStaff);
  toggleAdminOnlyViews(state.isAdmin);

  // sets limits on dates allowed in Date field
  const today = new Date();
  dateSelect.configureDateSelect(
    '#date',
    dates.toDateInputValue(new Date(today.getTime() - 14 * 86400000)),
    dates.toDateInputValue(new Date(today.getTime() + 14 * 86400000)),
    state.currentDate
  );

  // Toggle static URL links
  typeInput.toggleInterventionsLink();
  typeInput.toggleTutoringLink();
};

function bindEvents() {
  dom.addEventListener("#date", "change", (e) => dateSelect.dateChangeHandler(e));
  dom.addEventListener("#period", "change", (e) => periodSelect.periodChangeHandler(e));
  dom.addEventListener("input[name='signup-type'], .purpose", "change", (e) => typeInput.typeChangeHandler(e));
  dom.addEventListener("#study-teacher-select", "change", (e) => studySelect.studyTeacherChangeHandler(e));
  dom.addEventListener("#subject-int-select", "change", (e) => subjectSelect.subjectChangeHandler(e));
  dom.addEventListener(".student-autocomplete", "input", (e) => studentInput.studentInputChangeHandler(e));
  dom.addEventListener('#btn-submit, #btn-update', 'click', () => formData.submitForm());
  dom.addEventListener('.success-box-start-over', 'click', () => formData.startOver());
}

export const toggleStaffOnlyViews = (isStaff) => {
  dom.setVisible('.staff-only', isStaff);
};

export const toggleAdminOnlyViews = (isAdmin) => {
  dom.setVisible('.admin-only', isAdmin);
};

export const toggleEditorOnlyViews = (isEditor) => {
  dom.setVisible('.editors-only', isEditor);
};

/**
 * Checks to see if the URL sent a row id. If so, this form is to update existing data
 * rather than submit new data
 * */
export const setUpdateStatus = async () => {
  // requires that user is an editor and that and update row was provided
  const updateRowId = dom.valueOf('#update-row-id');
  const state = store.getState();

  if (!state.isEditor || !updateRowId) {
    return;
  }

  store.setState({ updateRowId });

  dom.setDisabled('#email', !state.isEditor);
  toggleEditorOnlyViews(state.isEditor);
  dom.setVisible('#btn-submit', false);
  dom.setVisible('#btn-update', true);

  // requests the signup data for this row id
  try {
    const updateData = await new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .getSignupByRow(updateRowId);
    });
    store.setState({ updateData });
  } catch (error) {
    messaging.processError(error, "Failed to retrieve data for udpate:");
  }
};


export const setTooltips = (selector) => {
  const tooltipTriggerList = dom.qsa(selector);
  [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
};


async function setMockData() {
  dom.setValue('#email', 'wpsdeveloper@walpole.k12.ma.us');
  dom.setValue('#update-row-id', '');
  dom.setValue('#is-admin', 'true');
  dom.setValue('#is-editor', 'true'); 
  dom.setValue("#wed-int-active", "true");
  toggleStaffOnlyViews(true);
  toggleAdminOnlyViews(true);

  const sampleData = await import('../../sampledata.js');
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  return sampleData.signupData;
}


