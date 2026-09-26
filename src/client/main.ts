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
import attendanceHtml from './attendance/attendance.html?raw';
import adminHtml from './admin/admin.html?raw';
import signupHtml from './signup/signup-form.html?raw';

import { initializeApp as initializeSignup } from "./signup/init";
import { initializeApp as initializeAdmin } from "./admin/init";
import { initializeApp as initializeAttendance } from "./attendance/init";

import { getAppConfig } from './common/app-config';
import { IS_DEBUG } from './common/debug';


const appDiv = document.getElementById('app') as HTMLElement;


/* Initialization, after everything has loaded */
document.addEventListener("DOMContentLoaded", () => {
  mountApp();
});

// Client-side router based on server-validated state
async function mountApp() {
  const appConfig = await getAppConfig();
  if (!appConfig) throw new Error("Error initializing app");
  const view = IS_DEBUG ? 'signup' : appConfig.view;

  switch (view) {
    case 'attendance':
      renderAttendance(appDiv);
      break;
    case 'admin':
      renderAdmin(appDiv);
      break;
    case 'signup':
    default:
      renderSignup(appDiv);
      break;
      // renderError(appDiv);
  }
}

function renderSignup(appDiv: HTMLElement) {
  // 1. Inject the raw HTML into the container
  appDiv.innerHTML = signupHtml;
  initializeSignup();
}

function renderAttendance(appDiv: HTMLElement) {
  // 1. Inject the raw HTML into the container
  appDiv.innerHTML = attendanceHtml;
  initializeAttendance();
}

function renderAdmin(appDiv: HTMLElement) {
  // 1. Inject the raw HTML into the container
  appDiv.innerHTML = adminHtml;
  initializeAdmin();
}



