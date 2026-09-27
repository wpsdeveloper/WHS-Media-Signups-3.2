import * as dom from '../common/dom';
import * as messaging from '../common/messaging';
import * as parser from '../common/parsers';
import { store } from './admin-store';
import { IS_DEBUG, getMockData } from '../common/debug';

export const getAuditHandler = async () => {
  try {
    const nameDiv = dom.qs("#student-name") as HTMLInputElement;
    const student = nameDiv?.value.trim() || "";

    if (student.length < 2) {
      return;
    }
    // this is a teacher submission
    // breaks apart the line selected in the student datalist
    const brackets = student.indexOf(" <") > 0 ? student.split(" <") : [];
    let emailStudent = (brackets.length === 2) ? brackets[1].trim().substring(0, brackets[1].length - 1) : "";
  
    // Direct email or bracketed email format fallback
    if (!emailStudent && student.includes("@")) {
      emailStudent = student.replace(/[<>]/g, '').trim();
    }

    if (emailStudent) {
      store.setState({ ui_requestedStudentEmail: emailStudent });
    }
  } catch (error) {
    messaging.processError((error as Error), "Error parsing student name:");
  }
};

/**
 *  Requests student data from the server asynchronously
 */ 
export const getStudentAudit = async (emailStudent: string): Promise<string> => {
  try {
    messaging.showLoadingModal("Getting student data");
    if (IS_DEBUG) {
      return await getMockData('audit');
    }
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
};

/**
 * Subscriber: Updates suggestions when studentNames or current query change in store.
*/
export const setupAuditObserver = () => {
  store.subscribe(async (state) => {
    if (!state.ui_requestedStudentEmail) return;
    try {
      const auditData = await getStudentAudit(state.ui_requestedStudentEmail);
      const parsedData = parser.safeJsonParse(auditData);
      const signups = parser.parseSignups(parsedData);
      store.setState({ signups: signups });
    } catch (error) {
      console.error("Error updating student audit state:", error);
    } finally {
      messaging.hideLoadingModal();
    }
  }, ['ui_requestedStudentEmail']);
};

