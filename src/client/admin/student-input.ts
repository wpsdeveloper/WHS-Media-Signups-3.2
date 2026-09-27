import * as dom from '../common/dom';
import { parseStudentDataList } from '../common/parsers';
import { store } from './admin-store';

let debounceTimer: ReturnType<typeof setTimeout>;

/**
 * Publisher: Listens to input changes in the student text field and updates store state.
 */
export const studentInputChangeHandler = (event: InputEvent) => {
  const target = event.target as HTMLInputElement;
  const query = dom.valueOf(target);
  store.setState({ ui_currentStudentName: query });

  clearTimeout(debounceTimer);
  if (query.trim().length < 2) {
    renderStudentDatalist([], query);
    return;
  }

  debounceTimer = setTimeout(() => {
    if (typeof google === 'undefined' || !google?.script?.run) {
      return;
    }

    google.script.run
      .withSuccessHandler((matchingStudents: Student[]) => {
        const formattedNames = parseStudentDataList(matchingStudents);
        renderStudentDatalist(formattedNames, query);
      })
      .withFailureHandler((error: Error) => {
        console.error('Failed to search students:', error);
      })
      .searchStudents(query);
  }, 250);
};

export const renderStudentDatalist = (studentNames: string[] = [], currentQuery:string = '') => {
  const input = dom.qs(".student-autocomplete");
  if (!input) return;

  let list = dom.qs("#student-suggestions");
  if (!list) {
    list = document.createElement("datalist");
    list.id = "student-suggestions";
    document.body.append(list);
  }
  input.setAttribute("list", list.id);

  // Clear suggestions if query is under threshold
  if (!currentQuery || currentQuery.trim().length < 2) {
    list.replaceChildren();
    return;
  }

  // Populate suggestion options from student names list
  list.replaceChildren(...(studentNames || []).map(name => {
    const option = document.createElement("option");
    option.value = name;
    return option;
  }));
};

/**
 * Subscriber: Updates suggestions when studentNames or current query change in store.
 */
export const setupStudentInputObserver = () => {
  store.subscribe((state) => {
    if (!state) return;
    
    if ('studentNames' in state && state.studentNames && state.studentNames.length > 0) {
      renderStudentDatalist(state.studentNames, state.ui_currentStudentName);
    }
  }, ['studentNames', 'ui_currentStudentName']);
};

