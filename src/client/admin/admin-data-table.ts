import * as dom from '../common/dom';
import { AdminState, store } from './admin-store';
import { makeDataRowViewModel, AdminDataRow as DataRow } from './admin-data-row';
import * as adminPanels from './admin-panels';
import { filterSignups, sortSignups } from './admin-filter';
import { setPanelView } from './admin-panels';

export { filterSignups, sortSignups };

// =====================================================================
// STATE SUBSCRIBERS (The "Sub" in Pub/Sub)
// These functions automatically update the UI whenever the store changes.
// Call initObservers() once when your app loads.
// =====================================================================

export const initObservers = () => {
  // Rebuild the data table with date, signups or sort changes
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
 * Re-renders student and staff tables based on current filter & sort state
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

// =====================================================================
// 2. DOM EVENT HANDLERS (The "Pub" in Pub/Sub)
// These functions are called by user clicks/inputs.
// Notice how they ONLY write to the store, and touch NO DOM elements.
// =====================================================================

export const resort = (field: AdminState['ui_currentSortField']) => {
  const {
    ui_currentSortField: currentSortField,
    ui_currentSortOrder: currentSortOrder,
  } = store.getState();

  const newOrder =
    currentSortField === field && currentSortOrder === 'asc' ? 'desc' : 'asc';

  store.setState({ ui_currentSortField: field, ui_currentSortOrder: newOrder });
};

// =====================================================================
// PURE UTILITIES & VISUAL TOGGLES
// =====================================================================

/**
 * Shows the attendance panel
 * */
export const showAttendance = () => {
  adminPanels.panelViewListener('attendance');
  const panels = dom.qsa('.panel') as HTMLElement[];
  panels.forEach((panel) => (panel.style.transform = 'translate(0, 0)'));
};

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
