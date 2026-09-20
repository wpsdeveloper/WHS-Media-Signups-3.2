import * as dom from '../common/dom';
import * as messaging from '../common/messaging';
import * as parser from '../common/parsers';
import * as dates from '../common/dates';
import * as panels from './panels';
import * as capacity from './capacity-validation';
import * as dateSelect from './date-select';
import * as periodSelect from '../common/period-select';
import * as typeInput from './type-input';
import * as studentInput from '../common/student-input';
import * as interventionTeacherSelect from './interventions-teacher-select';
import * as studySelect from './study-select';
import * as subjectSelect from './subject-select';
import * as glassRoomsInput from './glass-rooms-input';
import * as scheduleRules from './schedule-rules';
import * as formData from './form-data';
import { getAppConfig } from '../common/app-config';
import { SignupState, store } from './signup-store';
import { DEBUG } from "../common/debug";


// builds page based on existing schedules and settings
export const initializeApp = async () => {
  messaging.showLoadingModal('Retrieving data');
  initObservers();
  
  try {
    const rawData = await getServerData();
    debugger;
    const parsedData = parseServerData(rawData);
    console.log('Parsed data:', parsedData);

    store.setState(parsedData);

    await initializeUi();
    bindEvents();
  } catch (error) {
    messaging.processError((error as Error), 'Failed to initialize app:');
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


const getServerData = async (): Promise<string> => {
  if (DEBUG) {
    return await setMockData();
  } else {
  return new Promise((resolve, reject) => {
    google.script.run
      .withFailureHandler(reject)
      .withSuccessHandler(resolve)
      .getInitialSignupData();
    });
  }
};

function parseServerData(data: string): SignupState {
  console.log('data', data);
  const parsedData = parser.safeJsonParse(data);
  const students = parsedData.students;
  const defaultMax = 10; //parsedData.appSettings.defaultMax;
  const appConfig = getAppConfig()

  return {
    students,
    studentNames: parser.parseStudentDataList(students),
    dailySchedules: parsedData.dailySchedules,
    signups: parsedData.signups,
    settings: parsedData.settings,
    defaultMax: defaultMax,
    currentMax: defaultMax,
    currentDate: new Date(),
    currentPeriod: null,
    currentType: 'Non-intervention',
    currentStudyTeacher: null,
    currentInterventionTeacher: null,
    currentScheduleBlock: null,
    currentSubject: '',
    currentStudentName: '',
    currentEmail: appConfig.email,
    isStaff: appConfig.isStaff,
    isAdmin: appConfig.isAdmin,
    isEditor: appConfig.isEditor, 
    updateData: null,
    updateRowId: null,
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
    dates.toDateInputValue(today),
  );

  dom.setValue("#email", currentEmail);

  // Toggle static URL links
  typeInput.toggleInterventionsLink();
  typeInput.toggleTutoringLink();
};

function bindEvents() {
  dom.addEventListener("#date", "change", (e) => dateSelect.dateChangeHandler(e as MouseEvent));
  dom.addEventListener("#period", "change", (e) => periodSelect.periodChangeHandler(e as MouseEvent));
  dom.addEventListener("input[name='signup-type'], .purpose", "change", (e) => typeInput.typeChangeHandler(e as MouseEvent));
  dom.addEventListener("#study-teacher-select", "change", (e) => studySelect.studyTeacherChangeHandler(e as MouseEvent));
  dom.addEventListener("#subject-int-select", "change", (e) => subjectSelect.subjectChangeHandler(e as MouseEvent));
  dom.addEventListener(".student-autocomplete", "input", (e) => studentInput.studentInputChangeHandler(e as InputEvent));
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
    const updateDataJson = await new Promise<string>((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .getSignupByRow(updateRowId);
    });
    const updateData: Signup = parser.safeJsonParse(updateDataJson);
    store.setState({updateData });
    dom.setVisible('#btn-submit', true);
    dom.setVisible('#btn-update', false);

  } catch (error) {
    messaging.processError((error as Error), "Failed to retrieve data for udpate:");
  }
};


export const setTooltips = (selector: string) => {
  const tooltipTriggerList = dom.qsa(selector);
  [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
};


async function setMockData(): Promise<string> {
  dom.setValue('#email', 'wpsdeveloper@walpole.k12.ma.us');
  dom.setValue('#update-row-id', '');
  dom.setValue('#is-admin', 'true');
  dom.setValue('#is-editor', 'true'); 
  dom.setValue("#wed-int-active", "true");
  dom.toggleStaffOnlyViews(true);
  dom.toggleAdminOnlyViews(true);

  const sampleData = await import('../../sampledata');
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  return JSON.stringify(sampleData.signupData);
}




