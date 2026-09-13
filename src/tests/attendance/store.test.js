import { describe, it, expect, vi, beforeEach } from 'vitest';
import { store } from '../../attendance/store.js';

describe('store.js', () => {
  beforeEach(() => {
    // Reset the store to its initial state and clear listeners before each test
    store.state = {
      dailySchedules: [],
      signups: [],
      isStaff: false,
      isEditor: false,
      isAdmin: false,
      currentSort: { field: "study", order: "asc" },
      dataRows: [],
      currentDatePeriod: { date: null, period: null },
    };
    store.listeners = [];
  });

  describe('getState', () => {
    it('returns the current state object', () => {
      const state = store.getState();
      expect(state).toHaveProperty('isStaff', false);
      expect(state).toHaveProperty('currentSort');
    });
  });

  describe('setState', () => {
    it('updates state and notifies listeners when primitive values change', () => {
      const callback = vi.fn();
      store.subscribe(callback);

      store.setState({ isStaff: true, isAdmin: true });

      expect(store.getState().isStaff).toBe(true);
      expect(store.getState().isAdmin).toBe(true);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not notify listeners if the new state is deeply equal to the current state', () => {
      const callback = vi.fn();
      store.subscribe(callback);

      // Set to the exact same deep value
      store.setState({ currentSort: { field: "study", order: "asc" } });

      expect(callback).not.toHaveBeenCalled();
    });

    it('updates state and notifies if a nested object changes', () => {
      const callback = vi.fn();
      store.subscribe(callback);

      store.setState({ currentSort: { field: "study", order: "desc" } });

      expect(store.getState().currentSort.order).toBe("desc");
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('updates state and notifies if an array changes', () => {
      const callback = vi.fn();
      store.subscribe(callback);

      store.setState({ signups: [{ id: 1 }] });

      expect(store.getState().signups.length).toBe(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribe and notify', () => {
    it('calls all listeners if no dependencies are specified', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      store.subscribe(callback1);
      store.subscribe(callback2);

      store.setState({ isStaff: true });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('calls listener only if a dependency has changed', () => {
      const callback = vi.fn();
      store.subscribe(callback, ['isEditor', 'isAdmin']);

      // Changes a non-dependency
      store.setState({ isStaff: true });
      expect(callback).not.toHaveBeenCalled();

      // Changes a matching dependency
      store.setState({ isEditor: true });
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});