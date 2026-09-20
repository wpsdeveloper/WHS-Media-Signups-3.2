"use strict";
/**
 * Gets apps settings from the spreadsheet
 */
function getAppSettings() {
    const sheet = SPREADSHEET.getSheetByName(SETTINGS_SHEET_NAME);
    if (!sheet)
        throw new Error("Error retreiveing app settings");
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
 * saves apps settings from the spreadsheet
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
    console.log(newSheetRows);
    sheet.getDataRange().clear();
    sheet.getRange(1, 1, newSheetRows.length, headers[0].length)
        .setValues(newSheetRows);
    return "Success";
}
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
 * Gets the value of Wednesday Interventions (on/off)
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
 * Gets the docId for the published Tutoring schedule, for linking within the form
 */
function getTutoringDocId() {
    const range = SPREADSHEET.getRangeByName(TUTORING_DOCID_RANGE_NAME);
    if (!range)
        return "";
    return range.getValue();
}
/**
 * Gets the boolean for whether NHS tutoring should be shown
 */
function getTutoringStatus() {
    const range = SPREADSHEET.getRangeByName(TUTORING_TOGGLE_RANGE_NAME);
    if (!range)
        return false;
    return range.getValue() == "true";
}
/**
 * Gets the docId for the published Interventions schedule, for linking within the form
 *
 * @return {string} The doc id
 */
function getInterventionsDocId() {
    const range = SPREADSHEET.getRangeByName(INTERVENTIONS_DOCID_RANGE_NAME);
    if (!range)
        return "";
    return range.getValue();
}
/**
 * Returns an array of email addresses for people allowed to edit.
 * These values are stored in the settings page of the spreadsheet
 *
 * @return {string[]} Array of email addresses
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
    // data is stored as comma-separated values
    const editors = parseDataEditors(values);
    cache.put("data-editors", JSON.stringify(editors), 21600);
    return editors;
}
function parseDataEditors(csvString) {
    let editors = csvString.split(",");
    editors = editors.map(e => e.trim());
    return editors;
}
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
