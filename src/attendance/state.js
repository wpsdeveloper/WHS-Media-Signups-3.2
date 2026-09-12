// Shared signup form state.
class State {
  dailySchedules = [];
  signups = [];

  
  isStaff = false;
  isEditor = false;
  isAdmin = false;
  
  currentSort = {
    field: "study",
    order: "asc",
  };
  
  dataRows = [];

  currentDatePeriod = {
    date: null,
    period: null,
  };
}

let currentState = new State();

export const getState = () => currentState;

export const setState = (updates) => {
  currentState = { ...currentState, ...updates };
}
