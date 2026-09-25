import * as dom from '../common/dom';
import { store } from './signup-store';
import { parseStudentDataList } from '../common/parsers';

let debounceTimer: ReturnType<typeof setTimeout>;

export function onStudentSearchInput(e: Event) {
  const query = (e.target as HTMLInputElement).value.trim();
  if (query.length < 2) return;

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    google.script.run
      .withSuccessHandler((results: Student[]) => {
        const datalist = results.map(st => `${st.lastname}, ${st.firstname} <${st.email}>`);
        renderStudentDatalist(datalist, query);
      })
      .searchStudents(query);
  }, 250);
}


/**
 * Publisher: Listens to input changes in the student text field and updates store state.
 */
export const studentInputChangeHandler = (event: InputEvent) => {
  const target = event.target as HTMLInputElement;
  const query = dom.valueOf(target);

  // Clear any existing timer
  clearTimeout(debounceTimer);

  // If query is too short, hide spinner and clear list
  if (query.length < 2) {
    dom.setVisible('#student-search-spinner', false);
    renderStudentDatalist([], query);
    return;
  }

  // Show the spinner immediately (or after a tiny delay)
  dom.setVisible('#student-search-spinner', true);

  debounceTimer = setTimeout(() => {
    // Check if google.script.run is available (production vs debug)
    if (typeof google === 'undefined' || !google?.script?.run) {
      dom.setVisible('#student-search-spinner', false);
      return;
    }

    google.script.run
      .withSuccessHandler((matchingStudents: Student[]) => {
        dom.setVisible('#student-search-spinner', false);
        const formattedNames = parseStudentDataList(matchingStudents);
        renderStudentDatalist(formattedNames, query);

        const hint = dom.qs('#student-search-hint') as HTMLElement;
        if (hint) {
          dom.setVisible(hint, matchingStudents.length === 0 && query.length >= 2);
        }
      })
      .withFailureHandler((error: Error) => {
        dom.setVisible('#student-search-spinner', false);
        console.error('Failed to search students:', error);
      })
      .searchStudents(query);
    }, 250); // 250ms debounce
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
  if (!currentQuery || currentQuery.trim().length < 3) {
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


