import * as dom from './dom.js';
import { getState } from './state.js';

export const initializeStudentDatalist = () => {
  const studentNames = getState().studentNames;

  const input = dom.$(".student-autocomplete");
  if (!input) return;
  let list = dom.$("#student-suggestions");
  if (!list) {
    list = document.createElement("datalist");
    list.id = "student-suggestions";
    document.body.append(list);
  }
  input.setAttribute("list", list.id);
  input.oninput = () => {
    if (input.value.trim().length < 3) {
      list.replaceChildren();
      return;
    }
    list.replaceChildren(...(studentNames || []).map(name => {
      const option = document.createElement("option");
      option.value = name;
      return option;
    }));
  };
  list.replaceChildren();
}