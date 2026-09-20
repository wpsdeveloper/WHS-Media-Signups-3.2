import * as dom from '../common/dom';
import * as messaging from '../common/messaging';
import * as dates from '../common/dates';
import * as dataTable from "./data-table";
import { AttendanceStateRaw, AttendanceState, store } from "./attendance-store";
import { DEBUG } from '../common/debug';
import { AppConfig, getAppConfig } from '../common/app-config';
import { AttendanceDataRow } from './attendance-data-row';

// builds page based on existing schedules and settings
export const initializeApp = async () => {
  try {
    dataTable.initObservers();
    bindEvents();
    
    await refreshData();
  } catch (error) {
    messaging.processError(error as Error, 'Failed to initialize app:');
    messaging.hideLoadingModal();
  }
}

const getServerData = async ():Promise<Partial<AttendanceStateRaw>> => {
  if (DEBUG) {
    return await setMockData();
  } 

  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      .getInitialAttendanceData();
  });
};

function parseServerData(data: Partial<AttendanceStateRaw>): Partial<AttendanceState> {
  const appConfig: AppConfig = getAppConfig();
  if (!data || !data.signups || !data.dailySchedules) throw new Error("Error retreiving data from server");
  return {
    signups: JSON.parse(data.signups),
    dailySchedules: JSON.parse(data.dailySchedules),
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
  dom.addEventListener("#attendance-link", "click", (e) => dataTable.showAttendance());
  dom.addEventListener("#details-link", "click", (e) => dataTable.showSignupInfo());
  dom.addEventListener('#refresh-data-btn', 'click', () => refreshData());
}

export const refreshData = async () => {
  messaging.showLoadingModal('Retrieving data');

  const rawData = await getServerData();
  const parsedData = parseServerData(rawData);
  initDateInput();

  store.setState({
    ...parsedData,
    currentDate: dates.parseDateInput(dom.valueOf("#date")),
    currentPeriod: null,
  });

  const isEditor = parsedData.isEditor ?? false;
  const isAdmin = parsedData.isAdmin ?? false;

  dom.toggleEditorOnlyViews(isEditor);
  dom.toggleAdminOnlyViews(isAdmin);
  
  messaging.hideLoadingModal();
};

async function setMockData() {
  dom.setValue('#email', 'wpsdeveloper@walpole.k12.ma.us');
  // dom.setValue('#email', 'zzdemow23@wpsma.org');
  dom.setValue('#update-row-id', '');
  dom.setValue('#is-admin', 'true');
  dom.setValue('#is-editor', 'true'); 
  dom.setValue("#wed-int-active", "true");
  dom.toggleEditorOnlyViews(true);
  dom.toggleAdminOnlyViews(true);

  const sampleData = await import("../../sampledata");
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  return sampleData.attendanceData;
}




