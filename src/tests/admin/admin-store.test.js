import { describe, it, expect } from 'vitest';
import { store, checkinStore } from '../../client/admin/admin-store';

describe('Admin Store Module', () => {
  it('has correct initial state properties', () => {
    const state = store.getState();
    expect(state.ui_currentView).toBe('attendance');
    expect(state.ui_currentSortField).toBe('date');
    expect(state.ui_currentSortOrder).toBe('desc');
  });

  it('checkinStore gets and sets signups', () => {
    const testSignups = [{ rowId: '1', lastname: 'Test' }];
    checkinStore.setSignups(testSignups);
    expect(checkinStore.getSignups()).toEqual(testSignups);
  });
});
