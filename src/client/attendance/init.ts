import * as dom from '../common/dom';
import * as messaging from '../common/messaging';
import * as parser from '../common/parsers';
import * as dates from '../common/dates';
import * as dataTable from "./attendance-data-table";
import * as glassRooms from './glass-rooms-status';
import * as studySelect from './study-select';
import * as periodSelect from './period-select';
import * as dateInput from './date-input';
import { AttendanceState, store } from "./attendance-store";
import { getAppConfig, updateScriptLinks } from '../common/app-config';
import { IS_DEBUG, getMockData } from '../common/debug';
import * as attendancePanels from './attendance-panels';

// builds page based on existing schedules and settings
export const initializeApp = async () => {
  initObservers();
  await refreshData();
  bindEvents();
  initializeUi();
};

function initObservers() {
  dataTable.initObservers();
  attendancePanels.initObservers();
  periodSelect.setupPeriodObservers();
  dateInput.setupDateObserver();
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
  const appConfig = await getAppConfig();

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
  dateInput.initDateInput();
  periodSelect.periodChangeHandler();
  dom.toggleEditorOnlyViews(store.getState().isEditor);
  dom.toggleAdminOnlyViews(store.getState().isAdmin);
  
  updateScriptLinks();
}

function bindEvents() {
  dom.addEventListener("#date", "change", () => dateInput.dateChangeHandler());
  dom.addEventListener("#period", "change", (e) => periodSelect.periodChangeHandler(e as MouseEvent));
  dom.addEventListener("#study-select", "change", (e) => studySelect.studyTeacherChangeHandler(e as MouseEvent));
  dom.addEventListener(".attendance-panel-link", "click", () => attendancePanels.panelViewListener('attendance'));
  dom.addEventListener(".details-panel-link", "click", () => attendancePanels.panelViewListener('details'));
  dom.addEventListener(".list-panel-link", "click", () => attendancePanels.panelViewListener('list'));
  dom.addEventListener('#refresh-data-btn', 'click', () => refreshData());
}

export const refreshData = async () => {
  messaging.showLoadingModal('Retrieving data');

  const serverData = await fetchServerData();
  
  dateInput.initDateInput();
  
  store.setState({
    ...serverData,
    ui_currentDate: dates.parseDateInput(dom.valueOf("#date"))
  });
  
  messaging.hideLoadingModal();
};
