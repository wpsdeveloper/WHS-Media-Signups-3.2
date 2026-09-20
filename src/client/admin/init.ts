import * as dom from '../common/dom';
import * as messaging from '../common/messaging';
import * as parser from '../common/parsers';
import * as dataTable from "./data-table";
import * as settingsTable from "./settings-table";
import * as data from './data';
import * as studentInput from '../common/student-input';
import { AdminState, store } from './admin-store';
import { DEBUG } from "../common/debug";
import { getAppConfig } from '../common/app-config';

// builds page based on existing schedules and settings
export const initializeApp = async () => {
  messaging.showLoadingModal('Retrieving data');
  try {
    initObservers();
    
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

/**
 * Registers all UI observers/subscribers to listen to store updates.
 */
export const initObservers = () => {
  studentInput.setupStudentInputObserver();
  data.setupAuditObserver();
  dataTable.initObservers();
  settingsTable.initObservers();
};

const getServerData = async (): Promise<string> => {
  if (DEBUG) {
    return await setMockData();
  } else {
  return new Promise((resolve, reject) => {
    google.script.run
      .withFailureHandler(reject)
      .withSuccessHandler(resolve)
      .getInitialAdminData();
    });
  }
};

function parseServerData(data: string): AdminState {
  const parsedData = parser.safeJsonParse(data);
  const students = parser.parseStudents(parsedData.students);
  const studentNames = parser.parseStudentDataList(students);
  const signups = parser.parseSignups(parsedData.signups);
  const settings = parser.parseSettings(parsedData.settings);
  const dailySchedules = parser.parseDailyBlocks(parsedData.dailySchedules);
  const appConfig = getAppConfig()
  

  return {
    students,
    studentNames,
    dailySchedules,
    signups,
    settings,
    currentStudentName: '',
    currentSortField: 'date', 
    currentSortOrder: 'desc', 
    dataRows: [], 
    requestedStudentEmail: '',
    currentEmail: appConfig.email,
    isEditor: appConfig.isEditor, 
  };
}

export const initializeUi = async () => {
  const state = store.getState();
  dom.toggleEditorOnlyViews(state.isEditor);
  initializeTabs();
}

function bindEvents() {
  dom.addEventListener(".student-autocomplete", "input", (e) => studentInput.studentInputChangeHandler(e));
  dom.addEventListener('#get-audit-btn', 'click', () => data.getAuditHandler());
  dom.addEventListener("#attendance-link", "click", (e) => dataTable.showAttendance());
  dom.addEventListener("#details-link", "click", (e) => dataTable.showSignupInfo());
  dom.addEventListener('#date-header', 'click', () => dataTable.resort("date"));
  dom.addEventListener('#period-header', 'click', () => dataTable.resort("period"));
}

/**
 * Sets up the tabs and panels display
 */ 
 function initializeTabs() {
  const tabContainer = document.querySelector(".nav-tabs");
  const tabs = document.querySelectorAll(".nav-link");
  const panels = document.querySelectorAll(".tab-panel");
  if (!tabContainer) return;

  tabContainer.addEventListener("click", (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    
    // 1. Remove 'active' class from all buttons and panels
    tabs.forEach(tab => tab.classList.remove('active'));
    panels.forEach(content => content.classList.remove('active'));

    // 2. Add 'active' class to clicked button and target panel
    target.classList.add('active');
  });
}

export const setTooltips = (selector: string) => {
  const tooltipTriggerList = dom.qsa(selector);
  [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
};


async function setMockData() {
  dom.setValue('#email', 'wpsdeveloper@walpole.k12.ma.us');
  dom.setValue('#is-editor', 'true'); 
  dom.setValue("#wed-int-active", "true");
  dom.toggleEditorOnlyViews(true);

  const sampleData = await import('../../sampledata');
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  return JSON.stringify(sampleData.adminData);
}


