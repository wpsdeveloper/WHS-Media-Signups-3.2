import * as dom from "../common/dom";
import { parseDateInput, isSameDate } from "../common/dates";
import { AttendanceState, store } from "./attendance-store";
import { updatePeriodOptions } from "../common/period-select";
import * as messaging from "../common/messaging";
import { AttendanceDataRow, AttendanceDataRow as DataRow } from "./attendance-data-row";
import { getAppConfig } from "../common/app-config";

// =====================================================================
// STATE SUBSCRIBERS (The "Sub" in Pub/Sub)
// These functions automatically update the UI whenever the store changes.
// Call initObservers() once when your app loads.
// =====================================================================

export const initObservers = () => {
  // Updates the period dropdown when the date changes
  store.subscribe((state: AttendanceState) => {
    updatePeriodOptions(state.ui_currentDate, state.dailySchedules);
  }, ["ui_currentDate", "dailySchedules"]);

  // Rebuild the data table with date, signups or sort changes
  store.subscribe((state: AttendanceState) => {
    const { ui_currentDate: currentDate, ui_currentPeriod: currentPeriod, signups, ui_currentSortField: currentSortField, ui_currentSortOrder: currentSortOrder } = state;
    if (!currentDate) return;
    
    const targetDate = currentDate;
    
    const currentSignups = signups.filter(su => 
      (isSameDate(new Date(su.date), targetDate))
      && su.period === currentPeriod
      && ((state.ui_currentStudy === su.teacherStudy) 
      || state.ui_currentStudy === 'All studies'
      || su.type === 'Staff reservation')
    );
  
    const sortedSignups = sortSignups(currentSignups, currentSortField, currentSortOrder);
    
    dom.qsa("#student-table .student-row, #staff-table .staff-row").forEach(row => row.remove());

    // render new rows
    const studentTable = dom.qs("#student-table") as HTMLElement;
    const staffTable = dom.qs("#staff-table") as HTMLElement;
    const newRows: DataRow[] = [];

    sortedSignups.forEach(signup => {
      // adds a new empty student row
      const dataRow = new DataRow(signup.rowId, signup);
  
      const targetTable = signup.type === "Staff reservation" ? staffTable : studentTable;
      targetTable.append(dataRow.element);
      dataRow.populate(currentDate, currentPeriod);
      newRows.push(dataRow);
      console.log(signup);
    });

    // Update state with new rows
    store.setState({ ui_dataRows: newRows } as Partial<AttendanceState>);
  }, ["ui_currentDate", "ui_currentPeriod", "ui_currentSortField", "ui_currentSortOrder", "ui_currentStudy"]);


  // // toggle row visibility and wed UI when period changes
  // store.subscribe((state: AttendanceState)  => {
  //   const { currentDate, currentPeriod, dataRows, currentStudy } = state;
  //   if (!currentDate || !currentPeriod) return;

  //   // update Wednesday-specific UI
  //   const isWednesdayPM = currentPeriod === "Wed. PM";
  //   dom.setVisible(".wed-int", isWednesdayPM);
  //   dom.setVisible(".not-wed-int", !isWednesdayPM);
  //   dom.setText(".study-checkin button", isWednesdayPM ? "Done" : "Check in");
    
  //   // update row highlight and visibility
  //   updateRowVisibility(dataRows, currentDate, currentPeriod, currentStudy);

  //   // if no current date/time data for students, shows the "No records" row
  //   const activeStudentRows = dom.qsa(".student-row.current-period.current-date");
  //   const activeStaffRows = dom.qsa(".staff-row.current-period.current-date");
    
  //   const hasStudentRows = Array.isArray(activeStudentRows) && activeStudentRows.length > 0;
  //   const hasStaffRows = Array.isArray(activeStaffRows) && activeStaffRows.length > 0;

  //   dom.setVisible(".student-row-empty", !hasStudentRows);
  //   dom.setVisible("#staff-table", hasStaffRows);
  // }, ["ui_currentDate", "ui_currentPeriod", "dataRows", 'ui_currentStudy']);


  // updates the sort header ui
  store.subscribe((state: AttendanceState) => {
    const { ui_currentSortField: currentSortField, ui_currentSortOrder: currentSortOrder } = state;
    dom.qsa(".sort-icon i").forEach(icon => icon.classList.remove("active", "fa-caret-up", "fa-caret-down"));

    const activeHeader = currentSortField === "student" ? ".sort-student" : ".sort-study";
    dom.qs(activeHeader)?.classList.add("active");

    const directionIcon = currentSortOrder === "asc" ? "fa-caret-down" : "fa-caret-up";
    dom.qs(".sort-icon i.active")?.classList.add(directionIcon);
  }, ["ui_currentSortField", "ui_currentSortOrder"]);
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

const updateRowVisibility = (
  dataRows: AttendanceDataRow[], 
  selectedDate: Date, 
  period: string,
  selectedStudy: string,
) => {
  dataRows.forEach(row => {
    const signup = row.signup;
    const suDate = typeof signup.date === "string" ? new Date(signup.date) : signup.date;
    const suPeriod = String(signup.period);
    const suStudy = signup.teacherStudy;
    const suType = signup.type;

    const element = row.element as HTMLElement;

    const isMatchDate = isSameDate(selectedDate, suDate);
    const isMatchPeriod = period === suPeriod;
    const isMatchStudy = (selectedStudy === suStudy) 
      || selectedStudy === 'All studies'
      || suType === 'Staff reservation';
    const isMatch = isMatchDate && isMatchPeriod && isMatchStudy;

    // element.classList.toggle("ui_current-date", isMatchDate);
    // element.classList.toggle("ui_current-period", isMatchPeriod);
    
    // THIS IS SET TO FALSE FOR DEBUGGING, BUT DOES NOT WORK
    dom.setVisible(element, isMatch);
  });
};

function wednesdayInterventions(date: Date) {
  const wednesday = 3;
  const weekday = date.getDay();
  const dateIsWednesday = (weekday === wednesday);
  const appConfig = getAppConfig();
  const wedIntActive = appConfig.wedInt;

  return dateIsWednesday && wedIntActive;
}

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

/**
 * Shows the attendance panel 
 * */
export const showAttendance = () => {
  // slide animation back to "original" position
  dom.setVisible(".slider-wrapper", true);
  dom.setVisible('.panel', false);
  dom.setVisible(".attendance-info", true)
  
  // updates the header
  dom.qsa(".panel-link").forEach(panel => panel.classList.remove('active'));
  dom.qs(".attendance-panel-link")?.classList.add('active');
}

/**
 *  Shows the signup info panel
 * */
export const showSignupInfo =() => {
  // gets the width of the panel. Note: uses the header, because width
  // calculations work best if the element is visible
  dom.setVisible(".slider-wrapper", true);
  dom.setVisible('.panel', false);
  dom.setVisible(".details-info", true)

  // updates the header
  dom.qsa(".panel-link").forEach(panel => panel.classList.remove('active'));
  dom.qs(".details-panel-link")?.classList.add('active');
}

/**
 *  Hides both attendance and details panels
 * */
export const showListView =() => {
  dom.setVisible(".slider-wrapper", false);
  // updates the header
  dom.qsa(".panel-link").forEach(panel => panel.classList.remove('active'));
  dom.qs(".list-panel-link")?.classList.add('active');
}


