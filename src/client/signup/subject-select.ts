import * as dom from "../common/dom"
import { parseDateInput, isSameDate } from "../common/dates";
import { getAppConfig } from "../common/app-config";
import { SignupState, store } from './signup-store';
import * as dates from "../common/dates";

/**
 * Publisher: Responds to user subject selection changes.
 * Updates store state only.
 */
export const subjectChangeHandler = (event: MouseEvent) => {
  if (!event) return;
  const target = event.target as HTMLInputElement;
  const selectedSubject = target.value;
  store.setState({ ui_currentSubject: selectedSubject });
};

/**
 *  Updates the Subject select box based on the date and period selected 
 * */
export const updateSubjectOptions = (
  currentScheduleBlock: DailyBlock | null,
  currentSubject: string | null
) => {
  // clears previous options
   dom.clearOptions("#subject-int-select");

  if (!currentScheduleBlock) return;
  const availableTeachers = currentScheduleBlock.interventionTeachers;
  availableTeachers.forEach(teacher => {
    dom.appendOption("#subject-int-select", teacher, teacher);
  });

  if (currentSubject && !availableTeachers.includes(currentSubject)) {
    dom.appendOption("#subject-int-select", currentSubject, currentSubject, true);
  }
}

/**
 * Subscriber: Re-calculates and populates subject options when dependencies change.
 */
export const setupSubjectObservers = () => {
  // updates subject selectbox options based on date/period selection
  store.subscribe((state: SignupState) => {
    updateSubjectOptions(
      state.ui_currentScheduleBlock,
      state.ui_currentSubject,
    );
  }, ['ui_currentScheduleBlock']);
  
  // updates study teacher if the data is changed externally
  store.subscribe((state: SignupState) => {
    const selectElem = dom.qs("#subject-int-select") as HTMLInputElement;
    if (selectElem && state.ui_currentSubject && selectElem.value !== state.ui_currentSubject) {
      dom.setValue("#subject-int-select", state.ui_currentSubject);
    }
  }, ['ui_currentSubject']);
};