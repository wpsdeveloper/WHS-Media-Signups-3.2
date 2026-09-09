import * as dom from "./dom.js"
import { getState } from "./state.js";

export const toggleIntTeacherAltInput = () => {
  const interventionTeachers = getState().interventionTeachers;
  const show = interventionTeachers?.length === 0;
  
  dom.setVisible("#subject-int-select", !show);
  dom.setVisible("#subject-int-input", show);
}
