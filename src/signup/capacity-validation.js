import * as dom from "../common/dom.js";
import * as dates from "../common/dates.js";
import { getState, setState } from "./state.js";

/**
 * Calculates if a given date/period is full (too many existing reservations) 
 * */
export const checkFull = () => {
  // console.log("checking if full");
  
  // gets the date and period selected, returning if blank
  const dateVal = dom.valueOf("#date");
  if (dateVal === "") {
    return;
  }
  const date = dates.parseDateInput(dateVal);
  
  const period = dom.valueOf("#period");
  if (period === null) {
    return;
  }
  const signups = getState().signups;
  // finding signups that match the date and period
  let matching = signups.filter(su => (dates.isSameDate(new Date(su.date), date)) && (period == "" + su.period));

  // filters for only non-intervention and tutoring
  matching = matching.filter(su => (su.type === "Non-intervention") || (su.type === "Tutoring"));
 
  const currentMax = getState().currentMax;
  if (matching.length >= currentMax) {
    console.info("Over limit, max = " + currentMax);
    
    if (matching.length >= currentMax) {
      ["#non-intervention", "#tutoring"].forEach(selector => {
        dom.setDisabled(selector, true);
        dom.setChecked(selector, false);
        dom.setVisible(`${selector} label span.type-warning`, true);
        dom.setText(`${selector} label span.type-warning`, "Full");
      });
    }
  }
}

// gets the max number of signsups for the date/period and checks if full
export const checkMax = (specialMax) => {
  // gets the max number of signsups for the date/period and checks if full
  let newCurrentMax = getState().defaultMax;
  const g = Number.isNaN(specialMax);
  if (typeof specialMax === 'number' && !Number.isNaN(specialMax)) {
    newCurrentMax = specialMax;
  } else if ((typeof specialMax === "string") && (specialMax.length > 0)) {
    newCurrentMax = parseInt(specialMax);
  }
  setState({currentMax: newCurrentMax});
  checkFull();
}

export const preventSignupForNoFly = () => {
  const noFlyList = getState().noFlyList;
  const email = dom.valueOf("input#email");
  if (Array.isArray(noFlyList) && (noFlyList.includes(email))) {
    dom.setDisabled("input#non-intervention", true);
    dom.setChecked("input#non-intervention", false);
    dom.setVisible("label[for='non-intervention'] span.type-warning", true);
    dom.setText("label[for='non-intervention'] span.type-warning", "Not permitted");
  }
}
