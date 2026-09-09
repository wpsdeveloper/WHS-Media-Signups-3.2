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
import * as dom from "./signup/dom.js";
import { dateChangeHandler } from "./signup/date-select.js";
import { periodChangeHandler } from "./signup/period-select.js";
import { typeChangeHandler } from "./signup/type-input.js";
import { submitForm, startOver } from "./signup/form-data.js";

/* Initialization, after everything has loaded */
document.addEventListener("DOMContentLoaded", () => {
  init.initializeApp(state);

  // Wire up event handlers to their respective modules:
  dom.addEventListener("#date", "change", (e) => {
    dateChangeHandler(state);
  });
  
  dom.addEventListener("#period", "change", (e) => {
    periodChangeHandler(state);
  });
  
  dom.addEventListener("#type, .purpose", "change", (e) => {
    typeChangeHandler(state);
  });

  dom.addEventListener('#btn-submit, #btn-update', 'click', () => submitForm(state));
  // if (events.submitForm) dom.addEventListener('#btn-update', 'click', ui.submitForm);
  dom.addEventListener('.success-box-start-over', 'click', startOver);
});





