import * as dom from '../common/dom.js';
import * as messaging from '../common/messaging.js';
import * as parser from '../common/parsers.js';
import * as dataTable from "./data-table.js";
import * as settingsTable from "./settings-table.js";
import * as data from './data.js';
import * as studentInput from '../common/student-input.js';
import { store } from '../common/store.js';
import { DEBUG } from "../common/debug.js";

// builds page based on existing schedules and settings
export const initializeApp = async () => {
  messaging.showLoadingModal('Retrieving data');
  try {
    store.initialize(storeInitialData);
    initObservers();
    
    const rawData = await getServerData();
    const parsedData = parseServerData(rawData);
    store.setState(parsedData);
    
    await initializeUi();
    bindEvents();
  } catch (error) {
    messaging.processError(error, 'Failed to initialize app:');
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

const getServerData = async () => {
  if (DEBUG) {
    return await setMockData(parseServerData);
  } else {
  return new Promise((resolve, reject) => {
    google.script.run
      .withFailureHandler(reject)
      .withSuccessHandler(resolve)
      .getInitialAdminData();
    });
  }
};

function parseServerData(data) {
  const students = parser.parseStudents(data.students);
  const studentNames = parser.parseStudentNames(students);
  const signups = parser.parseSignups(data.signups);
  const settings = parser.parseSettings(data.settings);
  const dailySchedules = parser.parseDailySchedules(data.dailySchedules);

  return {
    students,
    studentNames,
    dailySchedules,
    signups,
    settings,
    currentStudentName: '',
    currentEmail: APP_CONFIG.email,
    isStaff: APP_CONFIG.isStaff,
    isAdmin: APP_CONFIG.isAdmin,
    isEditor: APP_CONFIG.isEditor, 
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

  tabContainer.addEventListener("click", (e) => {
    const targetId = e.target.dataset.target;
    if (targetId) {
      // 1. Remove 'active' class from all buttons and panels
      tabs.forEach(tab => tab.classList.remove('active'));
      panels.forEach(content => content.classList.remove('active'));

      // 2. Add 'active' class to clicked button and target panel
      e.target.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    }
  });
}

export const setTooltips = (selector) => {
  const tooltipTriggerList = dom.qsa(selector);
  [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
};


async function setMockData() {
  dom.setValue('#email', 'wpsdeveloper@walpole.k12.ma.us');
  dom.setValue('#is-editor', 'true'); 
  dom.setValue("#wed-int-active", "true");
  dom.toggleEditorOnlyViews(true);

  const sampleData = await import('../../sampledata.js');
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  return sampleData.adminData;
}

const storeInitialData = {
  students: [],
  studentNames: [],
  dailySchedules: [],
  signups: [],
  settings: [],

  isEditor: false,
  
  currentSortField: "date",
  currentSortOrder: "desc",

  currentStudentName: null,
  requestedStudentEmail: null,
};

