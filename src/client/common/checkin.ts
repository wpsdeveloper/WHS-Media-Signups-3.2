import * as dom from '../common/dom';
import * as dates from "../common/dates";
import * as messaging from "../common/messaging";
import { IS_DEBUG } from '../common/debug';
import { CHECKIN_CONFIG, CheckinBox } from './checkin-box';

/**
 *  Responds to a Checkin button click 
 * */
export const checkin = async(checkinBox: CheckinBox, time: string): Promise<string> => {
  // sets the value to the current time
  if (IS_DEBUG) return time; // simulates instant success in debug mode

  // sends the checkin request to the server for async processing
  await setCheckin(checkinBox.type, checkinBox.rowId, time);

  return time;
}

export const showEditCheckin = (type: CheckinType, button: HTMLButtonElement) => {
  // determines the rowId of the signup belonging to that button
  const id = button?.closest(".data-row")?.getAttribute('dataset-signup-id');
  if (!id) return;

  // matches the type with a div class
  const divClass = CHECKIN_CONFIG[type].className;
  if (!divClass) return;

  const box = `.data-row[data-signup-id="${id}"] ${divClass}`;
  dom.setVisible(`${box} .time-edit`, true);
  dom.setVisible(`${box} button, ${box} .primary-buttons, ${box} .time-value`, false);
}

export const cancelEditCheckin = (type: CheckinType, button: HTMLButtonElement) => {
  // determines the rowId of the signup belonging to that button
  const id = button?.closest(".data-row")?.getAttribute('dataset-signup-id');
  if (!id) return;

  // matches the type with a div class
  const divClass = CHECKIN_CONFIG[type].className;
  if (!divClass) return;

  const box = `.data-row[data-signup-id="${id}"] ${divClass}`;
  dom.setVisible(`${box} .time-edit`, false);
  dom.setVisible(`${box} button`, false);
  dom.setVisible(`${box} .primary-buttons`, true);
  dom.setVisible(`${box} .time-value`, true);
}

export const formatCheckin = (type: CheckinType, id: CheckinBox['rowId'], timeValue: string) => {
  const divClass = CHECKIN_CONFIG[type].className;
  if (!id || !divClass) return;
  
  // Updates the checkin box UI
  const box = `.data-row[data-signup-id="${id}"] ${divClass}`;
  dom.setVisible(`${box} .spinner`, false);

  if (timeValue === "") {
    dom.setVisible(`${box} button`, true);
    dom.setVisible(`${box} .time`, false);
    dom.setValue(`${box} .timeInput`, "");
    dom.setVisible(`${box} .time-edit`, false);
  } else {
    dom.setVisible(`${box} button`, false);
    dom.setVisible(`${box} .time`, true);
    dom.setText(`${box}.time-value`, timeValue);
    dom.setVisible(`${box} .primary-buttons`, true);
    dom.setVisible(`${box} .time-edit`, false);
    dom.setValue(`${box} .timeInput`, timeValue);
  }
}

/**
 * Responds to a checkin cancel X button click
 * 
 * @param {string} type The specific category of checkin (e.g. "mediaOut")
 * @type {button} button The button that was clicked 
 * */
export const cancelCheckin = (type: CheckinType, button: HTMLButtonElement) => {
  // determines the rowId of the signup belonging to that button
  const id = button?.closest(".data-row")?.getAttribute('dataset-signup-id');
  if (!id) return;

  // matches the type with a div class
  const divClass = CHECKIN_CONFIG[type].className;
  if (!divClass) return;

  // shows a loading UI for the button
  const box = `.data-row[data-signup-id="${id}"] ${divClass}`;
  dom.setVisible(`${box} .spinner`, true);
  dom.qsa<HTMLButtonElement>(`${box} button .time`).forEach(element => dom.setVisible(element, false));
  
  // sets the value to blank i.e. a blank (cleared) cell in the spreadsheet
  const value = "";
  
  // sends the checkin request to the server for async processing
  setCheckin(type, id, value)
}

export const editCheckin = (type: CheckinType, button: HTMLButtonElement) => {
   const id = button?.closest(".data-row")?.getAttribute('dataset-signup-id');
  if (!id) return;

  // matches the type with a div class
  const divClass = CHECKIN_CONFIG[type].className;
  if (!divClass) return;

  const box = dom.qs<HTMLElement>(`.data-row[data-signup-id="${id}"] ${divClass}`);
  const inputtedValue = dom.valueOf(`${box} input`);

  if (!dates.isValidTime24Hr(inputtedValue)) {
    dom.qs(`${box} .validation-error`)?.remove();

    const error = document.createElement("span");
    error.className = "validation-error text-danger";
    error.innerHTML = "<small>Invalid time</small>";
    
    dom.qs(`${box}`)?.append(error);
    return;
  }
  dom.qs(`${box} .validation-error`)?.remove();
  
  dom.setVisible(`${box} .spinner`, true);
  dom.qsa<HTMLElement>(`${box} button, .time`).forEach(element => dom.setVisible(element, false));
 
  // sends the checkin request to the server for async processing
  setCheckin(type, id, inputtedValue);

  // const thisSignup = SIGNUPS.filter(su => su.rowId == id);
  // thisSignup.forEach(su => {
  //   su[type] = inputtedValue;
  // });
}

/**
 *  Receives checkin data results 
 * */
export const checkinSuccess = (returnVal: {type: CheckinBox['type'], id: CheckinBox['rowId'], value: string}) => {
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
export const setCheckin = async (type: CheckinBox['type'], id: CheckinBox['rowId'], value: string) => {
  if (IS_DEBUG) {
    checkinSuccess({ type: type, id: id, value: value });
    return;
  }
  try {
    const returnVal = await sendCheckinToServer(type, id, value);
    checkinSuccess(returnVal);
  } catch (error) {
    messaging.processError(error as Error, "Error sending data to server");
  }
}

async function sendCheckinToServer(type: CheckinBox['type'], id: CheckinBox['rowId'], value: string): Promise<{type: CheckinBox['type'], id: CheckinBox['rowId'], value: string}> {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      .setCheckin(type, id, value);
  });
}
