import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  dateChangeHandler, 
  initDateInput, 
  setupDateObserver,
} from '../../client/signup/date-select.js';
import * as dom from '../../client/common/dom.js';
import { store } from '../../client/signup/signup-store.js';

vi.mock('../../client/common/dom.js', () => ({
  qs: vi.fn(),
  valueOf: vi.fn(),
}));

vi.mock('../../client/signup/signup-store.js', () => ({
  store: { 
    setState: vi.fn(),
    subscribe: vi.fn() 
  }
}));

describe('Date Select Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('dateChangeHandler', () => {
    it('should update the store with the newly selected date', () => {
      dom.valueOf.mockReturnValue('2023-11-01');
      dateChangeHandler();
      expect(store.setState).toHaveBeenCalled();
    });
  });

  describe('setupDateObserver', () => {
    it('should subscribe to the store looking for ui_currentDate changes', () => {
      setupDateObserver();
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), ['ui_currentDate']);
    });
  });
});
