import * as dom from '../common/dom';
import * as messaging from '../common/messaging';
import * as parser from '../common/parsers';
import * as dates from '../common/dates';
import * as panels from './panels';
import * as capacity from './capacity-validation';
import * as dateSelect from './date-select';
import * as periodSelect from './period-select';
import * as typeInput from './type-select';
import * as studentInput from './student-input';
import * as interventionTeacherSelect from './interventions-teacher-select';
import * as studySelect from './study-select';
import * as subjectSelect from './subject-select';
import * as glassRoomsInput from './glass-rooms-input';
import * as formData from './form-data';
import { getAppConfig, updateScriptLinks } from '../common/app-config';
import { SignupState, store, registerUpdateData } from './signup-store';
import { IS_DEBUG, getMockData } from "../common/debug";

/**
 * Initializes the signup application. 
 * Sets up state observers, fetches initial data from the server, 
 * binds DOM events, and configures the UI based on user permissions.
 * 
 * @returns {Promise<void>} Resolves when initialization is complete.
 */
export const initializeApp = async (): Promise<void> => {
  try {
    initObservers();
    await refreshData();
    bindEvents();
    initializeUi();
  } catch (error) {
    messaging.processError(error as Error, 'Failed to initialize app:');
  } finally {
    messaging.hideLoadingModal();
  }
}

/**
 * Registers all UI observers/subscribers to listen to store updates.
 * These observers automatically update the DOM when the corresponding state changes.
 * 
 * @returns {void}
 */
export const initObservers = (): void => {
  setupDailyScheduleBlocksObserver();
  dateSelect.setupDateObserver();
  periodSelect.setupPeriodObservers();
  
  typeInput.setupTypeInputObserver();
  panels.setupPanelsObserver();
  
  interventionTeacherSelect.setupInterventionTeacherObserver();
  studySelect.setupStudyObservers();
  subjectSelect.setupSubjectObservers();
  glassRoomsInput.setupGlassRoomsObserver();
  
  capacity.setupCapacityValidationObserver();
};

/**
 * Fetches and parses the initial signup data from the server.
 * 
 * @returns {Promise<SignupState>} A promise resolving to the parsed application state.
 */
async function fetchServerData(): Promise<SignupState> {
  const rawServerData = await getServerData();
  return await parseServerData(rawServerData);
}

/**
 * Retrieves the raw JSON string of the application data from the server environment.
 * If in debug mode, retrieves mock data. If data is pre-injected in the DOM, uses that instead.
 * 
 * @returns {Promise<string>} A promise resolving to the raw JSON data string.
 */
const getServerData = async (): Promise<string> => {
  if (IS_DEBUG) {
    return await getMockData('signup');
  }

  // Use pre-injected server payload from doGet if available
  if (typeof window !== 'undefined' && window.INITIAL_DATA) {
    const data = window.INITIAL_DATA;
    window.INITIAL_DATA = null; // consume once so manual refreshes re-query
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  return new Promise((resolve, reject) => {
    google.script.run
      .withFailureHandler(reject)
      .withSuccessHandler(resolve)
      .getInitialSignupData();
  });
};

async function parseServerData(data: string): Promise<SignupState> {
  const parsedData = parser.safeJsonParse(data);
  const students = parsedData.students;
  const studentNames = parser.parseStudentDataList(students);
  const dailySchedules = parser.parseDailyBlocks(parsedData.dailySchedules);
  const signups = parser.parseSignups(parsedData.signups);
  const settings = parser.parseSettings(parsedData.settings); 
  const updateData = parsedData.updateData ? parser.safeJsonParse(parsedData.updateData) : null;

  const defaultMaxSetting = settings.find(s => s.key === "Max_Signups_Default");
  const defaultMax = defaultMaxSetting?.value as number ?? 10;
  const appConfig = await getAppConfig();

  return {
    appConfig,
    students, studentNames, dailySchedules, signups, settings,
    defaultMax: defaultMax,
    ui_currentMax: defaultMax,
    ui_currentDate: new Date(),
    ui_currentPeriod: null,
    ui_currentType: 'Non-intervention',
    ui_currentStudyTeacher: null,
    ui_currentInterventionTeacher: null,
    ui_currentScheduleBlock: null,
    ui_currentSubject: '',
    ui_currentStudentName: '',
    ui_currentEmail: appConfig.email,
    isStaff: appConfig.isStaff,
    isAdmin: appConfig.isAdmin,
    isEditor: appConfig.isEditor, 
    updateData: updateData,
    updateRowId: appConfig.updateId || "",
  };
}

export const initializeUi = () => {
  const { isStaff, isAdmin, ui_currentDate: currentDate, ui_currentEmail: currentEmail } = store.getState();
  
  setTooltips('[data-bs-toggle="tooltip"]');
  dom.toggleStaffOnlyViews(isStaff);
  dom.toggleAdminOnlyViews(isAdmin);
  
  // sets limits on dates allowed in Date field
  dateSelect.initDateInput();
  
  dom.setValue("#email", currentEmail);
  
  // Toggle static URL links
  typeInput.toggleInterventionsLink();
  typeInput.toggleTutoringLink();
  updateScriptLinks();
  setUpdateStatus();
};

function bindEvents() {
  dom.addEventListener("#date", "change", (e) => dateSelect.dateChangeHandler());
  dom.addEventListener("#period", "change", (e) => periodSelect.periodChangeHandler(e as MouseEvent));
  dom.addEventListener("#type-select, .purpose", "change", (e) => typeInput.typeChangeHandler(e as MouseEvent));
  dom.addEventListener("#study-teacher-select, #study-teacher-input", "change", (e) => studySelect.studyTeacherChangeHandler(e));
  dom.addEventListener("#study-teacher-input", "input", (e) => studySelect.studyTeacherChangeHandler(e));
  dom.addEventListener("#subject-int-select, #subject-int-input, #subject-non-int", "change", (e) => subjectSelect.subjectChangeHandler(e));
  dom.addEventListener("#subject-int-input", "input", (e) => subjectSelect.subjectChangeHandler(e));
  dom.addEventListener(".student-autocomplete", "input", (e) => studentInput.studentInputChangeHandler(e));
  dom.addEventListener(".student-autocomplete", "change", (e) => studentInput.studentInputChangeHandler(e));
  dom.addEventListener("#student-clear-btn", "click", () => studentInput.clearStudentInput());
  dom.addEventListener('#btn-submit, #btn-update', 'click', () => formData.submitForm());
  dom.addEventListener('.success-box-start-over', 'click', () => formData.startOver());
}

export const refreshData = async () => {
  messaging.showLoadingModal('Retrieving data');

  try {
    const serverData = await fetchServerData();
    store.setState({ ...serverData });
  } catch (error) {
    messaging.processError(error as Error, 'Failed to initialize app:');
  }

  messaging.hideLoadingModal();
}

/**
 * Checks to see if the URL sent a row id. If so, this form is to update existing data
 * rather than submit new data
 * */
export const setUpdateStatus = () => {
  // requires that user is an editor and that and update row was provided
  const state = store.getState();
  const isEditor = state.isEditor;
  const updateData = state.updateData;

  if (!isEditor || !updateData) {
    return;
  }

  dom.setDisabled('#email', !isEditor);
  dom.toggleEditorOnlyViews(isEditor);
  dom.setVisible('#btn-submit', false);
  dom.setVisible('#btn-update', true);

  registerUpdateData(updateData);
};


export const setTooltips = (selector: string) => {
  const tooltipTriggerList = dom.qsa(selector);
  [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
};


const setupDailyScheduleBlocksObserver = () => {
  store.subscribe((state: SignupState) => {
    const currentPeriod = state.ui_currentPeriod;
    const currentDate = state.ui_currentDate;
    if (!currentPeriod || !currentDate) return;

    const dailyScheduleBlocks = state.dailySchedules;

    const newCurrentBlock = dailyScheduleBlocks.find(
      (block: any) => block.period === currentPeriod && dates.isSameDate(block.date, currentDate)
    ) ?? null;
    store.setState({ui_currentScheduleBlock: newCurrentBlock });

  }, ['ui_currentPeriod', 'ui_currentDate']);
}





