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
import { getState, setState } from './state.js';

// builds page based on existing schedules and settings
export const initializeApp = async () => {
  messaging.showLoadingModal('Retrieving data');
  panels.updateDetailsPanel();

  try {
    const rawData = await getServerData();
    const parsedData = parseServerData(rawData);
    setState(parsedData);
    initializeUi(getState());
  } catch (error) {
    messaging.processError(error, 'Failed to initialize app:');
  }

  messaging.hideLoadingModal();
}

const getServerData = async () => {
  //assume debugging if page is served locally
  const url = window.location.href;
  const debug = (url.indexOf('localhost') >= 0 || url.indexOf('127.0.0.1') >= 0);
  
  if (debug) {
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

  return {
    students,
    studentNames: parser.parseStudentNames(  students),
    dailySchedules: parser.parseDailySchedules(data.dailySchedules),
    signups: parser.parseSignups(data.signups),
    interventionTeachers: parser.parseInterventionTeachers(
      data.interventionTeachers,
    ),
    studyTeachers: parser.parseStudyTeachers(data.studyTeachers),
    noFlyList: parser.parseNoFlyList(data.noFlyList),
    currentMax:  defaultMax,
    isStaff: dom.valueOf('input#email')?.indexOf('@walpole.k12.ma.us') > 0,
    isAdmin: dom.valueOf('#is-admin') === 'true',
    isEditor: dom.valueOf('#is-editor') === 'true', 
  };
}

export const initializeUi = () => {
  const state = getState();
  setUpdateStatus(state);
  if (state.updateData !== null) {
    populateData(state.updateData);
  }

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
    dates.toDateInputValue(today),
  );
  
  // formats names for use in typeahead-like feature
  studentInput.initializeStudentDatalist();
  
  // shows text inputs if no list of teachers is available
  interventionTeacherSelect.toggleIntTeacherAltInput();
  studySelect.showStudyAltInput();
  
  // show/hides url links based on whether sent from the server
  typeInput.toggleInterventionsLink();
  typeInput.toggleTutoringLink();

  typeInput.updateTypeOptions();
  panels.updateDetailsPanel();
  
  periodSelect.updatePeriodOptions();
  studySelect.updateStudyOptions();
  subjectSelect.updateSubjectOptions();
  glassRoomsInput.updateGlassRooms();
  
  capacity.checkFull();
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
 * Checks to see if the URL sent a row id. If so, this form is to update existing data
 * rather than submit new data
 * */
export const setUpdateStatus = async () => {
  const state = getState();

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
  try {
    const serverData = await new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .getSignupByRow(state.updateRowId);
      panels.updateDetailsPanel(serverData, state);
    });
  } catch (error) {
    messaging.processError(error, "Failed to retrieve data for udpate:");
  }
};


export const setTooltips = (selector) => {
  const tooltipTriggerList = dom.$$(selector);
  [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
};


async function setMockData() {
  dom.setValue('#email', 'wpsdeveloper@walpole.k12.ma.us');
  // dom.setValue('#email', 'zzdemow23@wpsma.org');
  dom.setValue('#update-row-id', '');
  dom.setValue('#is-admin', 'true');
  dom.setValue('#is-editor', 'true'); 
  dom.setValue("#wed-int-active", "true");
  toggleStaffOnlyViews(true);
  toggleAdminOnlyViews(true);

  const sampleData = await import('../../sampledata.js');
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  return sampleData.default;
}


