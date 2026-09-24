import * as dom from '../common/dom';
import * as messaging from '../common/messaging';
import * as parser from '../common/parsers';
import * as dates from '../common/dates';
import * as panels from './panels';
import * as capacity from './capacity-validation';
import * as dateSelect from './date-select';
import * as periodSelect from '../common/period-select';
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
    messaging.processError((error as Error), 'Failed to initialize app:');
  }

  messaging.hideLoadingModal();
}

// Registers all UI observers/subscribers to listen to store updates.
export const initObservers = () => {
  studentInput.setupStudentInputObserver();
  
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

const getServerData = async (): Promise<string> => {
  if (IS_DEBUG) {
    return await getMockData('signup');
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
  const parsedData = parser.safeJsonParse(data);
  const students = parsedData.students;
  const studentNames = parser.parseStudentDataList(students);
  const dailySchedules = parser.parseDailyBlocks(parsedData.dailySchedules);
  const signups = parser.parseSignups(parsedData.signups);
  const settings = parser.parseSettings(parsedData.settings); 
  const updateData = parsedData.updateData ? parser.safeJsonParse(parsedData.updateData) : null;

  const defaultMaxSetting = settings.find(s => s.key === "Max_Signups_Default");
  const defaultMax = defaultMaxSetting?.value as number ?? 10;
  const appConfig = getAppConfig()

  return {
    students, studentNames, dailySchedules, signups, settings,
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
    updateData: updateData,
    updateRowId: null,
  };
}

export const initializeUi = async () => {
  const { isStaff, isAdmin, currentDate, currentEmail } = store.getState();
  
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
  updateScriptLinks();
  await setUpdateStatus();
};

function bindEvents() {
  dom.addEventListener("#date", "change", (e) => dateSelect.dateChangeHandler(e as MouseEvent));
  dom.addEventListener("#period", "change", (e) => periodSelect.periodChangeHandler(e as MouseEvent));
  dom.addEventListener("#type-select, .purpose", "change", (e) => typeInput.typeChangeHandler(e as MouseEvent));
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
    const currentPeriod = state.currentPeriod;
    const currentDate = state.currentDate;
    if (!currentPeriod || !currentDate) return;

    const dailyScheduleBlocks = state.dailySchedules;

    const newCurrentBlock = dailyScheduleBlocks.find(
      (block: any) => block.period === currentPeriod && dates.isSameDate(block.date, currentDate)
    ) ?? null;
    store.setState({currentScheduleBlock: newCurrentBlock });

  }, ['currentPeriod', 'currentDate']);
}





