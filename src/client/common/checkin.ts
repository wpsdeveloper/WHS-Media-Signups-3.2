/**
 * @file checkin.ts
 * @description Handles student check-in and check-out operations, communicating with backend Google Apps Script or debug mocks.
 */

import * as dom from '../common/dom';
import * as dates from "../common/dates";
import * as messaging from "../common/messaging";
import { IS_DEBUG } from '../common/debug';
import { CHECKIN_CONFIG, CheckinBox } from './checkin-box';

/**
 * Responds to a Checkin button click and initiates server upload.
 * 
 * @param checkinBox - The CheckinBox component instance triggering the save.
 */
export const saveCheckinTime = async(checkinBox: CheckinBox) => {
  const propName = checkinBox.propName;
  const time = checkinBox.timeValue;
  const rowId = checkinBox.rowId;

  // Sends the checkin request to the server for async processing
  await setCheckinOnServer(propName, rowId, time);
}


/**
 * Sends checkin data to the server asynchronously or resolves locally in debug mode.
 * 
 * @param propName - The property name corresponding to the checkin type.
 * @param id - The row ID of the signup record.
 * @param value - The time value to store, or empty string.
 */
export const setCheckinOnServer = async (propName: string, id: CheckinBox['rowId'], value: string) => {
  if (IS_DEBUG) {
    checkinSuccess({ propName: propName, id: id, value: value });
    return;
  }
  try {
    await sendCheckinToServer(propName, id, value);
  } catch (error) {
    messaging.processError(error as Error, "Error sending data to server");
  }
}

/**
 * Internal helper to invoke Google Apps Script backend `setCheckin` function.
 * 
 * @param type - The check-in type or property name.
 * @param id - The signup row ID.
 * @param value - The check-in time value.
 * @returns A promise resolving to the checkin result object.
 */
async function sendCheckinToServer(type: CheckinBox['type'], id: CheckinBox['rowId'], value: string): Promise<{type: CheckinBox['type'], id: CheckinBox['rowId'], value: string}> {
  return new Promise((resolve, reject) => {
    google.script.run
    .withSuccessHandler(resolve)
    .withFailureHandler(reject)
    .setCheckin(type, id, value);
  });
}

/**
 * Logs success of check-in data persistence.
 * 
 * @param returnVal - Object containing propName, record id, and saved value.
 */
export const checkinSuccess = (returnVal: {propName: string, id: CheckinBox['rowId'], value: string}) => {
  console.log("Checkin success:", returnVal);
}
