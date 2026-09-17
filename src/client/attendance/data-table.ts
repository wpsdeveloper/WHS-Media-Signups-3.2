import * as dom from "../common/dom";
import { parseDateInput, isSameDate } from "../common/dates";
import { AttendanceState, store } from "../common/store";
import * as messaging from "../common/messaging";
import { AttendanceDataRow, AttendanceDataRow as DataRow } from "./attendance-data-row";
import { getAppConfig } from "../common/appConfig";
import { Signup } from "../../shared/types/signups";

// =====================================================================
// STATE SUBSCRIBERS (The "Sub" in Pub/Sub)
// These functions automatically update the UI whenever the store changes.
// Call initObservers() once when your app loads.
// =====================================================================

export const initObservers = () => {
  // Updates the period dropdown when the date changes
  store().subscribe((state: AttendanceState) => {
    const { currentDate, currentPeriod, dailySchedules } = state;
    if (!currentDate || !currentPeriod) return;

    try {
      // clear previous options
      dom.clearOptions("#period");
      const targetDate = currentDate;

      // rebuild options in Period selectbox
      dailySchedules.forEach(schedule => {
        const schedDate = new Date(schedule.date);

        // for a matching date, creates an option for each period
        if (isSameDate(schedDate, targetDate)) {
          schedule.periods.forEach(period => dom.appendOption("#period", period, period));
        }
      })

      if (wednesdayInterventions(targetDate)) {
        dom.appendOption("#period", "Wed. PM", "Wed. PM");
      }

      // Reselect previous period if it still exists, otherwise grab the first available
      if (currentPeriod) {
        dom.setValue("#period", currentPeriod); 
      } else {
        dom.valueOf("#period option");
      }

    } catch (error) {
      messaging.processError(error as Error, "Error parsing new period");
    }
  }, ["currentDatePeriod", "dailySchedules"]);

  // Rebuild the data table with date, signups or sort changes
  store().subscribe((state: AttendanceState) => {
    const { currentDate, currentPeriod, signups, currentSortField, currentSortOrder } = state;
    if (!currentDate) return;
    
    const targetDate = currentDate;
    
    const sortedSignups = sortSignups(signups, currentSortField, currentSortOrder);
    const currentSignups = sortedSignups.filter(su => (isSameDate(new Date(su.date), targetDate)));
    
    dom.qsa("#student-table .student-row, #staff-table .staff-row").forEach(row => row.remove());

    // render new rows
    const studentTable = dom.qs("#student-table") as HTMLElement;
    const staffTable = dom.qs("#staff-table") as HTMLElement;
    const newRows: DataRow[] = [];

    currentSignups.forEach(signup => {
      // adds a new empty student row
      const dataRow = new DataRow(signup.rowId, signup);
  
      const targetTable = signup.type === "Staff reservation" ? staffTable : studentTable;
      targetTable.append(dataRow.element);
      dataRow.populate(currentDate, currentPeriod);
      newRows.push(dataRow);
    });

    // Update state with new rows
    store().setState({ dataRows: newRows } as Partial<AttendanceState>);
  }, ["currentDatePeriod", "signups", "currentSort"]);

  // toggle row visibility and wed UI when period changes
  store().subscribe((state: AttendanceState)  => {
    const { currentDate, currentPeriod, dataRows } = store().getState();
    if (!currentDate || !currentPeriod) return;

    const selectedDate = parseDateInput(currentDate);
    const period = currentPeriod;
   
    // update Wednesday-specific UI
    const isWednesdayPM = period === "Wed. PM";
    dom.setVisible(".wed-int", isWednesdayPM);
    dom.setVisible(".not-wed-int", !isWednesdayPM);
    dom.setText(".study-checkin button", isWednesdayPM ? "Done" : "Check in");
    
    // update row highlight and visibility
    updateRowVisibility(dataRows, selectedDate, period);

    // if no current date/time data for students, shows the "No records" row
    const activeStudentRows = dom.qsa(".student-row.current-period.current-date");
    const activeStaffRows = dom.qsa(".staff-row.current-period.current-date");
    
    const hasStudentRows = Array.isArray(activeStudentRows) && activeStudentRows.length > 0;
    const hasStaffRows = Array.isArray(activeStaffRows) && activeStaffRows.length > 0;

    dom.setVisible(".student-row-empty", !hasStudentRows);
    dom.setVisible("#staff-table", hasStaffRows);
  }, ["currentDatePeriod", "dataRows"]);

  // updates the sort header ui
  store().subscribe((state: AttendanceState) => {
    const { currentSortField, currentSortOrder } = state;
    dom.qsa(".sort-icon i").forEach(icon => icon.classList.remove("active", "fa-caret-up", "fa-caret-down"));

    const activeHeader = currentSortField === "student" ? ".sort-student" : ".sort-study";
    dom.qs(activeHeader)?.classList.add("active");

    const directionIcon = currentSortOrder === "asc" ? "fa-caret-down" : "fa-caret-up";
    dom.qs(".sort-icon i.active")?.classList.add(directionIcon);
  }, ["currentSortField", "currentSortOrder"]);
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

  const currentData = store().getState().currentDatePeriod;
  store().setState({ 
    currentDatePeriod: { ...currentData, date: newDate } 
  });
};

export const periodChangeHandler = () => {
  const newPeriod = dom.valueOf("#period");
  if (!newPeriod) return;
  store().setState({ 
    currentPeriod: newPeriod 
  } as Partial<AttendanceState>);
};

export const resort = (field: (AttendanceState['currentSortField'])) => {
  const { currentSortField, currentSortOrder } = store().getState();
  
  const newOrder = (currentSortField === field && currentSortOrder === "asc") ? "desc" : "asc";
  
  store().setState({ 
    currentSortField: field, 
    currentSortOrder: newOrder 
  } as Partial<AttendanceState>);
};

// =====================================================================
// PURE UTILITIES & VISUAL TOGGLES
// =====================================================================

const updateRowVisibility = (dataRows: AttendanceDataRow[], selectedDate: Date, period: string) => {
  dataRows.forEach(row => {
    const signup = row.signup;
    const suDate = typeof signup.date === "string" ? new Date(signup.date) : signup.date;
    const suPeriod = String(signup.period);

    const isMatchDate = isSameDate(selectedDate, suDate);
    const isMatchPeriod = period === suPeriod;
    const isMatch = isMatchDate && isMatchPeriod;

    row.element.classList.toggle("current-date", isMatchDate);
    row.element.classList.toggle("current-period", isMatchPeriod);
    
    dom.setVisible(row.element, isMatch);
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
  field: AttendanceState['currentSortField'], 
  order: AttendanceState['currentSortOrder']
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
  const attPanel = dom.qs(".header-row .attendance-info") as HTMLElement;
  const width = attPanel.getBoundingClientRect().width - 24; // -24 to include the extra margin/padding

  // animates the panel
  const panels = dom.qsa(".panel") as HTMLElement[];
  panels.forEach(panel => panel.style.transform = `translate(-${width}px, 0)`);

  // updates the header
  dom.setVisible(".header-row .signup-info", true);
  dom.setVisible(".header-row .attendance-info", false);
}


