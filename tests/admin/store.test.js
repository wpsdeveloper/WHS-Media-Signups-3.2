import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store } from '../../src/admin/store.js';

describe('Store', () => {
  beforeEach(() => {
    // Reset store state and listeners before each test
    store.listeners = [];
    store.state = {
      students: [],
      studentNames: [],
      dailySchedules: [],
      signups: [],
      settings: [],
      isEditor: false,
      currentSortField: 'date',
      currentSortOrder: 'desc',
      currentStudentName: null,
      requestedStudentEmail: null,
    };
  });

  describe('getState', () => {
    it('returns the initial default state', () => {
      const state = store.getState();
      expect(state.currentSortField).toBe('date');
      expect(state.currentSortOrder).toBe('desc');
      expect(state.isEditor).toBe(false);
      expect(state.students).toEqual([]);
    });
  });

  describe('setState & notify', () => {
    it('updates state values and triggers subscribers', () => {
      const callback = vi.fn();
      store.subscribe(callback);

      store.setState({ currentSortField: 'student' });

      expect(store.getState().currentSortField).toBe('student');
      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ currentSortField: 'student' }));
    });

    it('does not notify subscribers if new state value is deeply equal to existing state', () => {
      store.setState({ students: [{ id: 1, name: 'Alice' }] });
      const callback = vi.fn();
      store.subscribe(callback);

      // Set identical structural data
      store.setState({ students: [{ id: 1, name: 'Alice' }] });

      expect(callback).not.toHaveBeenCalled();
    });

    it('notifies subscribers matching specific dependency keys', () => {
      const studentCallback = vi.fn();
      const settingsCallback = vi.fn();

      store.subscribe(studentCallback, ['requestedStudentEmail']);
      store.subscribe(settingsCallback, ['settings']);

      store.setState({ requestedStudentEmail: 'test@example.com' });

      expect(studentCallback).toHaveBeenCalledOnce();
      expect(settingsCallback).not.toHaveBeenCalled();
    });

    it('notifies subscribers with no explicit dependencies on any state change', () => {
      const globalCallback = vi.fn();
      store.subscribe(globalCallback);

      store.setState({ isEditor: true });

      expect(globalCallback).toHaveBeenCalledOnce();
    });

    it('handles nested object deep equality checks correctly', () => {
      const callback = vi.fn();
      store.setState({ settings: { theme: 'dark', limits: { max: 10 } } });
      store.subscribe(callback);

      // Re-apply identical deeply nested object
      store.setState({ settings: { theme: 'dark', limits: { max: 10 } } });
      expect(callback).not.toHaveBeenCalled();

      // Apply modified nested property
      store.setState({ settings: { theme: 'dark', limits: { max: 20 } } });
      expect(callback).toHaveBeenCalledOnce();
    });
  });

  describe('subscribe', () => {
    it('registers subscriber callback with dependencies', () => {
      const callback = vi.fn();
      store.subscribe(callback, ['isEditor']);

      expect(store.listeners).toHaveLength(1);
      expect(store.listeners[0]).toEqual({
        callback,
        dependencies: ['isEditor'],
      });
    });
  });
});