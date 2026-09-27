import * as dom from "../common/dom";
import { AdminState, store } from "./admin-store";
import { AdminDataRow as DataRow } from "./admin-data-row";
import * as adminPanels from "./admin-panels";

// =====================================================================
// STATE SUBSCRIBERS (The "Sub" in Pub/Sub)
// These functions automatically update the UI whenever the store changes.
// Call initObservers() once when your app loads.
// =====================================================================

export const initObservers = () => {
  // Rebuild the data table with date, signups or sort changes
  store.subscribe((state) => {
    const { signups, ui_currentSortField: currentSortField, ui_currentSortOrder: currentSortOrder, ui_requestedStudentEmail: requestedStudentEmail, ui_currentView } = state;
    if (!requestedStudentEmail) return;
    
    const sortedSignups = sortSignups(signups, currentSortField, currentSortOrder);
    const currentSignups = sortedSignups.filter(su => su.emailStudent === requestedStudentEmail);
    
    dom.qsa("#student-panel .student-row").forEach(row => row.remove());

    // render new rows
    const targetTable = (dom.qs("#student-table") || dom.qs("#student-panel")) as HTMLElement;
    const newRows: DataRow[] = [];

    currentSignups.forEach(signup => {
      // adds a new empty student row
      const dataRow = new DataRow(signup.rowId, signup);
      targetTable.append(dataRow.element);
      dataRow.populate();
      newRows.push(dataRow);
    });

    const emptyRow = dom.qs("#student-panel .student-row-empty");
    if (emptyRow) {
      dom.setVisible(emptyRow, currentSignups.length === 0);
    }

    setTimeout(() => {
      adminPanels.setPanelView(ui_currentView);
    }, 0);

    // Update state with new rows
    store.setState({ ui_dataRows: newRows });
  }, ["signups", "ui_currentSortField", "ui_currentSortOrder", "ui_requestedStudentEmail"]);

  store.subscribe((state) => {
    adminPanels.setPanelView(state.ui_currentView);
  }, ["ui_currentView"]);

  // updates the sort header ui
  store.subscribe((state) => {
    const { ui_currentSortField: currentSortField, ui_currentSortOrder: currentSortOrder } = state;
    dom.qsa(".sort-icon i").forEach(icon => icon.classList.remove("active", "fa-caret-up", "fa-caret-down"));

    const sortIcon = dom.qs(`.sort-${currentSortField}`) as HTMLElement;
    sortIcon.classList.add("active");

    const directionIcon = currentSortOrder === "asc" ? "fa-caret-down" : "fa-caret-up";
    sortIcon.classList.add(directionIcon);
  }, ["ui_currentSortField" , "ui_currentSortOrder"]);
};

// =====================================================================
// 2. DOM EVENT HANDLERS (The "Pub" in Pub/Sub)
// These functions are called by user clicks/inputs. 
// Notice how they ONLY write to the store, and touch NO DOM elements.
// =====================================================================

export const resort = (field: AdminState['ui_currentSortField']) => {
  const { ui_currentSortField: currentSortField, ui_currentSortOrder: currentSortOrder } = store.getState();
  
  const newOrder = (currentSortField === field && currentSortOrder === "asc") ? "desc" : "asc";
  
  store.setState({ ui_currentSortField: field, ui_currentSortOrder: newOrder });
};

// =====================================================================
// PURE UTILITIES & VISUAL TOGGLES
// =====================================================================


export const sortSignups = (
  signups: Signup[], 
  field: AdminState['ui_currentSortField'], 
  order: 'asc' | 'desc'
  ) => {
  const modifier = (order === "asc" ? 1 : -1);
  const targetField = field === "date" ? "date" : "period";
  
  return [...signups].sort((a, b) => {
    if (a[targetField] < b[targetField]) return -1 * modifier;
    if (a[targetField] > b[targetField]) return 1 * modifier;
    return 0;
  });
}

/**
 * Shows the attendance panel 
 * */
export const showAttendance = () => {
  adminPanels.panelViewListener('attendance');
  const panels = dom.qsa(".panel") as HTMLElement[];
  panels.forEach(panel => panel.style.transform = "translate(0, 0)");
}

export const showSignupInfo = () => {
  adminPanels.panelViewListener('details');
  const sliderWrapper = dom.qs(".slider-wrapper") as HTMLElement;
  const width = sliderWrapper ? sliderWrapper.getBoundingClientRect().width : 550;
  const panels = dom.qsa(".panel") as HTMLElement[];
  panels.forEach(panel => panel.style.transform = `translate(-${width}px, 0)`);
}


