import * as dom from '../common/dom';
import * as messaging from '../common/messaging';
import * as parser from '../common/parsers';
import { store } from './admin-store';

export const getAuditHandler = async () => {
  try {
    const nameDiv = dom.qs("#student-name") as HTMLInputElement
    const student = nameDiv.value.trim() || "";

    if (student.length < 3) {
      return;
    }
    // this is a teacher submission
    // breaks apart the line selected in the student datalist
    const brackets = student.indexOf(" <") >0 ? student.split(" <") : [];
    const emailStudent = (brackets.length == 2) ? brackets[1].trim().substring(0, brackets[1].length-1) : "";
  
    if (emailStudent) {
      store.setState({ requestedStudentEmail: emailStudent });
    }
  } catch (error) {
    messaging.processError((error as Error), "Error parsing student name:");
  }
}

/**
 *  Requests student data from the server asynchronously
 */ 
export const getStudentAudit = async (emailStudent: string): Promise<string> => {
  // this is a teacher submission
  // breaks apart the line selected in the student datalist
  try {
    messaging.showLoadingModal("Getting student data");
    
    return new Promise((resolve, reject) => {
      google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      .getStudentAudit(emailStudent);
  });
  } catch (error) {
    messaging.processError((error as Error), "Error getting audit data:");
    messaging.hideLoadingModal();
    return "";
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
  const sampleData = await import('../../sampledata');
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  return sampleData.adminAudit;
}
