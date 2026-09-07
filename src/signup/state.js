// Shared signup form state.
class State {
  students = [];
  studentNames;
  dailySchedules = [];
  interventionTeachers = {};
  studyTeachers = {};
  signups = [];
  noFlyList = [];

  isStaff = false;
  isEditor = false;
  isAdmin = false;
  updateRowId = null;
  updateData = null;
  defaultMax = 15;
  currentMax = 15;
}

export const state = new State();
