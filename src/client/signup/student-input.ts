import * as dom from '../common/dom';
import { store } from './signup-store';

/**
 * Publisher: Listens to input changes in the student text field and updates store state.
 */
export const studentInputChangeHandler = (event: InputEvent) => {
  const target = event.target as HTMLInputElement;
  const query = dom.valueOf(target);
  store.setState({ ui_currentStudentName: query });
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

/**
 * Subscriber: Updates suggestions when studentNames or current query change in store.
 */
export const setupStudentInputObserver = () => {
  store.subscribe((state) => {
    if (!state) return;
    
    // Type narrowing depending on how your state is structured
    if ('studentNames' in state && 'ui_currentStudentName' in state) {
      renderStudentDatalist(state.studentNames, state.ui_currentStudentName);
    }
  }, ['studentNames', 'ui_currentStudentName']);
};

