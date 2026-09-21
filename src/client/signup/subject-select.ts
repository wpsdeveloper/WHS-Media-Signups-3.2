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
  store.setState({ currentSubject: selectedSubject });
};

/**
 *  Updates the Subject select box based on the date and period selected 
 * */
export const updateSubjectOptions = (
  currentScheduleBlock: DailyBlock | null,
) => {
  // clears previous options
   dom.clearOptions("#subject-int-select");

  if (!currentScheduleBlock) return;
  const availableTeachers = currentScheduleBlock.interventionTeachers;
  availableTeachers.forEach(teacher => {
    dom.appendOption("#subject-int-select", teacher, teacher);
  });
}

/**
 * Subscriber: Re-calculates and populates subject options when dependencies change.
 */
export const setupSubjectObservers = () => {
  // updates subject selectbox options based on date/period selection
  store.subscribe((state: SignupState) => {
    updateSubjectOptions(
      state.currentScheduleBlock,
    );
  }, ['currentScheduleBlock']);
  
  // updates study teacher if the data is changed externally
  store.subscribe((state: SignupState) => {
    const selectElem = dom.qs("#subject-int-select") as HTMLInputElement;
    if (selectElem && state.currentSubject && selectElem.value !== state.currentSubject) {
      dom.setValue("#subject-int-select", state.currentSubject);
    }
  }, ['currentSubject']);
};