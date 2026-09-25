import { describe, it, expect, vi, beforeEach } from 'vitest';
import { store, Store } from '../../client/common/store.js';


describe('Store Module', () => {
  // Store a copy of the default state to reset the singleton between tests
  const defaultState = JSON.parse(JSON.stringify(store.getState()));
  
  beforeEach(() => {
    // Manually reset the singleton state and listeners to ensure test isolation
    store.state = JSON.parse(JSON.stringify(defaultState));
    store.listeners = [];
  });

  describe('store instance', () => {
    it('should return an instance of Store', () => {
      expect(store instanceof Store).toBe(true);
    })
  });

  describe('initialize', () => {
    it('should put initial data into the store', () => {
      store.initialize({signups: [{student: "student1"}], schedules: [{date: "2025-10-05"}]});
      expect(store.state.signups).toEqual([{student: "student1"}]);
      expect(store.state.schedules).toEqual([{date: "2025-10-05"}]);
      expect(store.state.signups[0].student).toBe("student1");
    })
  });
  
  describe('getState', () => {
    it('should return the complete current state object', () => {
      store.initialize({signups: [{student: "student1"}], schedules: [{date: "2025-10-05"}]});
      const state = store.getState();
      expect(state.signups).toEqual([{student: "student1"}]);
      expect(state.schedules).toEqual([{date: "2025-10-05"}]);
      expect(state.signups[0].student).toBe("student1");
    });
  });
  
  describe('setState', () => {
    it('should update the state with new primitive values', () => {
      store.initialize({signups: [{student: "student1"}], schedules: [{date: "2025-10-05"}]});
      store.setState({ currentPeriod: '1', isAdmin: true });
      
      const state = store.getState();
      expect(state.signups[0].student).toBe("student1");
      expect(state.currentPeriod).toBe('1');
      expect(state.isAdmin).toBe(true);
    });
    
    it('should partially merge state without overwriting unmodified keys', () => {
      store.initialize({currentDate: "2025-10-05", defaultMax: 15});
      store.setState({ currentDate: '2023-11-01' });
      const state = store.getState();
      
      expect(state.currentDate).toBe('2023-11-01');
      expect(state.defaultMax).toBe(15); // Unchanged
    });
  });
  
  describe('isDeepEqual functionality (via setState)', () => {
    it('should not trigger notification if the new state deeply matches the old state', () => {
      const mockCallback = vi.fn();
      store.subscribe(mockCallback);
      
      // Set initial object state
      store.initialize({ interventionTeachers: { math: 'Mr. Jones' } });
      store.setState({ interventionTeachers: { math: 'Mr. Smith' } });
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      // Attempt to set structurally identical object
      store.setState({ interventionTeachers: { math: 'Mr. Smith' } });
      
      // Should not trigger again because isDeepEqual returns true
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
    
    it('should trigger notification if arrays structurally change', () => {
      const mockCallback = vi.fn();
      store.subscribe(mockCallback);
      
      store.initialize({});
      store.setState({ students: [{ id: 1 }] });
      store.setState({ students: [{ id: 1 }, { id: 2 }] });
      
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('subscribe and notify', () => {
    it('should notify subscribers without dependencies on any state change', () => {
      const mockCallback = vi.fn();
      store.subscribe(mockCallback); // No dependencies provided

      store.setState({ currentPeriod: '2' });
      const state = store.getState();
      expect(mockCallback).toHaveBeenCalledWith(state);
    });

    it('should notify subscribers only when specified dependencies change', () => {
      const mockCallback = vi.fn();
      store.subscribe(mockCallback, ['ui_currentDate', 'ui_currentPeriod']);

      // Should NOT trigger callback (untracked dependency)
      store.setState({ currentType: 'Tutoring' });
      expect(mockCallback).not.toHaveBeenCalled();

      // Should trigger callback (tracked dependency)
      store.setState({ currentDate: '2023-11-02' });
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
    
    it('should notify multiple subscribers accurately', () => {
      const callbackAll = vi.fn();
      const callbackPeriod = vi.fn();
      
      store.subscribe(callbackAll);
      store.subscribe(callbackPeriod, ['ui_currentPeriod']);

      store.setState({ currentType: 'Intervention' });
      
      expect(callbackAll).toHaveBeenCalledTimes(1);
      expect(callbackPeriod).not.toHaveBeenCalled();

      store.setState({ currentPeriod: '3' });
      
      expect(callbackAll).toHaveBeenCalledTimes(2);
      expect(callbackPeriod).toHaveBeenCalledTimes(1);
    });
  });
});