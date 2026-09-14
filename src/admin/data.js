import * as dom from '../common/dom.js';
import * as messaging from '../common/messaging.js';
import * as parser from '../common/parsers.js';
import { store } from './store.js';
import { DEBUG } from "../common/debug.js"; 

export const getAuditHandler = async () => {
  if (dom.qs("#student-name").value.length < 3) {
    return;
  }
  // this is a teacher submission
  // breaks apart the line selected in the student datalist
  try {
    const student = dom.qs("#student-name").value || "";
    const brackets = student.indexOf(" <") >0 ? student.split(" <") : [];

    const emailStudent = (brackets.length == 2) ? brackets[1].trim().substring(0, brackets[1].length-1) : "";
  
    if (emailStudent) {
      store.setState({ requestedStudentEmail: emailStudent });
    }
  } catch (error) {
    messaging.processError(error, "Error parsing student name:");
  }
}

/**
 *  Requests student data from the server asynchronously
 */ 
export const getStudentAudit = async () => {
  // this is a teacher submission
  // breaks apart the line selected in the student datalist
  try {
    const emailStudent = store.getState().requestedStudentEmail;

    messaging.showLoadingModal("Getting student data");
    if (DEBUG) {
      return setMockData();
    }
    
    return new Promise((resolve, reject) => {
      google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      .getStudentAudit(emailStudent);
    });
  } catch (error) {
    messaging.processError(error, "Error getting audit data:");
    messaging.hideLoadingModal;
  }
}

/**
 * Subscriber: Updates suggestions when studentNames or current query change in store.
*/
export const setupAuditObserver = () => {
  store.subscribe(async (state) => {
    const auditData = await getStudentAudit(state.currentStudentName);
    const signups = parser.parseSignups(auditData);
    store.setState({signups: signups});
    
    messaging.hideLoadingModal();
  }, ['requestedStudentEmail']);
};

async function setMockData() {
  const sampleData = await import('../../sampledata.js');
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  return sampleData.adminAudit;
}
