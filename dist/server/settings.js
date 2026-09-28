"use strict";
/**
 * @file settings.ts
 * @description Manages retrieval, parsing, and persistence of application settings and configuration switches.
 */
/**
 * Gets app settings from the spreadsheet.
 *
 * @returns An array of Setting objects containing the application configuration.
 * @throws Error if there's an issue retrieving the settings sheet.
 */
function getAppSettings() {
    const sheet = SPREADSHEET.getSheetByName(SETTINGS_SHEET_NAME);
    if (!sheet)
        throw new Error("Error retrieving app settings");
    const settingsData = sheet.getRange(1, 1, sheet.getLastRow(), 5).getValues();
    settingsData.shift(); // removes header row
    const settingsArray = [];
    settingsData.forEach(row => {
        if (row[0].length > 0) {
            if (typeof row[1] !== "string") {
                row[1] = row[1].toString();
            }
            settingsArray.push(row);
        }
    });
    return parseSettingsFromRows(settingsArray);
}
/**
 * Saves app settings to the spreadsheet.
 *
 * @param settingsJson - A JSON string representing the new settings to save.
 * @returns "Success" upon successful save.
 * @throws Error if connecting to the database fails, or if submitted data is invalid.
 */
function saveAppSettings(settingsJson) {
    const sheet = SPREADSHEET.getSheetByName(SETTINGS_SHEET_NAME);
    if (!sheet)
        throw new Error("Error connecting to database");
    const newSettings = JSON.parse(settingsJson);
    if (!newSettings || !Array.isArray(newSettings)) {
        throw new Error("Invalid data submission");
    }
    const headers = [
        ["Key", "Value", "Description", "Comments", "Type"]
    ];
    const newSheetRows = headers.concat(newSettings);
    sheet.getDataRange().clear();
    sheet.getRange(1, 1, newSheetRows.length, headers[0].length)
        .setValues(newSheetRows);
    return "Success";
}
/**
 * Parses raw spreadsheet rows into structured Setting objects.
 *
 * @param rows - The raw data rows from the settings sheet.
 * @returns An array of structured Setting objects.
 */
function parseSettingsFromRows(rows) {
    const settings = [];
    rows.forEach(row => {
        if (Array.isArray(row) && row.length >= 5) {
            settings.push({
                key: row[0],
                value: row[1],
                description: row[2],
                comments: row[3],
                dataType: row[4],
            });
        }
    });
    return settings;
}
/**
 * Gets the value of Wednesday Interventions (on/off).
 *
 * @returns True if Wednesday Interventions are active, or if user is a data editor; false otherwise.
 */
function isWednesdayInterventionsActive() {
    const range = SPREADSHEET.getRangeByName(WED_INTERVENTIONS_RANGE_NAME);
    if (!range)
        return true;
    const wedInt = range.getValue() === "On";
    const editors = getDataEditors();
    const email = getEmail();
    const userIsEditor = editors.includes(email);
    return wedInt || userIsEditor;
}
/**
 * Gets the docId for the published Tutoring schedule, for linking within the form.
 *
 * @returns The document ID string, or an empty string if not found.
 */
function getTutoringDocId() {
    const range = SPREADSHEET.getRangeByName(TUTORING_DOCID_RANGE_NAME);
    if (!range)
        return "";
    return range.getValue();
}
/**
 * Gets the boolean for whether NHS tutoring should be shown.
 *
 * @returns True if tutoring should be shown, false otherwise.
 */
function getTutoringStatus() {
    const range = SPREADSHEET.getRangeByName(TUTORING_TOGGLE_RANGE_NAME);
    if (!range)
        return false;
    return range.getValue() == "true";
}
/**
 * Gets the docId for the published Interventions schedule, for linking within the form.
 *
 * @returns The document ID string, or an empty string if not found.
 */
function getInterventionsDocId() {
    const range = SPREADSHEET.getRangeByName(INTERVENTIONS_DOCID_RANGE_NAME);
    if (!range)
        return "";
    return range.getValue();
}
/**
 * Returns an array of email addresses for people allowed to edit.
 *
 * @returns Array of email addresses that have editor privileges.
 */
function getDataEditors() {
    const cache = CacheService.getScriptCache();
    const cached = cache.get("data-editors");
    if (cached) {
        return JSON.parse(cached);
    }
    const range = SPREADSHEET.getRangeByName(DATA_EDITORS_RANGE_NAME);
    if (!range)
        return [];
    const values = range.getValue();
    const editors = parseDataEditors(values);
    cache.put("data-editors", JSON.stringify(editors), 21600);
    return editors;
}
/**
 * Parses a comma-separated string of email addresses into an array.
 *
 * @param csvString - The comma-separated list of emails.
 * @returns An array of trimmed email strings.
 */
function parseDataEditors(csvString) {
    let editors = csvString.split(",");
    editors = editors.map(e => e.trim());
    return editors;
}
/**
 * Retrieves the default maximum number of signups allowed.
 *
 * @returns The max signup limit as a number.
 */
function getDefaultMaxSignups() {
    const range = SPREADSHEET.getRangeByName(DEFAULT_MAX_SIGNUPS_RANGE_NAME);
    if (!range)
        return DEFAULT_MAX_SIGNUPS;
    let value = range.getValue();
    if (Number.isNaN(value)) {
        value = parseInt(value);
    }
    return value;
}
