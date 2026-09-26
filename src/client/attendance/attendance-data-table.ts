import * as dom from "../common/dom";
import { AttendanceState, store } from "./attendance-store";
import { makeDataRowViewModel, AttendanceDataRow as DataRow } from "./attendance-data-row";
import { filterSignups, sortSignups } from "./attendance-filter";
import { setPanelView } from "./attendance-panels";

export { filterSignups, sortSignups };

// =====================================================================
// STATE SUBSCRIBERS (The "Sub" in Pub/Sub)
// =====================================================================

export const initObservers = () => {
  store.subscribe(
    (state: AttendanceState) => {
      renderTable(state);
    },
    [
      "signups",
      "isEditor",
      "ui_currentDate",
      "ui_currentPeriod",
      "ui_currentSortField",
      "ui_currentSortOrder",
      "ui_currentStudy",
    ]
  );
};

/**
 * Re-renders student and staff tables based on current filter & sort state
 */
export const renderTable = (state: AttendanceState) => {
  const studentTable = dom.qs("#student-table") as HTMLElement | null;
  const staffTable = dom.qs("#staff-table") as HTMLElement | null;

  // Always clear existing data rows first to avoid ghost rows
  dom.qsa("#student-table .student-row, #staff-table .staff-row").forEach((row) => row.remove());

  const {
    ui_currentDate: currentDate,
    ui_currentPeriod: currentPeriod,
    signups,
    ui_currentSortField: currentSortField,
    ui_currentSortOrder: currentSortOrder,
    ui_currentStudy: currentStudy,
  } = state;

  if (!currentDate || !currentPeriod) {
    dom.setVisible(".student-row-empty", true);
    dom.setVisible(".staff-row-empty", true);
    return;
  }

  const currentSignups = filterSignups(signups, currentDate, currentPeriod, currentStudy);
  const sortedSignups = sortSignups(currentSignups, currentSortField, currentSortOrder);

  let studentCount = 0;
  let staffCount = 0;

  sortedSignups.forEach((signup) => {
    const dataRowVM = makeDataRowViewModel(signup, state);
    const dataRow = new DataRow(dataRowVM);
    const rowElement = dataRow.element;

    if (!rowElement) return;

    if (signup.type === "Staff reservation") {
      staffTable?.append(rowElement);
      staffCount++;
    } else {
      studentTable?.append(rowElement);
      studentCount++;
    }

    dataRow.render();
  });

  // Toggle "No records found" empty states
  dom.setVisible(".student-row-empty", studentCount === 0);
  dom.setVisible(".staff-row-empty", staffCount === 0);

  // Ensure current panel view is applied to newly mounted rows
  setPanelView(state.ui_currentView);
};

// =====================================================================
// TABLE HEADER SORTING
// =====================================================================

export const resort = (field: AttendanceState["ui_currentSortField"]) => {
  const { ui_currentSortField: currentSortField, ui_currentSortOrder: currentSortOrder } =
    store.getState();

  const isSameField = currentSortField === field;
  const newOrder = isSameField && currentSortOrder === "asc" ? "desc" : "asc";

  store.setState({
    ui_currentSortField: field,
    ui_currentSortOrder: newOrder,
  });
};
