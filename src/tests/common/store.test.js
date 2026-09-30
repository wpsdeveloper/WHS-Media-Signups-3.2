import { describe, it, expect, vi } from 'vitest';
import { Store } from '../../client/common/store';

describe('Store Class', () => {
  it('initializes with state and gets current state', () => {
    const store = new Store({ count: 0 });
    expect(store.getState()).toEqual({ count: 0 });
  });

  it('updates state and notifies subscribers', () => {
    const store = new Store({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener, ['count']);

    store.setState({ count: 1 });
    expect(store.getState().count).toBe(1);
    expect(listener).toHaveBeenCalledWith({ count: 1 });
  });

  it('does not notify if state values do not change', () => {
    const store = new Store({ count: 1 });
    const listener = vi.fn();
    store.subscribe(listener, ['count']);

    store.setState({ count: 1 });
    expect(listener).not.toHaveBeenCalled();
  });
});
