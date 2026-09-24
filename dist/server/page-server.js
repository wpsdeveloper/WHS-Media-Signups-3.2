"use strict";
/** ======= SERVER CODE  ========
 *
 * Media Center Sign Up System
 * Walpole High School, Walpole, MA
 * @author: Tom Reeve, treeve@walpole.k12.ma.us
 *
 * Note: This script relies on the AdminDirectory Service to access student names
 * and email addresses. This Service requires admin-level access.
 */
let email;
// function doGet() {
//   const data = getInitialSignupData();
//   const stringified = JSON.stringify(data, null, 2);
//   return ContentService.createTextOutput(data)
//   .setMimeType(ContentService.MimeType.JSON);
// }
/**
 * Creates HTML and client-side script to serve to the user
 */
function doGet(event) {
    const template = createIndexTemplate();
    const page = getUrlParameter(event, "page");
    const settings = getAppSettings();
    const wedInt = settings.find(setting => setting.key === "Wed_Int_Active")?.value === 'On';
    const appConfig = {
        view: page ? page : "signup",
        isEditor: mayEdit(),
        isAdmin: mayViewAdmin(),
        isStaff: isStaff(),
        email: getEmail(),
        updateId: getPageId(event),
        wedInt: wedInt,
        scriptUrl: getScriptUrl(),
    };
    // adds meta data so tha page reformats nicely on mobile devices
    template.addMetaTag('viewport', 'width=device-width, initial-scale=1');
    template.setTitle("WHS Intervention & Media Center Sign Up");
    template.append(`
    <script>
      window.APP_CONFIG = ${JSON.stringify(appConfig)};
    </script>
  `);
    // sends the HTML to the client
    return template;
}
function getPageId(event) {
    return getUrlParameter(event, "id");
}
/**
 * Gets a URL parameter value (e.g. "page" from "https://....?page=attendance")
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
function createIndexTemplate() {
    const template = HtmlService.createHtmlOutputFromFile('index.html');
    return template;
}
function getInitialSignupData() {
    const appSettings = getAppSettings();
    const students = getStudents();
    const dailySchedules = buildFlatScheduleData(appSettings);
    const signups = getSignups();
    if (!students || !dailySchedules || !appSettings)
        throw new Error("Error retreiving server data");
    const initialData = {
        students: students,
        dailySchedules: dailySchedules,
        signups: signups,
        appSettings: appSettings,
    };
    return JSON.stringify(initialData);
}
function getInitialAttendanceData() {
    const appSettings = getAppSettings();
    const dailySchedules = buildFlatScheduleData(appSettings);
    const signups = getSignups();
    if (!dailySchedules || !appSettings)
        throw new Error("Error retreiving server data");
    console.log(appSettings);
    const initialData = {
        dailySchedules: dailySchedules,
        signups: signups,
        appSettings: appSettings,
    };
    return JSON.stringify(initialData);
}
function getInitialAdminData() {
    const appSettings = getAppSettings();
    const students = getStudents();
    const dailySchedules = buildFlatScheduleData(appSettings);
    if (!students || !dailySchedules || !appSettings)
        throw new Error("Error retreiving server data");
    const initialData = {
        students: students,
        dailySchedules: dailySchedules,
        appSettings: appSettings,
    };
    return JSON.stringify(initialData);
}
