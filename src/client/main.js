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
import { initAppConfig, getAppConfig } from "../common/appConfig";
import attendanceHtml from './attendance/attendance.html?raw';
import adminHtml from './admin/admin.html?raw';
import signupHtml from './signup/signup-form.html?raw';

import { initializeApp as initializeSignup } from "./signup/init";
import { initializeApp as initializeAdmin } from "./admin/init";
import { initializeApp as initializeAttendance } from "./attendance/init";

const appDiv = document.getElementById('app');
const APP_CONFIG = await APP_CONFIG;


/* Initialization, after everything has loaded */
document.addEventListener("DOMContentLoaded", () => {
  mountApp();
});


// Client-side router based on server-validated state
async function mountApp() {
  await initAppConfig();
  const appConfig = getAppConfig();
  const { view } = appConfig;

  switch (view) {
    case 'attendance':
      renderAttendance(appDiv);
      break;
    case 'admin':
      renderAdmin(appDiv);
      break;
    case 'signup':
    case 'update':
    default:
      renderSignup(appDiv);
      break;
      // renderError(appDiv);
  }
}

function renderSignup(appDiv) {
  // 1. Inject the raw HTML into the container
  appDiv.innerHTML = signupHtml;
  initializeSignup();
}

function renderAttendance(appDiv) {
  // 1. Inject the raw HTML into the container
  appDiv.innerHTML = attendanceHtml;
  initializeAttendance();
}

function renderAdmin(appDiv) {
  // 1. Inject the raw HTML into the container
  appDiv.innerHTML = adminHtml;
  initializeAdmin();
}



