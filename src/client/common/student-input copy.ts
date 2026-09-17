import * as dom from './dom.js';
import { AdminState, SharedStudentState, Store, store } from './store.js';

/**
 * Publisher: Listens to input changes in the student text field and updates store state.
 */
export const studentInputChangeHandler = (event: MouseEvent) => {
  if (!event || !event.target) return;
  const target = event.target as HTMLButtonElement;
  const query: string = target.value;
  store.setState({ currentStudentName: query } as AdminState);
};

export const renderStudentDatalist = (studentNames: string[], currentQuery = '') => {
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
export const setupStudentInputObserver = (store: Store<SharedStudentState>) => {
  // TypeScript automatically infers everything. No casting, no Extract, no NonNullable.
  store.subscribe(
    (state) => ({ 
      names: state.studentNames, 
      query: state.currentStudentName 
    }),
    ({ names, query }) => renderStudentDatalist(names, query)
  );
};

