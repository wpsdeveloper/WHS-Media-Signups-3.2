"use strict";
/**
 * @file page-server.ts
 * @description Serves HTML pages, handles doGet entry points, and packages initial JSON data payloads for client apps.
 */
let email;
/**
 * Handles HTTP GET requests to serve web app pages and pre-inject initial configuration and state data.
 *
 * @param event - Google Apps Script event object containing request parameters.
 * @returns The rendered HtmlOutput instance or permission denied template.
 */
function doGet(event) {
    const template = createIndexTemplate();
    const page = getUrlParameter(event, "page");
    const settings = getAppSettings();
    const wedInt = settings.find(setting => setting.key === "Wed_Int_Active")?.value === 'On';
    const userIsStaff = isStaff();
    const userIsAdmin = mayViewAdmin();
    const appConfig = {
        view: page ? page : "signup",
        isEditor: mayEdit(),
        isAdmin: userIsAdmin,
        isStaff: userIsStaff,
        email: getEmail(),
        updateId: getPageId(event),
        wedInt: wedInt,
        scriptUrl: getScriptUrl(),
    };
    let initialDataJson = "";
    try {
        const view = appConfig.view;
        if (view === "signup" || view === "update") {
            initialDataJson = getInitialSignupData(appConfig.updateId);
        }
        else if (view === "attendance" && userIsStaff) {
            initialDataJson = getInitialAttendanceData();
        }
        else if (view === "admin" && userIsAdmin) {
            initialDataJson = getInitialAdminData();
        }
        else {
            throw new Error(`Invalid permissions for view: ${view}`);
        }
    }
    catch (err) {
        console.warn(err);
        return getNotAllowedTemplate();
    }
    template.addMetaTag('viewport', 'width=device-width, initial-scale=1');
    template.setTitle("WHS Intervention & Media Center Sign Up");
    template.append(`
    <script>
      window.APP_CONFIG = ${JSON.stringify(appConfig)};
      window.INITIAL_DATA = ${initialDataJson ? JSON.stringify(initialDataJson) : "null"};
    </script>
  `);
    return template;
}
/**
 * Returns the "not allowed" HtmlOutput template when access permissions fail.
 *
 * @returns HtmlOutput for restricted access.
 */
function getNotAllowedTemplate() {
    const nopeTemplate = HtmlService.createHtmlOutputFromFile('server/not-allowed.html');
    nopeTemplate.addMetaTag('viewport', 'width=device-width, initial-scale=1');
    nopeTemplate.setTitle("WHS Intervention & Media Center Sign Up");
    return nopeTemplate;
}
/**
 * Extracts the record ID from the event parameters if present.
 *
 * @param event - Google Apps Script event object.
 * @returns The update record ID string.
 */
function getPageId(event) {
    return getUrlParameter(event, "id");
}
/**
 * Gets a URL parameter value (e.g. "page" from URL).
 *
 * @param e - Google Apps Script event object.
 * @param parameterName - The query parameter name.
 * @returns The parameter value string.
 */
function getUrlParameter(e, parameterName) {
    if (!e)
        return "";
    const parameters = e.parameters;
    if (parameters.hasOwnProperty(parameterName)) {
        return parameters[parameterName][0];
    }
    return "";
}
/**
 * Creates the base HTML output template from index.html.
 *
 * @returns HtmlOutput instance.
 */
function createIndexTemplate() {
    const template = HtmlService.createHtmlOutputFromFile('index.html');
    return template;
}
/**
 * Gathers initial data payload for signup view.
 *
 * @param updateId - Optional signup record ID being updated.
 * @returns JSON string of initial signup data.
 */
function getInitialSignupData(updateId) {
    const appSettings = getAppSettings();
    const students = [];
    const dailySchedules = getCachedOrParsedCalendarBlocks(appSettings);
    const signups = getSignups();
    if (!dailySchedules || !appSettings)
        throw new Error("Error retrieving server data");
    let updateData = null;
    if (updateId) {
        updateData = signups.find(s => s.rowId === updateId) || null;
    }
    const initialData = {
        students: students,
        dailySchedules: dailySchedules,
        signups: signups,
        appSettings: appSettings,
        updateData: updateData ? JSON.stringify(updateData) : null,
    };
    return JSON.stringify(initialData);
}
/**
 * Gathers initial data payload for attendance view.
 *
 * @returns JSON string of initial attendance data.
 */
function getInitialAttendanceData() {
    const appSettings = getAppSettings();
    const dailySchedules = getCachedOrParsedCalendarBlocks(appSettings);
    const signups = getSignups();
    if (!dailySchedules || !appSettings)
        throw new Error("Error retrieving server data");
    const initialData = {
        dailySchedules: dailySchedules,
        signups: signups,
        appSettings: appSettings,
    };
    return JSON.stringify(initialData);
}
/**
 * Gathers initial data payload for admin audit view.
 *
 * @returns JSON string of initial admin data.
 */
function getInitialAdminData() {
    const appSettings = getAppSettings();
    const students = [];
    const dailySchedules = getCachedOrParsedCalendarBlocks(appSettings);
    if (!dailySchedules || !appSettings)
        throw new Error("Error retrieving server data");
    const initialData = {
        students: students,
        dailySchedules: dailySchedules,
        appSettings: appSettings,
        settings: appSettings,
    };
    return JSON.stringify(initialData);
}
