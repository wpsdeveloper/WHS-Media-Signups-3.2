import * as dom from '../common/dom';
import * as messaging from '../common/messaging';
import * as parser from '../common/parsers';
import * as dataTable from "./admin-data-table";
import * as settingsTable from "./settings-table";
import * as adminPanels from "./admin-panels";
import * as data from './data';
import * as studentInput from './student-input';
import { AdminState, store } from './admin-store';
import { getAppConfig, updateScriptLinks } from '../common/app-config';
import { IS_DEBUG, getMockData } from "../common/debug";
import { AttendanceState } from '../attendance/attendance-store';

// builds page based on existing schedules and settings
export const initializeApp = async () => {
  initObservers();
  await refreshData();
  initializeUi();
  bindEvents();
}

/**
 * Registers all UI observers/subscribers to listen to store updates.
 */
export const initObservers = () => {
  studentInput.setupStudentInputObserver();
  data.setupAuditObserver();
  dataTable.initObservers();
  settingsTable.initObservers();
  adminPanels.initObservers();
};

async function fetchServerData(): Promise<AdminState> {
  const rawServerData = await getServerData();
  return await parseServerData(rawServerData);
}

const getServerData = async (): Promise<string> => {
  if (IS_DEBUG) {
    return await getMockData('admin');
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
      .getInitialAdminData();
  });
};

async function parseServerData(data: string): Promise<AdminState> {
  const parsedData = parser.safeJsonParse(data);
  const students = parser.parseStudents(parsedData?.students);
  const studentNames = parser.parseStudentDataList(students);
  const signups = parser.parseSignups(parsedData?.signups || []);
  const settings = parser.parseSettings(parsedData?.settings || parsedData?.appSettings || []);
  const dailySchedules = parser.parseDailyBlocks(parsedData?.dailySchedules || []);
  const appConfig = await getAppConfig();
  
  return {
    students, studentNames, dailySchedules, signups, settings,
    ui_currentStudentName: '',
    ui_currentSortField: 'date', 
    ui_currentSortOrder: 'desc', 
    ui_dataRows: [], 
    ui_requestedStudentEmail: '',
    ui_currentView: 'attendance',
    currentEmail: appConfig.email,
    isEditor: appConfig.isEditor, 
    appConfig: appConfig,
  };
}

export const initializeUi = () => {
  const state = store.getState();
  dom.toggleEditorOnlyViews(state.isEditor);
  initializeTabs();
  updateScriptLinks();
  
}

function bindEvents() {
  dom.addEventListener(".student-autocomplete", "input", (e) => studentInput.studentInputChangeHandler(e));
  dom.addEventListener('#get-audit-btn', 'click', () => data.getAuditHandler());
  dom.addEventListener("#attendance-link", "click", () => adminPanels.panelViewListener('attendance'));
  dom.addEventListener("#details-link", "click", () => adminPanels.panelViewListener('details'));
  dom.addEventListener("#list-link", "click", () => adminPanels.panelViewListener('list'));
  dom.addEventListener('#date-header', 'click', () => dataTable.resort("date"));
  dom.addEventListener('#period-header', 'click', () => dataTable.resort("period"));
  dom.addEventListener('#refresh-audit-btn', 'click', () => refreshData());
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
 * Sets up the tabs and panels display
 */ 
 function initializeTabs() {
  const tabContainer = document.querySelector(".nav-tabs");
  const tabs = document.querySelectorAll(".nav-link");
  const panels = document.querySelectorAll(".tab-panel");
  if (!tabContainer) return;

  tabContainer.addEventListener("click", (e: Event) => {
    const target = (e.target as HTMLElement).closest('.nav-link') as HTMLElement;
    if (!target) return;
    
    // 1. Remove 'active' class from all buttons and panels
    tabs.forEach(tab => tab.classList.remove('active'));
    panels.forEach(content => content.classList.remove('active'));

    // 2. Add 'active' class to clicked button and target panel
    target.classList.add('active');
    const targetPanelId = target.getAttribute('data-target');
    if (targetPanelId) {
      const targetPanel = document.getElementById(targetPanelId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    }
  });
}

export const setTooltips = (selector: string) => {
  const tooltipTriggerList = dom.qsa(selector);
  [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
};


