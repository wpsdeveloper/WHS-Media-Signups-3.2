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
export const getStudentAudit = async (emailStudent?: string): Promise<string> => {
  const targetEmail = emailStudent !== undefined ? emailStudent : (store.getState().ui_requestedStudentEmail || (store.getState() as any).requestedStudentEmail);
  try {
    messaging.showLoadingModal("Getting student data");
    if (IS_DEBUG) {
      return await getMockData('audit');
    }
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .getStudentAudit(targetEmail);
    });
  } catch (error) {
    messaging.processError((error as Error), "Error getting audit data:");
    messaging.hideLoadingModal();
    return "";
  }
};

/**
 * Handles saving all updated App Settings back to the spreadsheet
 */
export const saveSettingsHandler = async () => {
  try {
    messaging.showLoadingModal("Saving settings");
    const state = store.getState();
    const currentSettings = state.settings || [];

    const updatedRows: [string, any, string, string, string][] = currentSettings.map(setting => {
      const safeKey = (setting.key || '').replace(/[^a-zA-Z0-9_-]/g, "_");
      const rowElem = dom.qs(`.settings-row[data-key="${setting.key}"]`) as HTMLElement | null;

      let value = setting.value;

      if (rowElem) {
        const checkedRadio = rowElem.querySelector(".value input[type='radio']:checked") as HTMLInputElement | null;
        if (checkedRadio) {
          value = checkedRadio.value; // "On" or "Off"
        } else {
          const input = rowElem.querySelector(".value input") as HTMLInputElement | null;
          if (input) {
            value = input.value;
          }
        }
      }

      const dataType = setting.dataType || (setting as any).type || 'string';
      if (dataType === 'boolean') {
        const strVal = String(value).trim().toLowerCase();
        value = (strVal === 'on' || strVal === 'true' || value === true) ? 'On' : 'Off';
      }

      return [
        setting.key,
        value,
        setting.description || '',
        setting.comments || '',
        dataType,
      ];
    });

    if (IS_DEBUG) {
      messaging.showSuccessToast("Settings saved successfully");
      messaging.hideLoadingModal();
      return;
    }

    await new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler((res) => {
          messaging.showSuccessToast("Settings saved successfully");
          resolve(res);
        })
        .withFailureHandler((err) => {
          messaging.processError(err as Error, "Error saving settings:");
          reject(err);
        })
        .saveAppSettings(JSON.stringify(updatedRows));
    });
  } catch (error) {
    messaging.processError(error as Error, "Error saving settings:");
  } finally {
    messaging.hideLoadingModal();
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

