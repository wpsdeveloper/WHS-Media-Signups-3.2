/**
 * @file admin-data-table.ts
 * @description Manages admin audit data table rendering, sorting, and state observation subscriptions.
 */

import * as dom from '../common/dom';
import { AdminState, store } from './admin-store';
import { makeDataRowViewModel, AdminDataRow as DataRow } from './admin-data-row';
import * as adminPanels from './admin-panels';
import { filterSignups, sortSignups } from './admin-filter';
import { setPanelView } from './admin-panels';

export { filterSignups, sortSignups };

/**
 * Initializes store observers for re-rendering the admin table on state changes.
 */
export const initObservers = () => {
  store.subscribe(
    (state) => {
      renderTable(state);
    },
    [
      'signups',
      'ui_currentSortField',
      'ui_currentSortOrder',
      'ui_requestedStudentEmail',
    ],
  );
};

/**
 * Re-renders student tables based on current filter & sort state.
 * 
 * @param state - The current AdminState.
 */
export const renderTable = (state: AdminState) => {
  const studentTable = dom.qs('#student-table') as HTMLElement | null;

  // Always clear existing data rows first to avoid ghost rows
  dom.qsa('#student-table .student-row').forEach((row) => row.remove());

  const {
    signups,
    ui_currentSortField: currentSortField,
    ui_currentSortOrder: currentSortOrder,
    ui_requestedStudentEmail: requestedStudentEmail,
    ui_currentView,
  } = state;

  if (!requestedStudentEmail) return;

  const currentSignups = filterSignups(signups || [], requestedStudentEmail);
  const sortedSignups = sortSignups(
    currentSignups,
    currentSortField,
    currentSortOrder,
  );

  let studentCount = 0;

  sortedSignups.forEach((signup) => {
    const dataRowVM = makeDataRowViewModel(signup, state);
    const dataRow = new DataRow(dataRowVM);
    const rowElement = dataRow.element;

    if (!rowElement) return;

    studentTable?.append(rowElement);
    studentCount++;

    dataRow.render();
  });

  // Toggle "No records found" empty states
  dom.setVisible('.student-row-empty', studentCount === 0);

  // Ensure current panel view is applied to newly mounted rows
  setPanelView(state.ui_currentView);
};

/**
 * Handles column header sorting by updating sort field and order in the store.
 * 
 * @param field - The field to sort by ("date" or "period").
 */
export const resort = (field: AdminState['ui_currentSortField']) => {
  const {
    ui_currentSortField: currentSortField,
    ui_currentSortOrder: currentSortOrder,
  } = store.getState();

  const newOrder =
    currentSortField === field && currentSortOrder === 'asc' ? 'desc' : 'asc';

  store.setState({ ui_currentSortField: field, ui_currentSortOrder: newOrder });
};

/**
 * Shows the attendance panel view.
 */
export const showAttendance = () => {
  adminPanels.panelViewListener('attendance');
  const panels = dom.qsa('.panel') as HTMLElement[];
  panels.forEach((panel) => (panel.style.transform = 'translate(0, 0)'));
};

/**
 * Shows the signup info details panel view.
 */
export const showSignupInfo = () => {
  adminPanels.panelViewListener('details');
  const sliderWrapper = dom.qs('.slider-wrapper') as HTMLElement;
  const width = sliderWrapper
    ? sliderWrapper.getBoundingClientRect().width
    : 550;
  const panels = dom.qsa('.panel') as HTMLElement[];
  panels.forEach(
    (panel) => (panel.style.transform = `translate(-${width}px, 0)`),
  );
};
