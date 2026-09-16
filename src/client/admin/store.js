class Store {
  state = {
    students: [],
    studentNames: [],
    dailySchedules: [],
    signups: [],
    settings: [],

    isEditor: false,
    
    currentSortField: "date",
    currentSortOrder: "desc",

    currentStudentName: null,
    requestedStudentEmail: null,
  };

  constructor() {
    this.listeners = [];
  }

  getState() {
    return {...this.state};
  }

  setState(newState) {
    let hasChanges = false;
    const changedKeys = [];

    for (const key in newState) {
      // Use the deep equality check instead of standard !==
      if (!isDeepEqual(newState[key], this.state[key])) {
        changedKeys.push(key);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.state = { ...this.state, ...newState };
      this.notify(changedKeys);
    }
  };

  subscribe(callback, dependencies = null) {
    this.listeners.push({ callback, dependencies });
  }

  notify(changedKeys) {
    this.listeners.forEach(({ callback, dependencies }) => {
      // If no dependencies were provided, always trigger the callback.
      // Otherwise, only trigger if one of the changed keys is in the dependencies list.
      if (!dependencies || dependencies.some(dep => changedKeys.includes(dep))) {
        callback(this.state);
      }
    });
  }
}

/**
 * Helper function to deeply compare two objects or arrays.
 * This prevents the store from triggering updates when the new state 
 * is structurally identical to the old state.
 */
function isDeepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if ((keys1.length === 0) || (keys2.length === 0)) return false;
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  
  return true;
}

export const store = new Store;

