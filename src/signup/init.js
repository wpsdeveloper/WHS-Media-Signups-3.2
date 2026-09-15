import * as dom from '../common/dom.js';
import * as messaging from '../common/messaging.js';
import * as parser from '../common/parsers.js';
import * as dates from '../common/dates.js';
import * as panels from './panels.js';
import * as capacity from './capacity-validation.js';
import * as dateSelect from './date-select.js';
import * as periodSelect from './period-select.js';
import * as typeInput from './type-input.js';
import * as studentInput from '../common/student-input.js';
import * as interventionTeacherSelect from './interventions-teacher-select.js';
import * as studySelect from './study-select.js';
import * as subjectSelect from './subject-select.js';
import * as glassRoomsInput from './glass-rooms-input.js';
import * as scheduleRules from './schedule-rules.js';
import * as formData from './form-data.js';
import { store } from '../common/store.js';
import { DEBUG } from "../common/debug.js";


// builds page based on existing schedules and settings
export const initializeApp = async () => {
  messaging.showLoadingModal('Retrieving data');
  store.initialize(storeInitialData);
  initObservers();

  try {
    const rawData = await getServerData();
    const parsedData = parseServerData(rawData);

    store.setState(parsedData);
    console.log(store.getState());

    await initializeUi();
    bindEvents();
  } catch (error) {
    messaging.processError(error, 'Failed to initialize app:');
  }

  messaging.hideLoadingModal();
}

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
    currentEmail: APP_CONFIG.email,
    isStaff: APP_CONFIG.isStaff,
    isAdmin: APP_CONFIG.isAdmin,
    isEditor: APP_CONFIG.isEditor, 
  };
}

export const initializeUi = async () => {
  const { isStaff, isAdmin, currentDate, currentEmail } = store.getState();
  await setUpdateStatus();

  setTooltips('[data-bs-toggle="tooltip"]');
  dom.toggleStaffOnlyViews(isStaff);
  dom.toggleAdminOnlyViews(isAdmin);

  // sets limits on dates allowed in Date field
  const today = new Date();
  dateSelect.configureDateSelect(
    '#date',
    dates.toDateInputValue(new Date(today.getTime() - 14 * 86400000)),
    dates.toDateInputValue(new Date(today.getTime() + 14 * 86400000)),
    currentDate
  );

  dom.setValue("#email", currentEmail);

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
  dom.toggleEditorOnlyViews(state.isEditor);
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
  dom.toggleStaffOnlyViews(true);
  dom.toggleAdminOnlyViews(true);

  const sampleData = await import('../../sampledata.js');
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  return sampleData.signupData;
}

const storeInitialData = {
  students: [],
  studentNames: [],
  dailySchedules: [],
  interventionTeachers: {},
  studyTeachers: {},
  signups: [],
  noFlyList: [],

  isStaff: false,
  isEditor: false,
  isAdmin: false,
  updateRowId: null,
  updateData: null,
  defaultMax: 15,
  currentMax: 15,

  currentDate: null,
  currentPeriod: null,
  currentType: null,
  currentStudyTeacher: null,
  currentSubject: null,
  currentStudentName: "",
  currentMax: null,
  currentEmail: "",
};


