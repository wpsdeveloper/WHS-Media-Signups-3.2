import * as dom from '../common/dom';
import { isSameDate } from '../common/dates';
import { AttendanceState, store } from './attendance-store';

export const ALL_STUDIES = 'All studies';

/**
 * Pure calculation: Extracts unique sorted study teacher names from signups for the given date and period.
 */
export function getAvailableStudies(
  signups: Signup[] = [],
  currentDate: Date | null,
  currentPeriod: Period | null
): string[] {
  if (!currentDate || !currentPeriod) {
    return [ALL_STUDIES];
  }

  const matchingSignups = signups.filter(
    (su) => isSameDate(su.date, currentDate) && su.period === currentPeriod
  );

  const studiesSet = new Set<string>();
  matchingSignups.forEach((signup) => {
    if (signup.teacherStudy) {
      studiesSet.add(signup.teacherStudy);
    }
  });

  const sortedStudies = Array.from(studiesSet).sort((a, b) => a.localeCompare(b));
  return [ALL_STUDIES, ...sortedStudies];
}

/**
 * Responds to a change in the Study select dropdown.
 */
export const studyTeacherChangeHandler = (event?: Event) => {
  const target = event?.target as HTMLSelectElement | undefined;
  const selectedStudy = target?.value ?? dom.valueOf('#study-select') ?? ALL_STUDIES;
  store.setState({ ui_currentStudy: selectedStudy });
};

/**
 * Updates the Study select dropdown options and restores valid selection.
 */
export const updateStudyOptions = (
  currentDate: Date | null,
  currentPeriod: Period | null,
  signups: Signup[] = []
) => {
  const currentSelectedStudy = store.getState().ui_currentStudy;
  const studiesAvailable = getAvailableStudies(signups, currentDate, currentPeriod);

  dom.clearOptions('#study-select');

  studiesAvailable.forEach((study) => {
    dom.appendOption('#study-select', study, study, false);
  });

  // Preserve existing study if still present in options, otherwise fallback to "All studies"
  const selectElem = dom.qs('#study-select') as HTMLSelectElement | null;
  const targetStudy =
    currentSelectedStudy && studiesAvailable.includes(currentSelectedStudy)
      ? currentSelectedStudy
      : ALL_STUDIES;

  if (selectElem) {
    dom.setValue('#study-select', targetStudy);
  }

  if (store.getState().ui_currentStudy !== targetStudy) {
    store.setState({ ui_currentStudy: targetStudy });
  }
};

/**
 * Subscriber: Re-renders available options when date, period, or signups change.
 */
export const setupStudyObservers = () => {
  store.subscribe(
    (state: AttendanceState) => {
      updateStudyOptions(state.ui_currentDate, state.ui_currentPeriod, state.signups);
    },
    ['ui_currentDate', 'ui_currentPeriod', 'signups']
  );

  // Sync dropdown if ui_currentStudy is updated externally
  store.subscribe(
    (state: AttendanceState) => {
      const selectElem = dom.qs('#study-select') as HTMLSelectElement | null;
      if (selectElem && state.ui_currentStudy && selectElem.value !== state.ui_currentStudy) {
        dom.setValue('#study-select', state.ui_currentStudy);
      }
    },
    ['ui_currentStudy']
  );
};
