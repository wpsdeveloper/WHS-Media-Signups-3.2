// Store.js
export class Store {
  constructor() {
    this.state = {};
    this.listeners = [];
  }

  initialize(initialState = {}) {
    this.state = { ...initialState };
  }

  getState() {
    return { ...this.state };
  }

  setState(newState) {
    let hasChanges = false;
    const changedKeys = [];

    for (const key in newState) {
      if (!isDeepEqual(newState[key], this.state[key])) {
        changedKeys.push(key);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.state = { ...this.state, ...newState };
      this.notify(changedKeys);
    }
  }

  subscribe(callback, dependencies = null) {
    this.listeners.push({ callback, dependencies });
    
    // Unsubscribe helper
    return () => {
      this.listeners = this.listeners.filter(l => l.callback !== callback);
    };
  }

  notify(changedKeys) {
    this.listeners.forEach(({ callback, dependencies }) => {
      if (!dependencies || dependencies.some(dep => changedKeys.includes(dep))) {
        callback(this.state);
      }
    });
  }
}

function isDeepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
}

export const store = new Store();