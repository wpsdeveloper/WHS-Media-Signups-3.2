import * as dom from "./dom.js"
import { parseDateInput, isSameDate } from "./dates.js";
import { checkFull, checkMax } from "./capacity-validation.js";
import { getState } from "./state.js";

export const setSpecialScheduleAdjustments = () => {
  const state = getState();
  const dailySchedules = state.dailySchedules;
  const signups = state.signups;

  // returns if date or period are blank
  const dateStr = dom.valueOf("#date");
  if (dateStr.length === 0) {
    return;
  }
  const date = parseDateInput(dateStr);

  let period = dom.valueOf("#period");
  if (typeof period === "undefined") {
    return;
  }
  
  const isWednesdayInterventions = (period === "Wed. PM");
  if (isWednesdayInterventions) {
    showWednesdayInterventions();
  }
  
  let special = {
    allowInterventions: "",
    allowAssessmentMakeups: "",
    allowAltSetting: "",
    allowTutoring: "",
    allowNonInterventions: "",
  };

  // finds schedule matches with special schedules, returns if none
  const match = dailySchedules.filter(sched => (isSameDate(new Date(sched.date), date) && (sched.specials !== null)));
  if (match.length == 0) {
    return;
  }
  
  const specials = match[0].specials;
  if (specials.hasOwnProperty(period)) {
    special = specials[period];
  } else {
    // returns if no special schedule for this period
    return;
  }
  
  // for the IF statements below ANY text value counts as "not allowed".
  // if not allowed, disables the check, unchecks, and adds a label warning
  if (special.allowInterventions.length > 0) {
    showInterventions();
  }

  if ((special.allowAssessmentMakeups.length > 0) || isWednesdayInterventions) {
    showAssessmentMakeups();
  }

  if (special.allowAltSetting.length > 0) {
    showAltSetting();
  }

  if ((special.allowTutoring.length > 0) || isWednesdayInterventions) {
    showTutoring();
  }

  if ((special.allowNonInterventions.length > 0) && !isWednesdayInterventions) {
    showNonInterventions();
  }

  checkFull(signups, checkMax(special.max));
}