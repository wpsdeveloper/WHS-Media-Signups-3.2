import * as dom from "../common/dom";
import * as dates from "../common/dates";
import { SignupState, store } from './signup-store';

/**
 * Publisher: Responds to user changes in the study teacher select element.
 */
export const studyTeacherChangeHandler = (event: MouseEvent) => {
  const inputElement = event.target as HTMLSelectElement;
  if (!inputElement) return "";
  const selectedTeacher = inputElement.value ?? "";
  store.setState({ ui_currentStudyTeacher: selectedTeacher });
};

/**
 * Pure UI View: Calculates options from state and renders select dropdown/input elements.
 */
export const updateStudyOptions = (
  currentScheduleBlock: DailyBlock | null, 
  currentType: SignupType | null,
  currentStudyTeacher: string | null,
) => {
  dom.clearOptions("#study-teacher-select");
  if (!currentScheduleBlock) {
    return;
  }
  toggleStudyInputVisibility(false);

  if (!currentType) return;
  
  // Toggle outer section visibility for Wed. PM
  dom.setVisible("#study-div", currentScheduleBlock.period !== "Wed. PM");
  
  const availableTeachers = currentScheduleBlock.studyTeachers;
  if (currentType && currentType === "Alt setting") {
    availableTeachers.push("Directly from class");
  }

  // Render options
  availableTeachers.forEach(teacher => {
    dom.appendOption("#study-teacher-select", teacher, teacher, false);
  });
  
  if (currentScheduleBlock.period !== "Wed. PM" 
    && !["Non-intervention", "Intervention"].includes(currentType)) {
    dom.appendOption("#study-teacher-select", "Coming from class", "Coming from class", false);
  }
  
  if (currentStudyTeacher && !availableTeachers.includes(currentStudyTeacher)) {
    dom.appendOption("#study-teacher-select", currentStudyTeacher, currentStudyTeacher, true);
  }

  // State-driven UI toggle
  toggleStudyInputVisibility(availableTeachers.length > 0);
};

/**
 * Pure UI Helper: Toggles visibility based on computed options state.
 */
export const toggleStudyInputVisibility = (hasOptions: boolean) => {
  dom.setVisible("#study-teacher-select", hasOptions);
  dom.setVisible("#study-teacher-input", !hasOptions);
};

/**
 * Subscriber: Re-calculates and re-populates options when key state items change.
 */
export const setupStudyObservers = () => {
  // sets study teacher options based on date/period selection
  store.subscribe((state: SignupState) => {
    updateStudyOptions(
      state.ui_currentScheduleBlock,
      state.ui_currentType,
      state.ui_currentStudyTeacher ,   
    );
    }, ['currentScheduleBlock', 'currentPeriod', 'currentType']);
    
    
  // updates selectbox choice is data is changed externally
  store.subscribe((state: SignupState) => {
    const selectElem = dom.qs("#study-teacher-select") as HTMLSelectElement;
    if (selectElem && state.ui_currentStudyTeacher && selectElem.value !== state.ui_currentStudyTeacher) {
      dom.setValue("#study-teacher-select", state.ui_currentStudyTeacher);
    }
  }, ['currentStudyTeacher']);
};