/** ======= CLIENT CODE  ======== 
 * Javascript code (client-side) for the Signup Form
 * 
 * Media Center Sign Up System
 * Walpole High School, Walpole, MA
 * @author: Tom Reeve, treeve@walpole.k12.ma.us
 *
 * Note: This script handles both new submissions and the updating of existing data.
 * Updates are done by appending "?page=update&id" plus the record's row id to the URL.
 */  
import { DEBUG } from "./common/debug.js";
import attendanceHtml from './attendance/attendance.html?raw';
import adminHtml from './admin/admin.html?raw';
import signupHtml from './signup/signup-form.html?raw';

import { initializeApp as initializeSignup } from "./signup/init.js";
// import { initializeApp as initializeAdmin } from "./admin/init.js";
import { initializeApp as initializeAttendance } from "./attendance/init.js";

const appDiv = document.getElementById('app');
const appConfig = getServerInjection();


/* Initialization, after everything has loaded */
document.addEventListener("DOMContentLoaded", () => {
  mountApp();
});

function getServerInjection() {
  //assume debugging if page is served locally
  if (DEBUG) {
    return {
      viewState: { 
        view: 'attendance', 
        data: {} 
      },
      globals: {
        LOGO_ID: "",
        SCRIPT_URL: "",
        WED_INT_ACTIVE: true,
      },
    };
  } 
  
  return JSON.parse(window.__SERVER_DATA__);
}

// Client-side router based on server-validated state
function mountApp() {
  const { view, data } = appConfig.viewState;
  const globals = {}; //appConfig.globals;

  switch (view) {
    case 'attendance':
      renderAttendance(appDiv, globals);
      break;
    case 'admin':
      renderAdmin(appDiv, globals);
      break;
    case 'signup':
    case 'update':
    default:
      renderSignup(appDiv, data, globals);
      break;
      // renderError(appDiv);
  }
}

function renderSignup(appDiv, data, globals) {
  // 1. Inject the raw HTML into the container
  appDiv.innerHTML = signupHtml;
  initializeSignup();
}

function renderAttendance(appDiv, data, globals) {
  // 1. Inject the raw HTML into the container
  appDiv.innerHTML = attendanceHtml;
  initializeAttendance();
}

function renderAdmin(appDiv, data, globals) {
  // 1. Inject the raw HTML into the container
  appDiv.innerHTML = adminHtml;
  initializeAdmin();
}



