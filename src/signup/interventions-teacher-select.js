import * as dom from "./dom.js"

export const toggleIntTeacherAltInput = (show) => {
  dom.setVisible("#subject-int-select", !show);
  dom.setVisible("#subject-int-input", show);
}
