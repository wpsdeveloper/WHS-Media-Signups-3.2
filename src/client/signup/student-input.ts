import * as dom from '../common/dom';
import { store } from './signup-store';
import { parseStudentDataList } from '../common/parsers';

let debounceTimer: ReturnType<typeof setTimeout>;

/**
 * Updates the helper text element below the student search input to provide
 * feedback to the user on search progress or formatting instructions.
 * 
 * @param {boolean} isSearching - True if a search is currently in progress.
 * @param {boolean} [noResults=false] - True if the search completed but found no matches.
 * @param {boolean} [isSelected=false] - True if a student was successfully selected.
 * @returns {void}
 */
const setHelperState = (isSearching: boolean, noResults = false, isSelected = false): void => {
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

/**
 * Updates the visibility of the "Clear" button within the student search input.
 * 
 * @param {boolean} hasValue - True if the input field is not empty.
 * @param {boolean} isSearching - True if a search is currently in progress.
 * @returns {void}
 */
const updateClearButtonState = (hasValue: boolean, isSearching: boolean): void => {
  if (isSearching || !hasValue) {
    dom.setVisible('#student-clear-btn', false);
  } else {
    dom.setVisible('#student-clear-btn', true);
  }
};

/**
 * Determines whether the user has successfully selected a complete student record.
 * Checks for the presence of email brackets or an exact match against datalist options.
 * 
 * @param {string} query - The current string in the input field.
 * @returns {boolean} True if a student is considered selected.
 */
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

let lastOverriddenQuery = '';

/**
 * Clears the student input field, resets suggestions, and updates UI state.
 * 
 * @returns {void}
 */
export const clearStudentInput = (): void => {
  clearTimeout(debounceTimer);
  const input = dom.qs('.student-autocomplete') as HTMLInputElement | null;
  if (input) {
    input.value = '';
    input.focus();
    input.classList.remove('is-invalid');
  }
  dom.setVisible('#student-search-spinner', false);
  dom.setVisible('#student-clear-btn', false);
  const errorDiv = dom.qs('#student-nofly-error');
  if (errorDiv) errorDiv.classList.add('d-none');
  const overrideBtn = dom.qs('#student-nofly-override-btn');
  if (overrideBtn) dom.setVisible(overrideBtn as HTMLElement, false);
  store.setState({ ui_noFlyOverridden: false });
  lastOverriddenQuery = '';
  setHelperState(false);
  renderStudentDatalist([], '');
  store.setState({ ui_currentStudentName: '' });
};

/**
 * Overrides the no-fly restriction for staff users.
 */
export const overrideStudentNoFly = (): void => {
  const input = dom.qs('#student') as HTMLInputElement | null;
  const query = input ? dom.valueOf(input).trim() : '';
  lastOverriddenQuery = query;
  store.setState({ ui_noFlyOverridden: true });
  checkStudentNoFly();
};

/**
 * Checks if the currently selected student is on the no-fly list and updates UI.
 * 
 * @returns {boolean} True if the student is on the no-fly list and not overridden.
 */
export const checkStudentNoFly = (): boolean => {
  const input = dom.qs('#student') as HTMLInputElement | null;
  const errorDiv = dom.qs('#student-nofly-error');
  const overrideBtn = dom.qs('#student-nofly-override-btn') as HTMLElement | null;
  if (!input || !errorDiv) return false;

  const query = dom.valueOf(input).trim();
  if (!query) {
    errorDiv.classList.add('d-none');
    if (overrideBtn) dom.setVisible(overrideBtn, false);
    input.classList.remove('is-invalid');
    store.setState({ ui_noFlyOverridden: false });
    lastOverriddenQuery = '';
    return false;
  }

  if (store.getState().ui_noFlyOverridden && query !== lastOverriddenQuery) {
    store.setState({ ui_noFlyOverridden: false });
  }

  let email = '';
  const brackets = query.indexOf(" <") > 0 ? query.split(" <") : [];
  if (brackets.length === 2) {
    email = brackets[1].trim().substring(0, brackets[1].length - 1);
  } else if (query.includes('@')) {
    email = query;
  }

  const students = (store.getState().students as Student[]) || [];
  let studentObj: Student | undefined;

  if (email) {
    studentObj = students.find(s => s.email.toLowerCase() === email.toLowerCase());
  } else {
    const queryLower = query.toLowerCase();
    studentObj = students.find(s => {
      const fullName = `${s.lastname}, ${s.firstname}`.toLowerCase();
      const fullNameRev = `${s.firstname} ${s.lastname}`.toLowerCase();
      return fullName === queryLower || fullNameRev === queryLower || s.email.toLowerCase() === queryLower;
    });
  }

  const isNoFly = !!studentObj?.noFly;
  const state = store.getState();
  const isStaff = state.isStaff;
  const isOverridden = state.ui_noFlyOverridden;

  if (isNoFly) {
    errorDiv.classList.remove('d-none');
    if (overrideBtn) {
      dom.setVisible(overrideBtn, isStaff);
      if (isOverridden) {
        overrideBtn.textContent = 'Overridden';
        overrideBtn.classList.remove('btn-outline-danger');
        overrideBtn.classList.add('btn-success');
      } else {
        overrideBtn.textContent = 'Override';
        overrideBtn.classList.remove('btn-success');
        overrideBtn.classList.add('btn-outline-danger');
      }
    }
    if (isOverridden) {
      input.classList.remove('is-invalid');
    } else {
      input.classList.add('is-invalid');
    }
  } else {
    errorDiv.classList.add('d-none');
    if (overrideBtn) dom.setVisible(overrideBtn, false);
    input.classList.remove('is-invalid');
    store.setState({ ui_noFlyOverridden: false });
    lastOverriddenQuery = '';
  }

  return isNoFly && !isOverridden;
};

/**
 * Publisher: Listens to input changes in the student text field and updates store state.
 * Triggers backend searches for student matching after a brief debounce period.
 * 
 * @param {Event} event - The DOM input/change event.
 * @returns {void}
 */
export const studentInputChangeHandler = (event: Event): void => {
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
    checkStudentNoFly();
    return;
  }

  // If a full student was selected from the datalist, do not trigger a backend search
  if (isStudentSelected(query)) {
    dom.setVisible('#student-search-spinner', false);
    updateClearButtonState(true, false);
    setHelperState(false, false, true);
    checkStudentNoFly();
    return;
  }

  // Check no-fly even while typing if exact match or email
  checkStudentNoFly();

  // Show the spinner and change helper to right-justified "Searching..."
  dom.setVisible('#student-search-spinner', true);
  dom.setVisible('#student-clear-btn', false);
  setHelperState(true);

  debounceTimer = setTimeout(() => {
    // Check if google.script.run is available (production vs debug)
    if (typeof google === 'undefined' || !google?.script?.run) {
      dom.setVisible('#student-search-spinner', false);
      updateClearButtonState(query.length > 0, false);
      const allStudents: Student[] = (store.getState().students as Student[]) || [];
      const lower = query.toLowerCase();
      const matchingStudents = allStudents.filter(s =>
        (s.lastname && s.lastname.toLowerCase().includes(lower)) ||
        (s.firstname && s.firstname.toLowerCase().includes(lower)) ||
        (s.email && s.email.toLowerCase().includes(lower))
      );
      const hasNoResults = matchingStudents.length === 0;
      setHelperState(false, hasNoResults);
      const formattedNames = parseStudentDataList(matchingStudents);
      renderStudentDatalist(formattedNames, query);
      checkStudentNoFly();
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
          checkStudentNoFly();
          return;
        }

        dom.setVisible('#student-search-spinner', false);
        updateClearButtonState(true, false);
        const hasNoResults = matchingStudents.length === 0;
        setHelperState(false, hasNoResults);
        const formattedNames = parseStudentDataList(matchingStudents);
        renderStudentDatalist(formattedNames, query);
        checkStudentNoFly();
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

/**
 * Updates the datalist with the retrieved student names to display as autocomplete suggestions.
 * 
 * @param {string[]} [studentNames=[]] - A list of formatted student strings.
 * @param {string} [currentQuery=''] - The current search query string.
 * @returns {void}
 */
export const renderStudentDatalist = (studentNames: string[] = [], currentQuery: string = ''): void => {
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


