import * as dom from '../common/dom';
import * as messaging from '../common/messaging';
import * as parser from '../common/parsers';
import * as dates from '../common/dates';
import * as dataTable from "./attendance-data-table";
import * as glassRooms from './glass-rooms-status';
import * as studySelect from './study-select';
import { AttendanceStateRaw, AttendanceState, store } from "./attendance-store";
import { getAppConfig, updateScriptLinks } from '../common/app-config';
import { AttendanceDataRow } from './attendance-data-row';
import { IS_DEBUG, getMockData } from '../common/debug';

// builds page based on existing schedules and settings
export const initializeApp = async () => {
  initObservers();
  await refreshData();
  bindEvents();
  initializeUi();
}

function initObservers() {
  dataTable.initObservers();
  glassRooms.setupGlassRoomsObserver();
  studySelect.setupStudyObservers();
}

async function fetchServerData(): Promise<Partial<AttendanceState>> {
  const rawServerData = await getServerData();
  return await parseServerData(rawServerData);
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

async function parseServerData(data: string): Promise<Partial<AttendanceState>> {
  const parsedData = parser.safeJsonParse(data);
  const signups = parser.parseSignups(parsedData.signups);
  const dailySchedules = parser.parseDailyBlocks(parsedData.dailySchedules);
  const appConfig = await getAppConfig()

  return {
    appConfig,
    signups, dailySchedules, 
    currentEmail: appConfig.email,
    isStaff: appConfig.isStaff,
    isAdmin: appConfig.isAdmin,
    isEditor: appConfig.isEditor, 
  };
}

function initializeUi() {
  initDateInput();

  dataTable.periodChangeHandler();
  dom.toggleEditorOnlyViews(store.getState().isEditor);
  dom.toggleAdminOnlyViews(store.getState().isAdmin);
  
  updateScriptLinks();
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
  dom.addEventListener(".attendance-panel-link", "click", (e) => dataTable.panelViewListener('attendance'));
  dom.addEventListener(".details-panel-link", "click", (e) => dataTable.panelViewListener('details'));
  dom.addEventListener(".list-panel-link", "click", (e) => dataTable.panelViewListener('list'));
  dom.addEventListener('#refresh-data-btn', 'click', () => refreshData());
}

export const refreshData = async () => {
  messaging.showLoadingModal('Retrieving data');

  const serverData = await fetchServerData();
  
  initDateInput();
  
  store.setState({
    ...serverData,
    ui_currentDate: dates.parseDateInput(dom.valueOf("#date"))
  });
  
  messaging.hideLoadingModal();
};



