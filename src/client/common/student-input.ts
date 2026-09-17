import * as dom from './dom.js';
import { SharedStudentState } from './store copy.js';
import { store, StoreState } from './store.js';

/**
 * Publisher: Listens to input changes in the student text field and updates store state.
 */
export const studentInputChangeHandler = (event: MouseEvent) => {
  const target = event.target as HTMLInputElement;
  const query = dom.valueOf(target);
  
  // FIX: Invoke store() to get the instance
  const appStore = store<StoreState>(null as any); 
  appStore.setState({ currentStudentName: query });
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
  const appStore = store<StoreState>(null as any);

  appStore.subscribe((state: StoreState) => {
    if (!state) return;
    
    // Type narrowing depending on how your state is structured
    if ('studentNames' in state && 'currentStudentName' in state) {
      renderStudentDatalist(state.studentNames, state.currentStudentName);
    }
  }, ['studentNames', 'currentStudentName']);
};

