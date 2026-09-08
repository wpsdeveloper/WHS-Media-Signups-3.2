import * as dom from './dom.js';
import * as messaging from './messaging.js';
import * as ui from './ui.js';
import * as parser from './parsers.js';
import * as dates from './dates.js';

export const initializeApp = (state) => {
  bindEvents(state);
  getInitialData(state);
}

const getInitialData = async (state) => {
  messaging.showLoadingModal('Retrieving data');

  const url = window.location.href;
  if (url.indexOf('localhost') >= 0 || url.indexOf('127.0.0.1') >= 0) {
    try {
      await setMockData(state, parseInitialData);
    } catch (error) {
      console.error(error);
      messaging.processError(error);
    }
  } else {
    google.script.run
      .withFailureHandler(messaging.processError)
      .withSuccessHandler((serverData) => parseInitialData(serverData, state))
      .getInitialSignupFormData();
  }
};

function parseInitialData(data, state) {
  // console.log(data);
  state.students = parser.parseStudents(data.students);
  state.studentNames = parser.parseStudentNames(state.students);
  state.dailySchedules = parser.parseDailySchedules(data.dailySchedules);
  state.signups = parser.parseSignups(data.signups);
  state.interventionTeachers = parser.parseInterventionTeachers(
    data.interventionTeachers,
  );
  state.studyTeachers = parser.parseStudyTeachers(data.studyTeachers);
  state.noFlyList = parser.parseNoFlyList(data.noFlyList);
  state.defaultMax = parser.parseMaxSignups(data.defaultMaxSignups);
  state.currentMax = state.defaultMax;

  messaging.hideLoadingModal();

  
  if (state.updateData !== null) {
    populateData(state.updateData);
  }

  initializeUi(state);
}

export const initializeUi = (state) => {
  // formats names for use in typeahed feature
  ui.initializeStudentDatalist(state.studentNames);

  ui.showIntTeacherAltInput(state.interventionTeachers?.length === 0);
  ui.showStudyAltInput(state.studyTeachers?.length === 0);

  const today = new Date();
  ui.configureDateInput(
    '#date',
    dates.toDateInputValue(new Date(today.getTime() - 14 * 86400000)),
    dates.toDateInputValue(new Date(today.getTime() + 14 * 86400000)),
    dates.toDateInputValue(today),
  );

  ui.setTooltips('[data-bs-toggle="tooltip"]');

  dom.setVisible(
    '.int-link',
    (dom.getAttribute('.int-link', 'href') || '').length > 58,
  );
  dom.setVisible('.tut-link', (dom.getAttribute('href') || '').length > 58);

  checkStaffStatus(state);
  checkAdminStatus(state);

  setUpdateStatus(state);

  ui.updateTypeOptions(state);
  ui.updateDetailsPanel(state.dailySchedules);
  ui.updateStudyList(state);
  ui.updateSubjectList(state.interventionTeachers, state.dailySchedules);
  ui.updatePeriodList(state.dailySchedules);
  ui.updateGlassRooms(state.signups);
  ui.checkFull(state.signups, state.currentMax);
};

export const bindEvents = (state) => {
  dom.addEventListener('input[name="signup-type"]', 'change', () => ui.typeChanged(state));
  dom.addEventListener('#date', 'change', () => ui.dateChanged(state));
  dom.addEventListener('#period', 'change', () => ui.periodChanged(state));
  dom.addEventListener('#btn-submit, #btn-update', 'click', () => ui.submitForm(state));
  // if (events.submitForm) dom.addEventListener('#btn-update', 'click', ui.submitForm);
  dom.addEventListener('.success-box-start-over', 'click',ui.startOver);
};

/**
 * Sets up the page based on whether the current user is student or staff
 */
export const checkStaffStatus = (state) => {
  state.isStaff = dom.valueOf('input#email')?.indexOf('@walpole.k12.ma.us') > 0;
  dom.setVisible('.staff-only', state.isStaff);
};

/**
 * Sets up the page based on whether the current user is admin
 */
export const checkAdminStatus = (state) => {
  state.isAdmin = dom.valueOf('#is-admin') === 'true';
  dom.setVisible('.admin-only', state.isAdmin);
};

/**
 *  Checks to see if the URL sent a row id. If so, this form is to update existing data
 * rather than submit new data
 * */
export const setUpdateStatus = (state, successCallback, errorCallback) => {
  // requires that user is an editor and that and update row was provided
  state.isEditor = dom.valueOf('#is-editor') === 'true';
  state.updateRowId = dom.valueOf('#update-row-id');

  // allow editors to edit the email field
  dom.setDisabled('#email', !state.isEditor);

  // hide any elements that aren't for editors
  dom.setVisible('.editors-only', state.isEditor);

  if (!state.isEditor || state.updateRowId === '') {
    return;
  }

  // swap the submit button for an update button
  dom.setVisible('#btn-submit', false);
  dom.setVisible('#btn-update', true);

  // requests the signup data for this row id
  google.script.run
    .withSuccessHandler((serverData) =>
      ui.updateDetailsPanel(serverData, state),
    )
    .withFailureHandler(messaging.processError)
    .getSignupByRow(state.updateRowId);
};

async function setMockData(state, callback) {
  dom.setValue('#email', 'wpsdeveloper@walpole.k12.ma.us');
  dom.setValue('#update-row-id', '');
  state.isStaff = true;
  state.isEditor = true;
  state.isAdmin = true;
  checkStaffStatus(state);
  checkAdminStatus(state);

  const sampleData = await import('../../sampledata.js');
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  callback(sampleData.default, state);
}
