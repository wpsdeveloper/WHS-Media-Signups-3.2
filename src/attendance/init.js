import * as dom from '../common/dom.js';
import * as messaging from '../common/messaging.js';
import * as dataTable from "./data-table.js";
import { store } from "../common/store.js";
import { DEBUG } from '../common/debug.js';

// builds page based on existing schedules and settings
export const initializeApp = async () => {
  try {
    store.initialize(storeInitialData);
    dataTable.initObservers();
    bindEvents();
    
    await refreshData();
  } catch (error) {
    messaging.processError(error, 'Failed to initialize app:');
    messaging.hideLoadingModal();
  }
}

const getServerData = async () => {
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

function parseServerData(data) {
  return {
    signups: JSON.parse(data.signups),
    dailySchedules: JSON.parse(data.dailySchedules),
    currentEmail: APP_CONFIG.email,
    isStaff: APP_CONFIG.isStaff,
    isAdmin: APP_CONFIG.isAdmin,
    isEditor: APP_CONFIG.isEditor, 
  };
}

function initDateInput() {
  const dateInput = dom.qs(".date-input");
  const today = new Date();
  const toDateValue = date => date.toISOString().slice(0, 10);
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
    currentDatePeriod : {
      date: dom.valueOf("#date"),
      period: null,
    }
  });

  dom.toggleEditorOnlyViews(parsedData.isEditor);
  dom.toggleAdminOnlyViews(parsedData.isAdmin);
  
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

  const sampleData = await import('../../sampledata.js');
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  return sampleData.attendanceData;
}

const storeInitialData = {
  dailySchedules: [],
  signups: [],
  
  isStaff: false,
  isEditor: false,
  isAdmin: false,
  
  currentSort: {
    field: "study",
    order: "asc",
  },
  
  dataRows: [],

  currentDatePeriod: {
    date: null,
    period: null,
    },
  };


