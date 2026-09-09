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

let currentState = new State();

export const getState = () => currentState;

export const setState = (updates) => {
  currentState = { ...currentState, ...updates };
}
