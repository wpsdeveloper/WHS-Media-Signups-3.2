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
  try {
    initObservers();
    await refreshData();
    bindEvents();
    initializeUi();
  } catch (error) {
    messaging.processError(error, 'Failed to initialize app:');
  } finally {
    messaging.hideLoadingModal();
  }
};

export const initObservers = () => {
  dataTable.initObservers();
  attendancePanels.initObservers();
  periodSelect.setupPeriodObservers();
  dateInput.setupDateObserver();
  glassRooms.setupGlassRoomsObserver();
  studySelect.setupStudyObservers();
};

export async function fetchServerData(): Promise<Partial<AttendanceState>> {
  const rawServerData = await getServerData();
  return await parseServerData(rawServerData);
}

export const getServerData = async (): Promise<string> => {
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

export async function parseServerData(data: string): Promise<Partial<AttendanceState>> {
  const parsedData = parser.safeJsonParse(data);
  const signups = parser.parseSignups(parsedData.signups);
  const dailySchedules = parser.parseDailyBlocks(parsedData.dailySchedules);
  const appConfig = await getAppConfig();

  return {
    appConfig,
    signups,
    dailySchedules, 
    currentEmail: appConfig.email,
    isStaff: appConfig.isStaff,
    isAdmin: appConfig.isAdmin,
    isEditor: appConfig.isEditor, 
  };
}

export function initializeUi() {
  dateInput.initDateInput();
  periodSelect.periodChangeHandler();

  const state = store.getState() || {};
  dom.toggleStaffOnlyViews(Boolean(state.isStaff));
  dom.toggleEditorOnlyViews(Boolean(state.isEditor));
  dom.toggleAdminOnlyViews(Boolean(state.isAdmin));
  
  updateScriptLinks();
}

export function bindEvents() {
  dom.addEventListener("#date", "change", () => dateInput.dateChangeHandler());
  dom.addEventListener("#period", "change", () => periodSelect.periodChangeHandler());
  dom.addEventListener("#study-select", "change", () => studySelect.studyTeacherChangeHandler());
  dom.addEventListener(".attendance-panel-link", "click", () => attendancePanels.panelViewListener('attendance'));
  dom.addEventListener(".details-panel-link", "click", () => attendancePanels.panelViewListener('details'));
  dom.addEventListener(".list-panel-link", "click", () => attendancePanels.panelViewListener('list'));
  dom.addEventListener('#refresh-data-btn', 'click', () => refreshData());
}

export const refreshData = async () => {
  messaging.showLoadingModal('Retrieving data');

  try {
    const serverData = await fetchServerData();
    
    dateInput.initDateInput();
    
    const dateVal = dom.valueOf("#date");
    let ui_currentDate: Date = new Date();
    if (dateVal) {
      try {
        ui_currentDate = dates.parseDateInput(dateVal);
      } catch {
        ui_currentDate = new Date();
      }
    }

    store.setState({
      ...serverData,
      ui_currentDate,
    });

    const state = store.getState() || {};
    dom.toggleStaffOnlyViews(Boolean(state.isStaff));
    dom.toggleEditorOnlyViews(Boolean(state.isEditor));
    dom.toggleAdminOnlyViews(Boolean(state.isAdmin));
  } catch (error) {
    messaging.processError(error, 'Failed to refresh data:');
  } finally {
    messaging.hideLoadingModal();
  }
};
