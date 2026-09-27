import * as dom from '../common/dom';
import { store } from './signup-store';
import { parseStudentDataList } from '../common/parsers';

let debounceTimer: ReturnType<typeof setTimeout>;

const setHelperState = (isSearching: boolean, noResults = false) => {
  const helper = dom.qs('#student-search-helper') as HTMLElement | null;
  if (!helper) return;

  if (isSearching) {
    helper.textContent = 'Searching...';
    helper.classList.remove('text-start');
    helper.classList.add('text-end');
  } else {
    helper.textContent = noResults ? 'No matching students found' : 'Type at least 2 letters to search.';
    helper.classList.remove('text-end');
    helper.classList.add('text-start');
  }
};

const updateClearButtonState = (hasValue: boolean, isSearching: boolean) => {
  if (isSearching || !hasValue) {
    dom.setVisible('#student-clear-btn', false);
  } else {
    dom.setVisible('#student-clear-btn', true);
  }
};

export const clearStudentInput = () => {
  clearTimeout(debounceTimer);
  const input = dom.qs('.student-autocomplete') as HTMLInputElement | null;
  if (input) {
    input.value = '';
    input.focus();
  }
  dom.setVisible('#student-search-spinner', false);
  dom.setVisible('#student-clear-btn', false);
  setHelperState(false);
  renderStudentDatalist([], '');
  store.setState({ ui_currentStudentName: '' });
};

/**
 * Publisher: Listens to input changes in the student text field and updates store state.
 */
export const studentInputChangeHandler = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const query = dom.valueOf(target).trim();
  store.setState({ ui_currentStudentName: query });

  // Clear any existing timer
  clearTimeout(debounceTimer);

  // If query is too short, hide spinner, update clear button, and clear suggestions
  if (query.length < 2) {
    dom.setVisible('#student-search-spinner', false);
    updateClearButtonState(query.length > 0, false);
    setHelperState(false);
    renderStudentDatalist([], query);
    return;
  }

  // Show the spinner and change helper to right-justified "Searching..."
  dom.setVisible('#student-search-spinner', true);
  dom.setVisible('#student-clear-btn', false);
  setHelperState(true);

  debounceTimer = setTimeout(() => {
    // Check if google.script.run is available (production vs debug)
    if (typeof google === 'undefined' || !google?.script?.run) {
      dom.setVisible('#student-search-spinner', false);
      updateClearButtonState(query.length > 0, false);
      setHelperState(false);
      return;
    }

    google.script.run
      .withSuccessHandler((matchingStudents: Student[]) => {
        dom.setVisible('#student-search-spinner', false);
        updateClearButtonState(true, false);
        const hasNoResults = matchingStudents.length === 0;
        setHelperState(false, hasNoResults);
        const formattedNames = parseStudentDataList(matchingStudents);
        renderStudentDatalist(formattedNames, query);
      })
      .withFailureHandler((error: Error) => {
        dom.setVisible('#student-search-spinner', false);
        updateClearButtonState(true, false);
        setHelperState(false);
        console.error('Failed to search students:', error);
      })
      .searchStudents(query);
  }, 250); // 250ms debounce
};

export const renderStudentDatalist = (studentNames: string[] = [], currentQuery: string = '') => {
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


