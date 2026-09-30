import { describe, it, expect } from 'vitest';
import { initialState, store, resetStore, checkinStore } from '../../client/attendance/attendance-store';

describe('Attendance Store Module', () => {
  it('has correct initial state', () => {
    expect(initialState.ui_currentView).toBe('attendance');
    expect(initialState.ui_currentSortField).toBe('student');
    expect(initialState.ui_currentStudy).toBe('All studies');
  });

  it('resetStore resets state', () => {
    store.setState({ ui_currentStudy: 'Math' });
    resetStore();
    expect(store.getState().ui_currentStudy).toBe('All studies');
  });

  it('checkinStore gets and sets signups', () => {
    const testSignups = [{ rowId: '1', lastname: 'Test' }];
    checkinStore.setSignups(testSignups);
    expect(checkinStore.getSignups()).toEqual(testSignups);
  });
});
