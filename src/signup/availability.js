import { DEFAULT_MAX, setCurrentMax } from "./state.js";
import { $, $$, setChecked, setDisabled, setText, valueOf } from "./dom.js";
import { isSameDate, parseDateInput } from "./schedule.js";
import { disableOption } from "./parsers.js";

export function wednesdayInterventions(date, valueOf) {
  const wednesday = 3;
  const dateIsWednesday = date.getDay() === wednesday;
  const wedIntActive = valueOf("#wed-int-active") === "true";
  return dateIsWednesday && wedIntActive;
}

export function checkMax(specialMax, checkFull) {
  const parsedMax = Number.parseInt(specialMax, 10);
  setCurrentMax(Number.isFinite(parsedMax) && parsedMax >= 0 ? parsedMax : DEFAULT_MAX);
  checkFull();
}

export function checkFull({ signups, currentMax }) {
  const dateVal = valueOf("#date");
  if (dateVal === "") return;
  const date = parseDateInput(dateVal);
  const period = valueOf("#period");
  if (period === null) return;
  const matching = signups
    .filter(signup => isSameDate(new Date(signup.date), date) && period == "" + signup.period)
    .filter(signup => signup.type === "Non-intervention" || signup.type === "Tutoring");

  if (matching.length >= currentMax) {
    ["#non-intervention", "#tutoring"].forEach(selector => {
      const input = $(selector);
      input.disabled = true;
      input.checked = false;
      const label = document.querySelector(`label[for='${selector.substring(1)}']`);
      if (!label.querySelector("span.type-warning")) label.insertAdjacentHTML("beforeend", "<span class='type-warning'> Full</span>");
    });
  }
}

export function updateGlassRooms({ signups }) {
  setDisabled("#glass-room-1", false);
  setDisabled("#glass-room-2", false);
  setText("#glass-room-1-label .availability", "Available");
  setText("#glass-room-2-label .availability", "Available");
  const dateStr = valueOf("#date");
  if (dateStr.length === 0) return;
  const date = parseDateInput(dateStr);
  const period = valueOf("#period");
  if (typeof period === "undefined") return;

  signups.forEach(signup => {
    if (!isSameDate(new Date(signup.date), date) || "" + signup.period !== period) return;
    if (signup.room >= 1 && signup.room <= 2) {
      setDisabled(`#glass-room-${signup.room}`, true);
      setChecked(`#glass-room-${signup.room}`, false);
      setText(`#glass-room-${signup.room}-label .availability`, "Unavailable");
    }
  });
}

export function updateTypeOptions({ tutoringActive, noFlyList, setSpecialScheduleAdjustments }) {
  $$(`input[name='signup-type'], input[name='purpose']`).forEach(element => { element.disabled = false; });
  $$('span.type-warning').forEach(element => element.remove());
  if (!tutoringActive) disableOption("#tutoring", "Not available");
  if (noFlyList.includes(valueOf("input#email"))) disableOption("#non-intervention", "Not permitted");
  setSpecialScheduleAdjustments();
}

export function setSpecialScheduleAdjustments({ dailySchedules, checkFull, showOption, showWednesday }) {
  const dateStr = valueOf("#date");
  if (dateStr.length === 0) return;
  const date = parseDateInput(dateStr);
  const period = valueOf("#period");
  if (typeof period === "undefined") return;
  const isWednesday = period === "Wed. PM";
  if (isWednesday) showWednesday();

  const match = dailySchedules.find(schedule => isSameDate(new Date(schedule.date), date) && schedule.specials && typeof schedule.specials === "object");
  if (!match || !Object.prototype.hasOwnProperty.call(match.specials, period)) return;
  const special = match.specials[period];
  if (special.allowInterventions.length > 0) showOption("intervention");
  if (special.allowAssessmentMakeups.length > 0 || isWednesday) showOption("assessment");
  if (special.allowAltSetting.length > 0) showOption("alt-setting");
  if (special.allowTutoring.length > 0 || isWednesday) showOption("tutoring");
  if (special.allowNonInterventions.length > 0 && !isWednesday) showOption("non-intervention");
  checkMax(special.max, checkFull);
}
