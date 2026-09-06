export function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateInput(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isSameDate(date1, date2) {
  return date1.getMonth() === date2.getMonth()
    && date1.getFullYear() === date2.getFullYear()
    && date1.getDate() === date2.getDate();
}

export function updatePeriodList({ valueOf, appendOption, setValue, wednesdayInterventions, processError, dailySchedules }) {
  const oldPeriodVal = valueOf("#period");
  const dateVal = valueOf("#date");
  if (dateVal === "") return;
  const date = parseDateInput(dateVal);

  try {
    document.querySelector("#period").replaceChildren();
    dailySchedules.forEach(schedule => {
      if (isSameDate(new Date(schedule.date), date)) {
        schedule.periods.forEach(period => appendOption("#period", period, period));
      }
    });
    if (wednesdayInterventions(date)) appendOption("#period", "Wed. PM", "Wed. PM");
    setValue("#period", oldPeriodVal);
  } catch (error) {
    processError(error);
  }
}

export function getTeachersForSelection(scheduleData, date, period, dailySchedules) {
  if (!scheduleData || (!scheduleData.s1 && !scheduleData.s2)) return [];
  const secondScheduleDate = new Date(scheduleData.s2Date);
  const schedules = new Date() < secondScheduleDate ? scheduleData.s1 : scheduleData.s2;
  if (!schedules) return [];
  const matchingSchedule = dailySchedules.find(schedule => isSameDate(new Date(schedule.date), date));
  const teachers = matchingSchedule && schedules[matchingSchedule.day]?.[period];
  return Array.isArray(teachers) ? teachers : [];
}

export function updateSubjectList({ valueOf, appendOption, showIntTeacherAltInput, interventionTeachers, dailySchedules }) {
  document.querySelector("#subject-int-select").replaceChildren();
  if (!interventionTeachers) return;
  const dateStr = valueOf("#date");
  if (dateStr.length === 0) return;
  const date = parseDateInput(dateStr);
  const period = valueOf("#period");
  if (period === null) return;
  if (period === "Wed. PM") {
    showIntTeacherAltInput(true);
    return;
  }
  showIntTeacherAltInput(false);
  getTeachersForSelection(interventionTeachers, date, period, dailySchedules)
    .forEach(teacher => appendOption("#subject-int-select", teacher, teacher));
}

export function updateStudyList({ valueOf, appendOption, setVisible, showStudyAltInput, studyTeachers, dailySchedules }) {
  document.querySelector("#study-teacher-select").replaceChildren();
  if (!studyTeachers) return;
  const dateStr = valueOf("#date");
  if (dateStr.length === 0) return;
  const date = parseDateInput(dateStr);
  const period = valueOf("#period");
  if (period === null) return;
  setVisible(document.querySelector("#study-div"), true);
  if (period === "Wed. PM") setVisible(document.querySelector("#study-div"), false);
  const altSetting = valueOf("input[name='signup-type']:checked") === "Alt setting";
  if (altSetting) appendOption("#study-teacher-select", "Directly from class", "Directly from class", true);
  getTeachersForSelection(studyTeachers, date, period, dailySchedules)
    .forEach(teacher => appendOption("#study-teacher-select", teacher, teacher));
}
