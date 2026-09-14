import * as dom from '../common/dom.js';
import * as dates from "../common/dates.js";
import * as messaging from "../common/messaging.js";
import { DEBUG } from '../common/debug.js';

// matches the type with a div class
const divClass = {
  "study-checkin": ".study-checkin",
  "media-checkin": ".media-checkin",
  "media-checkout": ".media-checkout",
  "study-return": ".study-return",
};

/**
 *  Responds to a Checkin button click 
 * 
 * @param {string} type The specific category of checkin (e.g. "mediaOut")
 * @type {button} button The button that was clicked 
 * */
export const checkin = (checkinBox, time) => {
  // sets the value to the current time
  if (DEBUG) return time; // simulates instant success in debug mode

  // determines the rowId of the signup belonging to that button
  const id = checkinBox.rowId;

  // sends the checkin request to the server for async processing
  setCheckin(checkinBox.type, checkinBox.rowId, formattedTime);

  return formattedTime;
}

export const showEditCheckin = (type, button) => {
  // determines the rowId of the signup belonging to that button
  const id = button.closest(".data-row").dataset.signupId;

  // matches the type with a div class
  const divClass = {
    "studyIn1": ".study-checkin",
    "mediaIn": ".media-checkin",
    "mediaOut": ".media-checkout",
    "studyIn2": ".study-return",
  };

  const box = `.data-row[data-signup-id="${id}"] ${divClass[type]}`;
  dom.setVisible(`${box} .time-edit`, true);
  dom.setVisible(`${box} button, ${box} .primary-buttons, ${box} .time-value`, false);
}

export const cancelEditCheckin = (type, button) => {
  // determines the rowId of the signup belonging to that button
  const id = button.closest(".data-row").dataset.signupId;

  // matches the type with a div class
  const divClass = {
    "studyIn1": ".study-checkin",
    "mediaIn": ".media-checkin",
    "mediaOut": ".media-checkout",
    "studyIn2": ".study-return",
  };

  const box = `.data-row[data-signup-id="${id}"] ${divClass[type]}`;
  dom.setVisible(`${box} .time-edit`, false);
  dom.setVisible(`${box} button`, false);
  dom.setVisible(`${box} .primary-buttons`, true);
  dom.setVisible(`${box} .time-value`, true);
}

export const formatCheckin = (type, id, value) => {
  // matches the type with a div class
  const divClass = {
    "studyIn1": ".study-checkin",
    "mediaIn": ".media-checkin",
    "mediaOut": ".media-checkout",
    "studyIn2": ".study-return",
  };

  // Updates the checkin box UI
  const box = `.data-row[data-signup-id="${id}"] ${divClass[type]}`;
  dom.setVisible(`${box} .spinner`, false);

  if (value === "") {
    dom.setVisible(`${box} button`, true);
    dom.setVisible(`${box} .time`, false);
    dom.setValue(`${box} .timeInput`, "");
    dom.setVisible(`${box} .time-edit`, false);
  } else {
    dom.setVisible(`${box} button`, false);
    dom.setVisible(`${box} .time`, true);
    dom.setText(`${box}.time-value`, dates.formatTime(value));
    dom.setVisible(`${box} .primary-buttons`, true);
    dom.setVisible(`${box} .time-edit`, false);
    dom.setValue(`${box} .timeInput`, dates.formatTime(value));
  }
}



/**
 * Responds to a checkin cancel X button click
 * 
 * @param {string} type The specific category of checkin (e.g. "mediaOut")
 * @type {button} button The button that was clicked 
 * */
export const cancelCheckin = (type, button) => {
  // determines the rowId of the signup belonging to that button
  const id = button.closest(".data-row").dataset.signupId;
  
  // matches the type with a div class
  const divClass = {
    "studyIn1": ".study-checkin",
    "mediaIn": ".media-checkin",
    "mediaOut": ".media-checkout",
    "studyIn2": ".study-return",
  };

  // shows a loading UI for the button
  const box = qs(`.data-row[data-signup-id="${id}"] ${divClass[type]}`);
  setVisible(qs(".spinner", box), true);
  qsa("button, .time", box).forEach(element => setVisible(element, false));
  
  // sets the value to blank i.e. a blank (cleared) cell in the spreadsheet
  const value = "";
  
  // sends the checkin request to the server for async processing
  setCheckin(type, id, value)
}

export const editCheckin = (type, button) => {
  // determines the rowId of the signup belonging to that button
  const id = button.closest(".data-row").dataset.signupId;
  
  // matches the type with a div class
  const divClass = {
    "studyIn1": ".study-checkin",
    "mediaIn": ".media-checkin",
    "mediaOut": ".media-checkout",
    "studyIn2": ".study-return",
  };

  const box = qs(`.data-row[data-signup-id="${id}"] ${divClass[type]}`);
  const inputtedValue = qs("input", box)?.value || "";
  if (!isValidTime(inputtedValue)) {
    qs(".validation-error", box)?.remove();
    const error = document.createElement("span");
    error.className = "validation-error text-danger";
    error.innerHTML = "<small>Invalid time</small>";
    box.append(error);
    return;
  }
  qs(".validation-error", box)?.remove();
  
  setVisible(qs(".spinner", box), true);
  qsa("button, .time", box).forEach(element => setVisible(element, false));
 
  // sends the checkin request to the server for async processing
  setCheckin(type, id, inputtedValue);

  const thisSignup = SIGNUPS.filter(su => su.rowId == id);
  thisSignup.forEach(su => {
    su[type] = inputtedValue;
  });
}

/**
 *  Receives checkin data results 
 * */
export const checkinSuccess = (returnVal) => {
  const type = returnVal.type;
  const id = returnVal.id;
  const value = returnVal.value;

  formatCheckin(type, id, value);
}

/**
 * Sends checkin data to the server asynchronously 
 * 
 * @param {string} type The field to set
 * @param {string} id The row id of the data
 * @param {string} value The value to store, typically a time or ""
 * */
export const setCheckin = (type, id, value) => {
  if (DEBUG) {
    checkinSuccess({ type: type, id: id, value: value });
    return;
  }

  google.script.run
    .withSuccessHandler(checkinSuccess)
    .withFailureHandler(messaging.processError)
    .setCheckin(type, id, value);
}

