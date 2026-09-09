import * as dom from './dom.js';
import * as messaging from './messaging.js';
import * as parser from './parsers.js';
import * as dates from './dates.js';
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
import * as formData from './form-data.js';

export const initializeApp = async (state) => {
  messaging.showLoadingModal('Retrieving data');
  try {
    const rawData = await getInitialData();
    parseInitialData(rawData, state);
    initializeUi(state);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    messaging.processError(error);
  }
  messaging.hideLoadingModal();
}

const getInitialData = async () => {
  const url = window.location.href;
  if (url.indexOf('localhost') >= 0 || url.indexOf('127.0.0.1') >= 0) {
    return await setMockData(parseInitialData);
  } else {
  return new Promise((resolve, reject) => {
    google.script.run
      .withFailureHandler(reject)
      .withSuccessHandler(resolve)
      .getInitialSignupFormData();
    });
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
  state.isStaff = dom.valueOf('input#email')?.indexOf('@walpole.k12.ma.us') > 0;
  state.isAdmin = dom.valueOf('#is-admin') === 'true';
  state.isEditor = dom.valueOf('#is-editor') === 'true'; 
}

export const initializeUi = (state) => {
  if (state.updateData !== null) {
    populateData(state.updateData);
  }

  formData.preventFormSubmit();

  // formats names for use in typeahed feature
  studentInput.initializeStudentDatalist(state.studentNames);
  
  interventionTeacherSelect.toggleIntTeacherAltInput(state.interventionTeachers?.length === 0);
  studySelect.showStudyAltInput(state.studyTeachers?.length === 0);
  
  const today = new Date();
  dateSelect.configureDateSelect(
    '#date',
    dates.toDateInputValue(new Date(today.getTime() - 14 * 86400000)),
    dates.toDateInputValue(new Date(today.getTime() + 14 * 86400000)),
    dates.toDateInputValue(today),
  );

  setTooltips('[data-bs-toggle="tooltip"]');
  toggleStaffOnlyViews(state.isStaff);
  toggleAdminOnlyViews(state.isAdmin);

  setUpdateStatus(state);
  
  typeInput.toggleInterventionsLink();
  typeInput.toggleTutoringLink();
  typeInput.updateTypeOptions(state);

  panels.updateDetailsPanel(state.dailySchedules);

  periodSelect.updatePeriodOptions(state.dailySchedules);
  studySelect.updateStudyOptions(state);
  subjectSelect.updateSubjectOptions(state.interventionTeachers, state.dailySchedules);
  
  glassRoomsInput.updateGlassRooms(state.signups);
  
  capacity.checkFull(state.signups, state.currentMax);
};

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
 *  Checks to see if the URL sent a row id. If so, this form is to update existing data
 * rather than submit new data
 * */
export const setUpdateStatus = (state, successCallback, errorCallback) => {
  // requires that user is an editor and that and update row was provided

  state.updateRowId = dom.valueOf('#update-row-id');

  if (!state.isEditor || state.updateRowId === '') {
    return;
  }

  // allow editors to edit the email field
  dom.setDisabled('#email', !state.isEditor);

  // hide any elements that aren't for editors
  toggleEditorOnlyViews(state.isEditor);


  // swap the submit button for an update button
  dom.setVisible('#btn-submit', false);
  dom.setVisible('#btn-update', true);

  // requests the signup data for this row id
  google.script.run
    .withSuccessHandler((serverData) =>
      panels.updateDetailsPanel(serverData, state),
    )
    .withFailureHandler(messaging.processError)
    .getSignupByRow(state.updateRowId);
};


export const setTooltips = (selector) => {
  const tooltipTriggerList = dom.$$(selector);
  [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
};


async function setMockData() {
  dom.setValue('#email', 'wpsdeveloper@walpole.k12.ma.us');
  dom.setValue('#update-row-id', '');
  dom.valueOf('#is-admin', 'true');
  dom.valueOf('#is-editor', 'true'); 
  toggleStaffOnlyViews(true);
  toggleAdminOnlyViews(true);

  const sampleData = await import('../../sampledata.js');
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  return sampleData.default;
}
