import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  dateChangeHandler, 
  configureDateSelect, 
  setupDateSelectObserver, 
  chooseSemester 
} from '../../client/signup/date-select.js';
import * as dom from '../../client/common/dom.js';
import { store } from '../../client/common/store.js';

// Mock dependencies
vi.mock('../../client/common/dom.js', () => ({
  qs: vi.fn(),
}));

vi.mock('../../client/common/store.js', () => ({
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
      const mockEvent = { target: { value: '2023-11-01' } };
      
      dateChangeHandler(mockEvent);
      
      expect(store.setState).toHaveBeenCalledWith({ currentDate: '2023-11-01' });
    });
  });

  describe('configureDateSelect', () => {
    it('should configure the date input properties correctly', () => {
      const mockInput = {};
      dom.qs.mockReturnValue(mockInput);
      
      configureDateSelect('#date-picker', '2023-01-01', '2023-12-31', '2023-10-15');
      
      expect(dom.qs).toHaveBeenCalledWith('#date-picker');
      expect(mockInput.type).toBe('date');
      expect(mockInput.min).toBe('2023-01-01');
      expect(mockInput.max).toBe('2023-12-31');
      expect(mockInput.value).toBe('2023-10-15');
    });

    it('should not set the value if initialDate is omitted', () => {
      const mockInput = {};
      dom.qs.mockReturnValue(mockInput);
      
      configureDateSelect('#date-picker', '2023-01-01', '2023-12-31');
      
      expect(mockInput.value).toBeUndefined();
    });

    it('should fail silently if the DOM element is not found', () => {
      dom.qs.mockReturnValue(null);
      expect(() => configureDateSelect('#bad-selector')).not.toThrow();
    });
  });

  describe('setupDateSelectObserver', () => {
    it('should subscribe to the store looking for currentDate changes', () => {
      setupDateSelectObserver('#date-picker');
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), ['ui_currentDate']);
    });

    it('should update the DOM input value when store state changes', () => {
      const mockInput = { value: '2023-10-14' };
      dom.qs.mockReturnValue(mockInput);
      
      // Capture the callback passed to store.subscribe
      setupDateSelectObserver('#date-picker');
      const subscriberCallback = store.subscribe.mock.calls[0][0];
      
      // Trigger callback with new state
      subscriberCallback({ currentDate: '2023-10-15' });
      
      expect(mockInput.value).toBe('2023-10-15');
    });

    it('should not update the DOM input value if it already matches the state', () => {
        const mockInput = { value: '2023-10-15' };
        dom.qs.mockReturnValue(mockInput);
        
        setupDateSelectObserver('#date-picker');
        const subscriberCallback = store.subscribe.mock.calls[0][0];
        
        // Use a setter mock to prove the property wasn't reassigned
        let wasReassigned = false;
        Object.defineProperty(mockInput, 'value', {
            get: () => '2023-10-15',
            set: () => { wasReassigned = true; }
        });

        subscriberCallback({ currentDate: '2023-10-15' });
        expect(wasReassigned).toBe(false);
      });
  });

    describe('chooseSemester', () => {
    it('should return the correct semester based on the given dates', () => {
      const rolloverDate = new Date(2027, 0, 26, 0, 0, 0);

      // different years
      expect(chooseSemester(new Date(2026, 0, 26), rolloverDate)).toBe('1');
      expect(chooseSemester(new Date(2028, 0, 26), rolloverDate)).toBe('2');

      // different months
      expect(chooseSemester(new Date(2027, -1, 26), rolloverDate)).toBe('1');
      expect(chooseSemester(new Date(2027, 2, 26), rolloverDate)).toBe('2');

      // different days
      expect(chooseSemester(new Date(2027, 0, 25), rolloverDate)).toBe('1');
      expect(chooseSemester(new Date(2027, 0, 26), rolloverDate)).toBe('2');
      expect(chooseSemester(new Date(2027, 0, 27), rolloverDate)).toBe('2');

      // different times
      expect(chooseSemester(new Date(2027, 0, 26, 0, 0, 1), rolloverDate)).toBe('2');

      //invalid dates
      const mock = vi.fn();
      mock(undefined);

      expect(chooseSemester('2027-01-01', rolloverDate)).toBe(null);
      expect(chooseSemester(null, rolloverDate)).toBe(null);
      expect(chooseSemester(mock, rolloverDate)).toBe(null);
      
      expect(chooseSemester(new Date(2027, 0, 26), '2027-01-01')).toBe(null);
      expect(chooseSemester(new Date(2027, 0, 26), null)).toBe(null);
      expect(chooseSemester(new Date(2027, 0, 26), mock)).toBe(null);
    });
  });
});