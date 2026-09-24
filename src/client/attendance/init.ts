import * as dom from '../common/dom';
import * as messaging from '../common/messaging';
import * as parser from '../common/parsers';
import * as dates from '../common/dates';
import * as dataTable from "./attendance-data-table";
import * as glassRooms from './glass-rooms-status';
import * as studySelect from './study-select';
import { AttendanceStateRaw, AttendanceState, store } from "./attendance-store";
import { AppConfig, getAppConfig } from '../common/app-config';
import { AttendanceDataRow } from './attendance-data-row';
import { IS_DEBUG, getMockData } from '../common/debug';

// builds page based on existing schedules and settings
export const initializeApp = async () => {
  try {
    dataTable.initObservers();
    glassRooms.setupGlassRoomsObserver();
    studySelect.setupStudyObservers();
    bindEvents();
    
    await refreshData();
  } catch (error) {
    messaging.processError(error as Error, 'Failed to initialize app:');
    messaging.hideLoadingModal();
  }
}

const getServerData = async (): Promise<string> => {
  if (IS_DEBUG) {
    return await getMockData('attendance');
  } 

  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      .getInitialAttendanceData();
  });
};

function parseServerData(data: string): Partial<AttendanceState> {
  const parsedData = parser.safeJsonParse(data);
  const signups = parser.parseSignups(parsedData.signups);
  const dailySchedules = parser.parseDailyBlocks(parsedData.dailySchedules);
  const appConfig = getAppConfig()

  return {
    signups, dailySchedules, 
    currentEmail: appConfig.email,
    isStaff: appConfig.isStaff,
    isAdmin: appConfig.isAdmin,
    isEditor: appConfig.isEditor, 
  };
}

function initDateInput() {
  const dateInput = dom.qs(".date-input") as HTMLInputElement;
  const today = new Date();
  const toDateValue = (dateVal: Date) => dateVal.toISOString().slice(0, 10);
  if (dateInput) {
    const minDate = new Date(today);
    const maxDate = new Date(today);
    minDate.setDate(today.getDate() - 14);
    maxDate.setDate(today.getDate() + 7);
    dateInput.type = "date";
    dateInput.min = toDateValue(minDate);
    dateInput.max = toDateValue(maxDate);
    dateInput.value = toDateValue(today);
  }
}


function bindEvents() {
  dom.addEventListener("#date", "change", (e) => dataTable.dateChangeHandler());
  dom.addEventListener("#period", "change", (e) => dataTable.periodChangeHandler());
  dom.addEventListener("#study-select", "change", (e) => studySelect.studyTeacherChangeHandler(e as MouseEvent));
  dom.addEventListener(".attendance-panel-link", "click", (e) => dataTable.showAttendance());
  dom.addEventListener(".details-panel-link", "click", (e) => dataTable.showSignupInfo());
  dom.addEventListener(".list-panel-link", "click", (e) => dataTable.showListView());
  dom.addEventListener('#refresh-data-btn', 'click', () => refreshData());
}

export const refreshData = async () => {
  messaging.showLoadingModal('Retrieving data');

  const rawData = await getServerData();
  const parsedData = parseServerData(rawData);
  console.log('Parsed data:', parsedData);

  initDateInput();
  
  store.setState({
    ...parsedData,
    currentDate: dates.parseDateInput(dom.valueOf("#date"))
  });
  dataTable.periodChangeHandler();

  const isEditor = parsedData.isEditor ?? false;
  const isAdmin = parsedData.isAdmin ?? false;

  dom.toggleEditorOnlyViews(isEditor);
  dom.toggleAdminOnlyViews(isAdmin);
  
  messaging.hideLoadingModal();
};



