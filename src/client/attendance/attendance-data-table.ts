import * as dom from "../common/dom";
import { parseDateInput, isSameDate } from "../common/dates";
import { AttendanceState, store } from "./attendance-store";
import { updatePeriodOptions } from "../common/period-select";
import { makeDataRowViewModel, AttendanceDataRow as DataRow } from "./attendance-data-row";
import { getRoomBadge } from "./glass-rooms-status";
import { appConfig } from "../common/sampledata";

// =====================================================================
// STATE SUBSCRIBERS (The "Sub" in Pub/Sub)
// These functions automatically update the UI whenever the store changes.
// Call initObservers() once when your app loads.
// =====================================================================

export const initObservers = () => {
  // Rebuild the data table with date, signups or sort changes
  store.subscribe((state: AttendanceState) => {
    const { ui_currentDate: currentDate, ui_currentPeriod: currentPeriod, signups, ui_currentSortField: currentSortField, ui_currentSortOrder: currentSortOrder } = state;
    if (!currentDate) return;
    
    const targetDate = currentDate;
    
    const currentSignups = newFunction(signups, targetDate, currentPeriod, state);
    const sortedSignups = sortSignups(currentSignups, currentSortField, currentSortOrder);
    
    dom.qsa("#student-table .student-row, #staff-table .staff-row").forEach(row => row.remove());

    // render new rows
    const studentTable = dom.qs("#student-table") as HTMLElement;
    const staffTable = dom.qs("#staff-table") as HTMLElement;
    const newRows: DataRow[] = [];

    sortedSignups.forEach(signup => {
      // adds a new empty student row
      const dataRowVM = makeDataRowViewModel(signup, state)
      const dataRow = new DataRow(dataRowVM);
      const rowElement = dataRow.element;

      if (!rowElement) return;
      
      const targetTable = signup.type === "Staff reservation" ? staffTable : studentTable;
      targetTable.append(rowElement);
      
      dataRow.render();
      newRows.push(dataRow);
    });

    // Update state with new rows
    store.setState({ ui_dataRows: newRows } as Partial<AttendanceState>);
  }, ["ui_currentDate", "ui_currentPeriod", "ui_currentSortField", "ui_currentSortOrder", "ui_currentStudy"]);
};

// =====================================================================
// 2. DOM EVENT HANDLERS (The "Pub" in Pub/Sub)
// These functions are called by user clicks/inputs. 
// Notice how they ONLY write to the store, and touch NO DOM elements.
// =====================================================================

/**
 *  Responds to a change of the Date field 
 * */
export const dateChangeHandler = () => {
  const newDate = dom.valueOf("#date");
  if (!newDate) return;

  store.setState({ 
    ui_currentDate: parseDateInput(newDate) 
  });
};

export const periodChangeHandler = () => {
  const newPeriod = dom.valueOf("#period");
  if (!newPeriod) return;
  store.setState({ 
    ui_currentPeriod: newPeriod 
  } as Partial<AttendanceState>);
};

export const studyChangeHandler = () => {
  const newStudy = dom.valueOf("#study-select");
  if (!newStudy) return;
  store.setState({ 
    ui_currentStudy: newStudy 
  } as Partial<AttendanceState>);
};

export const resort = (field: (AttendanceState['ui_currentSortField'])) => {
  const { ui_currentSortField: currentSortField, ui_currentSortOrder: currentSortOrder } = store.getState();
  
  const newOrder = (currentSortField === field && currentSortOrder === "asc") ? "desc" : "asc";
  
  store.setState({ 
    ui_currentSortField: field, 
    ui_currentSortOrder: newOrder 
  } as Partial<AttendanceState>);
};

// =====================================================================
// PURE UTILITIES & VISUAL TOGGLES
// =====================================================================

export const sortSignups = (
  signups: Signup[], 
  field: AttendanceState['ui_currentSortField'], 
  order: AttendanceState['ui_currentSortOrder']
) => {
  const modifier = (order === "asc" ? 1 : -1);
  const targetField = field === "student" ? "lastname" : "teacherStudy";
  
  return [...signups].sort((a, b) => {
    if (a[targetField] < b[targetField]) return -1 * modifier;
    if (a[targetField] > b[targetField]) return 1 * modifier;
    return 0;
  });
}





function newFunction(signups: Signup[], targetDate: Date, currentPeriod: string | null, state: AttendanceState) {
  return signups.filter(su => (isSameDate(new Date(su.date), targetDate))
    && su.period === currentPeriod
    && ((state.ui_currentStudy === su.teacherStudy)
      || state.ui_currentStudy === 'All studies'
      || su.type === 'Staff reservation')
  );
}

