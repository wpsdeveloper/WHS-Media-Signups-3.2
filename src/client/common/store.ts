export interface StoreListener<T> {
  callback: (state: T) => void;
  dependencies: (keyof T)[] | null;
}

// Store.js
export class Store<T> {
  state: T;
  listeners: StoreListener<T>[] = [];

  constructor(state: T) {
    this.state = state;
  }

  getState(): T {
    return { ...this.state } as T;
  }

  setState(newState: Partial<T>): void {
    if (!newState) return;
    const changedKeys: (keyof T)[] = [];
    const keys = Object.keys(newState) as (keyof T)[];
    
    // FIX: Actually compare values and populate changedKeys
    for (const key of keys) {
      if (!isDeepEqual(this.state[key], newState[key])) {
        changedKeys.push(key);
      }
    }

    // If nothing changed, don't trigger a re-render
    if (changedKeys.length === 0) return;

    this.state = { ...this.state, ...newState } as T;
    this.notify(changedKeys);
  }

  subscribe(
    callback: StoreListener<T>['callback'], 
    dependencies: (keyof T)[] | null = null
  ): () => void {
    this.listeners.push({ callback, dependencies });
    
    return () => {
      this.listeners = this.listeners.filter(l => l.callback !== callback);
    };
  }

  notify(changedKeys: (keyof T)[]) {
    this.listeners.forEach(({ callback, dependencies }) => {
      if (!dependencies || dependencies.some(dep => changedKeys.includes(dep))) {
        callback(this.state);
      }
    });
  }
}

function isDeepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }

  // Handle Dates cleanly (including invalid dates)
  if (obj1 instanceof Date || obj2 instanceof Date) {
    if (!(obj1 instanceof Date) || !(obj2 instanceof Date)) return false;
    const t1 = obj1.getTime();
    const t2 = obj2.getTime();
    return t1 === t2 || (Number.isNaN(t1) && Number.isNaN(t2));
  }

  // Fast-path for Arrays: O(N) sequential check instead of O(N^2) keys.includes
  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    if (!Array.isArray(obj1) || !Array.isArray(obj2)) return false;
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!isDeepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  // General Plain Objects: O(N) comparison
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key) || !isDeepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
}

