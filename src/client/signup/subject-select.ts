import * as dom from "../common/dom"
import { parseDateInput, isSameDate } from "../common/dates"
import { SignupState, store } from "../common/store";
import { DailySchedule } from "../../shared/types/dailySchedule";
import * as dates from "../common/dates";

/**
 * Publisher: Responds to user subject selection changes.
 * Updates store state only.
 */
export const subjectChangeHandler = (event: MouseEvent) => {
  if (!event) return;
  const target = event.target as HTMLInputElement;
  const selectedSubject = target.value;
  store().setState({ currentSubject: selectedSubject });
};

/**
 *  Updates the Subject select box based on the date and period selected 
 * */
export const updateSubjectOptions = (
  currentDate: SignupState['currentDate'],
  currentPeriod: SignupState['currentPeriod'],
  interventionTeachers: SignupState['interventionTeachers'],
  dailySchedules: SignupState['dailySchedules'],
) => {
  // clears previous options
   dom.clearOptions("#subject-int-select");

  if (!interventionTeachers || !currentDate || !currentPeriod) return;

  const today = new Date();
  const s2Date = new Date(interventionTeachers.s2Date);

  const match = dailySchedules.filter(ds => 
    dates.isSameDate(ds.date, currentDate) 
  && (ds.period === currentPeriod));
  
  if (match.length > 0) {
    const sched = match[0];
    
    const availableTeachers = sched.intTeachers;
    availableTeachers.forEach(teacher => {
      dom.appendOption("#subject-int-select", teacher, teacher);
    });
  }
}

/**
 * Subscriber: Re-calculates and populates subject options when dependencies change.
 */
export const setupSubjectOptionsObserver = () => {
  store().subscribe((state: SignupState) => {
    updateSubjectOptions(
      state.currentDate,
      state.currentPeriod,
      state.interventionTeachers,
      state.dailySchedules
    );
  }, ['currentDate', 'currentPeriod', 'interventionTeachers', 'dailySchedules']);
};

/**
 * Subscriber: Synchronizes DOM selection with state.currentSubject.
 */
export const setupSubjectValueObserver = () => {
  store().subscribe((state: SignupState) => {
    const selectElem = dom.qs("#subject-int-select") as HTMLInputElement;
    if (selectElem && state.currentSubject && selectElem.value !== state.currentSubject) {
      dom.setValue("#subject-int-select", state.currentSubject);
    }
  }, ['currentSubject']);
};