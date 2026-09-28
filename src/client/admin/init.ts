/**
 * @file init.ts
 * @description Orchestrates initialization, data fetching, server parsing, and event binding for the admin module.
 */

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

/**
 * Initializes the admin application by setting up observers, fetching initial data, binding events, and rendering UI.
 */
export const initializeApp = async () => {
  try {
    initObservers();
    await refreshData();
    initializeUi();
    bindEvents();
  } catch (error) {
      messaging.processError(error as Error, 'Failed to initialize app:');
    } finally {
      messaging.hideLoadingModal();
    }
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

/**
 * Fetches admin data from server or debug mock.
 * 
 * @returns A promise resolving to AdminState.
 */
async function fetchServerData(): Promise<AdminState> {
  const rawServerData = await getServerData();
  return await parseServerData(rawServerData);
}

/**
 * Retrieves raw admin server data payload.
 * 
 * @returns A promise resolving to the raw data string.
 */
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

/**
 * Parses and hydrates raw server admin data.
 * 
 * @param data - Raw server data string.
 * @returns A promise resolving to the hydrated AdminState.
 */
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

/**
 * Initializes initial UI state and permissions.
 */
export const initializeUi = () => {
  const state = store.getState();
  dom.toggleEditorOnlyViews(state.isEditor);
  initializeTabs();
  updateScriptLinks();
}

/**
 * Binds DOM event listeners for inputs, buttons, and table headers.
 */
function bindEvents() {
  dom.addEventListener(".student-autocomplete", "input", (e) => studentInput.studentInputChangeHandler(e));
  dom.addEventListener(".student-autocomplete", "change", (e) => studentInput.studentInputChangeHandler(e));
  dom.addEventListener("#student-clear-btn", "click", () => studentInput.clearStudentInput());
  dom.addEventListener('#get-audit-btn', 'click', () => data.getAuditHandler());
  dom.addEventListener('#save-settings-btn', 'click', () => data.saveSettingsHandler());
  dom.addEventListener('#save-settings-btn-top', 'click', () => data.saveSettingsHandler());
  dom.addEventListener("#attendance-link", "click", () => adminPanels.panelViewListener('attendance'));
  dom.addEventListener("#details-link", "click", () => adminPanels.panelViewListener('details'));
  dom.addEventListener("#list-link", "click", () => adminPanels.panelViewListener('list'));
  dom.addEventListener('#date-header', 'click', () => dataTable.resort("date"));
  dom.addEventListener('#period-header', 'click', () => dataTable.resort("period"));
  dom.addEventListener('#refresh-audit-btn', 'click', () => refreshData());
}

/**
 * Refreshes admin data from the server and updates store state.
 */
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
 * Sets up tab switching logic between panels.
 */
 function initializeTabs() {
  const tabContainer = document.querySelector(".nav-tabs");
  const tabs = document.querySelectorAll(".nav-link");
  const panels = document.querySelectorAll(".tab-panel");
  if (!tabContainer) return;

  tabContainer.addEventListener("click", (e: Event) => {
    const target = (e.target as HTMLElement).closest('.nav-link') as HTMLElement;
    if (!target) return;
    
    tabs.forEach(tab => tab.classList.remove('active'));
    panels.forEach(content => content.classList.remove('active'));

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

/**
 * Initializes Bootstrap tooltips matching the given selector.
 * 
 * @param selector - CSS selector for tooltip elements.
 */
export const setTooltips = (selector: string) => {
  const tooltipTriggerList = dom.qsa(selector);
  [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
};
