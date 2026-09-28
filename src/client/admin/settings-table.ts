/**
 * @file settings-table.ts
 * @description Manages settings table rendering and observer subscriptions.
 */

import * as dom from "../common/dom";
import { store } from "./admin-store";
import { SettingsRow } from "./settings-row";

/**
 * Initializes store observers for re-rendering the settings table on state changes.
 */
export const initObservers = () => {
  store.subscribe((state) => {
    const { settings } = state;
    if (!settings) return;
    
    dom.qsa("#settings-panel .settings-row").forEach(row => row.remove());

    const targetTable = (dom.qs("#settings-table") || dom.qs("#settings-panel")) as HTMLElement;
    const newRows = [];

    settings.forEach(setting => {
      const settingsRow = new SettingsRow(setting.key, setting);
      targetTable.append(settingsRow.element);
      settingsRow.populate();
      newRows.push(settingsRow);
    });
  }, ["settings"]);
}

/**
 * Shows the attendance panel view.
 */
export const showAttendance = () => {
  const panels = dom.qsa(".panel") as HTMLElement[];
  panels.forEach(panel => panel.style.transform = "translate(0, 0)");

  dom.setVisible(".header-row .signup-info", false);
  dom.setVisible(".header-row .attendance-info", true);
}

/**
 * Shows the signup info details panel view.
 */
export const showSignupInfo = () => {
  const attendancePanel = dom.qs(".header-row .attendance-info") as HTMLElement;
  const width = attendancePanel ? attendancePanel.getBoundingClientRect().width - 24 : 526;

  const panels = dom.qsa(".panel") as HTMLElement[];
  panels.forEach(panel => panel.style.transform = `translate(-${width}px, 0)`);

  dom.setVisible(".header-row .signup-info", true);
  dom.setVisible(".header-row .attendance-info", false);
}
