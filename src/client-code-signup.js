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

import {
  state
} from "./signup/state.js";

import * as init from "./signup/init.js";
import * as ui from "./signup/ui.js";

/* Initialization, after everything has loaded */
document.addEventListener("DOMContentLoaded", () => {
  const events = {
    typeChanged: ui.typeChanged,
    dateChanged: ui.dateChanged,
    periodChanged: ui.periodChanged,
    submitForm: ui.submitForm,
    startOver: ui.startOver,
  }
  init.initializeApp(state, events);
});




