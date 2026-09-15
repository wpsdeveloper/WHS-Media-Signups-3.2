import * as dom from "../common/dom.js";
import { store } from "../common/store";
import { SettingsRow } from "./settings-row.js";

// =====================================================================
// STATE SUBSCRIBERS (The "Sub" in Pub/Sub)
// These functions automatically update the UI whenever the store changes.
// Call initObservers() once when your app loads.
// =====================================================================

export const initObservers = () => {
  // Rebuild the data table with date, signups or sort changes
  store.subscribe((state) => {
    const { settings } = state;
    if (!settings) return;
    
    dom.qsa("#settings-panel .settings-row").forEach(row => row.remove());

    // render new rows
    const targetTable = dom.qs("#settings-panel");
    const newRows = [];

    settings.forEach(setting => {
      // adds a new empty student row
      const settingsRow = new SettingsRow(setting.key, setting);
      targetTable.append(settingsRow.element);
      settingsRow.populate();
      newRows.push(settingsRow);
    });
  }, ["settings"]);
}

// =====================================================================
// PURE UTILITIES & VISUAL TOGGLES
// =====================================================================


export const sortSignups = (signups, field, order) => {
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
  dom.qsa(".panel").forEach(panel => panel.style.transform = "translate(0, 0)");

  // updates the header
  dom.setVisible(dom.qs(".header-row .signup-info"), false);
  dom.setVisible(dom.qs(".header-row .attendance-info"), true);
}

/**
 *  Shows the signup info panel
 * */
export const showSignupInfo =() => {
  // gets the width of the panel. Note: uses the header, because width
  // calculations work best if the element is visible
  const width = dom.qs(".header-row .attendance-info").getBoundingClientRect().width - 24; // -24 to include the extra margin/padding

  // animates the panel
  dom.qsa(".panel").forEach(panel => panel.style.transform = `translate(-${width}px, 0)`);

  // updates the header
  dom.setVisible(dom.qs(".header-row .signup-info"), true);
  dom.setVisible(dom.qs(".header-row .attendance-info"), false);
}


