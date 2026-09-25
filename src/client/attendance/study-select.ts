import * as dom from "../common/dom";
import * as dates from "../common/dates";
import { AttendanceState, store } from './attendance-store';

/**
 * Publisher: Responds to user changes in the study teacher select element.
 */
export const studyTeacherChangeHandler = (event: MouseEvent) => {
  console.log("Change!");
  const inputElement = event.target as HTMLSelectElement;
  if (!inputElement) return "";
  const selectedTeacher = inputElement.value ?? "";
  store.setState({ ui_currentStudy: selectedTeacher });
};

/**
 * Pure UI View: Calculates options from state and renders select dropdown/input elements.
 */
export const updateStudyOptions = (
  currentDate: Date | null, 
  currentPeriod: Period | null, 
  signups: Signup[],
) => {
  dom.clearOptions("#study-select");

  if (!currentDate || !currentPeriod) return;

  const studiesAvailable: Set<string> = new Set();
  studiesAvailable.add("All studies");

  signups.forEach(su => {
    if (dates.isSameDate(su.date, currentDate)
    && su.period === currentPeriod
    && su.teacherStudy !== "") {
      studiesAvailable.add(su.teacherStudy);
    }
  });
  
  studiesAvailable.forEach(study => {
    dom.appendOption("#study-select", study, study, false);
  })
};

/**
 * Subscriber: Re-calculates and re-populates options when key state items change.
 */
export const setupStudyObservers = () => {
  // sets study teacher options based on date/period selection
  store.subscribe((state: AttendanceState) => {
    updateStudyOptions(
      state.ui_currentDate,
      state.ui_currentPeriod,
      state.signups,   
    );
    }, ['currentDate', 'currentPeriod']);
};