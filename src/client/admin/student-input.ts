import * as dom from '../common/dom';
import { parseStudentDataList } from '../common/parsers';
import { store } from './admin-store';

let debounceTimer: ReturnType<typeof setTimeout>;

const setHelperState = (isSearching: boolean, noResults = false, isSelected = false) => {
  const helper = dom.qs('#student-search-helper') as HTMLElement | null;
  if (!helper) return;

  if (isSelected) {
    helper.style.visibility = 'hidden';
    helper.classList.remove('d-none');
    return;
  }

  helper.style.visibility = 'visible';
  helper.classList.remove('d-none');

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

const isStudentSelected = (query: string): boolean => {
  if (!query) return false;
  // If query contains '<' and '>' (standard datalist student format: "Lastname, Firstname <email>")
  if (/<[^>]+>/.test(query)) {
    return true;
  }
  // Check against current datalist options in the DOM
  const datalist = dom.qs('#student-suggestions') as HTMLDataListElement | null;
  if (datalist && datalist.options && datalist.options.length > 0) {
    const queryLower = query.toLowerCase();
    for (let i = 0; i < datalist.options.length; i++) {
      if (datalist.options[i].value.toLowerCase() === queryLower) {
        return true;
      }
    }
  }
  return false;
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
  store.setState({ ui_currentStudentName: '', ui_requestedStudentEmail: '' });
};

/**
 * Publisher: Listens to input changes in the student text field and updates store state.
 */
export const studentInputChangeHandler = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const query = dom.valueOf(target).trim();
  store.setState({ ui_currentStudentName: query });

  clearTimeout(debounceTimer);
  if (query.length < 2) {
    dom.setVisible('#student-search-spinner', false);
    updateClearButtonState(query.length > 0, false);
    setHelperState(false);
    renderStudentDatalist([], query);
    return;
  }

  // If a full student was selected from the datalist, do not trigger a backend search
  if (isStudentSelected(query)) {
    dom.setVisible('#student-search-spinner', false);
    updateClearButtonState(true, false);
    setHelperState(false, false, true);
    return;
  }

  // Show spinner and right-aligned Searching... immediately
  dom.setVisible('#student-search-spinner', true);
  dom.setVisible('#student-clear-btn', false);
  setHelperState(true);

  debounceTimer = setTimeout(() => {
    if (typeof google === 'undefined' || !google?.script?.run) {
      dom.setVisible('#student-search-spinner', false);
      updateClearButtonState(query.length > 0, false);
      setHelperState(false);
      return;
    }

    google.script.run
      .withSuccessHandler((matchingStudents: Student[]) => {
        // Re-check if user selected a student in the meantime
        const currentVal = dom.valueOf(target).trim();
        if (isStudentSelected(currentVal)) {
          dom.setVisible('#student-search-spinner', false);
          updateClearButtonState(true, false);
          setHelperState(false, false, true);
          return;
        }

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

