import * as dom from '../common/dom';
import * as dates from "../common/dates";
import * as messaging from "../common/messaging";
import { IS_DEBUG } from '../common/debug';
import { CHECKIN_CONFIG, CheckinBox } from './checkin-box';

/**
 *  Responds to a Checkin button click 
 * */
export const saveCheckinTime = async(checkinBox: CheckinBox) => {
  const propName = checkinBox.propName;
  const time = checkinBox.timeValue;
  const rowId = checkinBox.rowId;

  // sends the checkin request to the server for async processing
  await setCheckinOnServer(propName, rowId, time);
}


/**
 * Sends checkin data to the server asynchronously 
 * 
 * @param {string} type The field to set
 * @param {string} id The row id of the data
 * @param {string} value The value to store, typically a time or ""
 * */
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

async function sendCheckinToServer(type: CheckinBox['type'], id: CheckinBox['rowId'], value: string): Promise<{type: CheckinBox['type'], id: CheckinBox['rowId'], value: string}> {
  return new Promise((resolve, reject) => {
    google.script.run
    .withSuccessHandler(resolve)
    .withFailureHandler(reject)
    .setCheckin(type, id, value);
  });
}

/**
 *  Receives checkin data results 
 * */
export const checkinSuccess = (returnVal: {propName: string, id: CheckinBox['rowId'], value: string}) => {
  console.log("Checkin success:", returnVal);

}