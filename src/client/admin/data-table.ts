import * as dom from "../common/dom";
import { AdminState, store } from "./admin-store";
import { AdminDataRow as DataRow } from "./admin-data-row";

// =====================================================================
// STATE SUBSCRIBERS (The "Sub" in Pub/Sub)
// These functions automatically update the UI whenever the store changes.
// Call initObservers() once when your app loads.
// =====================================================================

export const initObservers = () => {
  // Rebuild the data table with date, signups or sort changes
  store.subscribe((state) => {
    const { signups, currentSortField, currentSortOrder, requestedStudentEmail } = state;
    if (!requestedStudentEmail) return;
    
    const sortedSignups = sortSignups(signups, currentSortField, currentSortOrder);
    const currentSignups = sortedSignups.filter(su => su.emailStudent === requestedStudentEmail);
    
    dom.qsa("#student-panel .student-row").forEach(row => row.remove());

    // render new rows
    const targetTable = dom.qs("#student-panel") as HTMLElement;
    const newRows: DataRow[] = [];

    currentSignups.forEach(signup => {
      // adds a new empty student row
      const dataRow = new DataRow(signup.rowId, signup);
      targetTable.append(dataRow.element);
      dataRow.populate();
      newRows.push(dataRow);
    });

    // Update state with new rows
    store.setState({ dataRows: newRows });
  }, ["signups", "currentSortField", "currentSortOrder", "requestedStudentEmail"]);

  // updates the sort header ui
  store.subscribe((state) => {
    const { currentSortField, currentSortOrder } = state;
    dom.qsa(".sort-icon i").forEach(icon => icon.classList.remove("active", "fa-caret-up", "fa-caret-down"));

    const sortIcon = dom.qs(`.sort-${currentSortField}`) as HTMLElement;
    sortIcon.classList.add("active");

    const directionIcon = currentSortOrder === "asc" ? "fa-caret-down" : "fa-caret-up";
    sortIcon.classList.add(directionIcon);
  }, ["currentSortField" , "currentSortOrder"]);
};

// =====================================================================
// 2. DOM EVENT HANDLERS (The "Pub" in Pub/Sub)
// These functions are called by user clicks/inputs. 
// Notice how they ONLY write to the store, and touch NO DOM elements.
// =====================================================================

export const resort = (field: AdminState['currentSortField']) => {
  const { currentSortField, currentSortOrder } = store.getState();
  
  const newOrder = (currentSortField === field && currentSortOrder === "asc") ? "desc" : "asc";
  
  store.setState({ currentSortField: field, currentSortOrder: newOrder });
};

// =====================================================================
// PURE UTILITIES & VISUAL TOGGLES
// =====================================================================


export const sortSignups = (
  signups: Signup[], 
  field: AdminState['currentSortField'], 
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
  // slide animation back to "original" position
  const panels = dom.qsa(".panel") as HTMLElement[];
  panels.forEach(panel => panel.style.transform = "translate(0, 0)");

  // updates the header
  dom.setVisible(".header-row .signup-info", false);
  dom.setVisible(".header-row .attendance-info", true);
}

/**
 *  Shows the signup info panel
 * */
export const showSignupInfo =() => {
  // gets the width of the panel. Note: uses the header, because width
  // calculations work best if the element is visible
  const attendancePanel = dom.qs(".header-row .attendance-info") as HTMLElement;
  const width = attendancePanel.getBoundingClientRect().width - 24; // -24 to include the extra margin/padding

  // animates the panel
  const panels = dom.qsa(".panel") as HTMLElement[];
  panels.forEach(panel => panel.style.transform = `translate(-${width}px, 0)`);

  // updates the header
  dom.setVisible(".header-row .signup-info", true);
  dom.setVisible(".header-row .attendance-info", false);
}


