import * as dom from "../common/dom";
import { store } from "./admin-store";
import { SettingsRow } from "./settings-row";

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
    const targetTable = dom.qs("#settings-panel") as HTMLElement;
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


