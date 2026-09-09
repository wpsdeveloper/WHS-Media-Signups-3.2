import * as dom from "./dom.js"
import * as dates from "./dates.js"

/**
 *  Updates the Details section of the form based on which Type is selected 
 * */
export const updateDetailsPanel = () => {
  if (dom.isChecked("input#intervention")) showType(".intervention-only");
  else if (dom.isChecked("input#assessment")) showType(".assessment-only");
  else if (dom.isChecked("input#tutoring")) showType(".tutoring-only");
  else if (dom.isChecked("input#non-intervention")) showType(".non-intervention-only");
  else if (dom.isChecked("input#alt-setting")) showType(".alt-setting-only");
  else if (dom.isChecked("input#staff-reservation")) showType(".staff-reservation-only");
}

/**
 *  Shows the Details section for a particular Type 
 * */
export const showType = (typeClass) => {
  // hides all panels by default
  hideTypes();

  // shows only the indicated panel
  dom.setVisible(typeClass, true);
}

/**
 *  Hides all Details sections 
 * */
export const hideTypes = () => {
   dom.setVisible(
    ".intervention-only, .assessment-only, .tutoring-only, .non-intervention-only, .alt-setting-only, .staff-reservation-only",
    false);
}