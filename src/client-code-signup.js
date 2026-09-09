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

import { initializeApp } from "./signup/init.js";
import { addEventListener } from "./signup/dom.js";
import { dateChangeHandler } from "./signup/date-select.js";
import { periodChangeHandler } from "./signup/period-select.js";
import { typeChangeHandler } from "./signup/type-input.js";
import { submitForm, startOver } from "./signup/form-data.js";

/* Initialization, after everything has loaded */
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();

  addEventListener("#date", "change", (e) => dateChangeHandler());
  addEventListener("#period", "change", (e) => periodChangeHandler());
  addEventListener("#type, .purpose", "change", (e) => typeChangeHandler());
  addEventListener('#btn-submit, #btn-update', 'click', () => submitForm());
  addEventListener('.success-box-start-over', 'click', startOver);
});





