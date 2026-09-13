import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  subjectChangeHandler, 
  updateSubjectOptions, 
  setupSubjectOptionsObserver, 
  setupSubjectValueObserver 
} from '../../signup/subject-select.js';
import * as dom from '../../common/dom.js';
import * as dates from '../../common/dates.js';
import { store } from '../../signup/store.js';

// Mock dependencies
vi.mock('../../common/dom.js', () => ({
  clearOptions: vi.fn(),
  appendOption: vi.fn(),
  qs: vi.fn(),
  setValue: vi.fn(),
}));

vi.mock('../../common/dates.js', () => ({
  parseDateInput: vi.fn(d => new Date(d)),
  isSameDate: vi.fn((d1, d2) => d1.toDateString() === d2.toDateString()),
}));

vi.mock('../../signup/store.js', () => ({
  store: { 
    setState: vi.fn(),
    subscribe: vi.fn() 
  }
}));

describe('Subject Select Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Anchor the system time so 'new Date()' behaves predictably in tests
    vi.setSystemTime(new Date('2023-10-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('subjectChangeHandler', () => {
    it('should update store state with the selected subject', () => {
      const mockEvent = { target: { value: 'Math' } };
      subjectChangeHandler(mockEvent);
      expect(store.setState).toHaveBeenCalledWith({ currentSubject: 'Math' });
    });
  });

  describe('updateSubjectOptions', () => {
    it('should clear options and return early if required arguments are missing', () => {
      updateSubjectOptions(null, '1', {}, []);
      expect(dom.clearOptions).toHaveBeenCalledWith('#subject-int-select');
      expect(dom.appendOption).not.toHaveBeenCalled();

      dom.clearOptions.mockClear();
      updateSubjectOptions('2023-10-01', null, {}, []);
      expect(dom.clearOptions).toHaveBeenCalledWith('#subject-int-select');
      
      dom.clearOptions.mockClear();
      updateSubjectOptions('2023-10-01', '1', null, []);
      expect(dom.clearOptions).toHaveBeenCalledWith('#subject-int-select');
    });

    it('should use S1 schedules and append options if today is before s2Date', () => {
      dates.isSameDate.mockReturnValue(true);

      const interventionTeachers = {
        s2Date: '2024-01-01', // Future date relative to mocked today (2023-10-01)
        s1: { 'A': { '1': ['Mr. Math', 'Ms. Science'] } },
        s2: { 'A': { '1': ['Mr. History'] } }
      };
      
      const schedules = [{ date: '2023-10-01', day: 'A' }];

      updateSubjectOptions('2023-10-01', '1', interventionTeachers, schedules);

      expect(dom.appendOption).toHaveBeenCalledWith('#subject-int-select', 'Mr. Math', 'Mr. Math');
      expect(dom.appendOption).toHaveBeenCalledWith('#subject-int-select', 'Ms. Science', 'Ms. Science');
      expect(dom.appendOption).not.toHaveBeenCalledWith('#subject-int-select', 'Mr. History', 'Mr. History');
    });

    it('should use S2 schedules and append options if today is after s2Date', () => {
      dates.isSameDate.mockReturnValue(true);

      const interventionTeachers = {
        s2Date: '2023-01-01', // Past date relative to mocked today (2023-10-01)
        s1: { 'A': { '1': ['Mr. Math'] } },
        s2: { 'A': { '1': ['Mr. History'] } }
      };
      
      const schedules = [{ date: '2023-10-01', day: 'A' }];

      updateSubjectOptions('2023-10-01', '1', interventionTeachers, schedules);

      expect(dom.appendOption).toHaveBeenCalledWith('#subject-int-select', 'Mr. History', 'Mr. History');
      expect(dom.appendOption).not.toHaveBeenCalledWith('#subject-int-select', 'Mr. Math', 'Mr. Math');
    });

    it('should safely return and not append if schedules or days are undefined', () => {
      dates.isSameDate.mockReturnValue(true);

      const interventionTeachers = {
        s2Date: '2024-01-01',
        s1: {} // Missing day 'A'
      };
      
      const schedules = [{ date: '2023-10-01', day: 'A' }];

      updateSubjectOptions('2023-10-01', '1', interventionTeachers, schedules);

      expect(dom.appendOption).not.toHaveBeenCalled();
    });
  });

  describe('setupSubjectOptionsObserver', () => {
    it('should subscribe to the store and trigger option updates on state change', () => {
      setupSubjectOptionsObserver();
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['currentDate', 'currentPeriod', 'interventionTeachers', 'dailySchedules']
      );

      const subscriberCallback = store.subscribe.mock.calls[0][0];
      
      subscriberCallback({
        currentDate: '2023-10-01',
        currentPeriod: '1',
        interventionTeachers: null,
        dailySchedules: []
      });

      expect(dom.clearOptions).toHaveBeenCalledWith('#subject-int-select');
    });
  });

  describe('setupSubjectValueObserver', () => {
    it('should synchronize DOM element selection when state.currentSubject changes', () => {
      setupSubjectValueObserver();
      const subscriberCallback = store.subscribe.mock.calls[0][0];

      dom.qs.mockReturnValue({ value: 'Old Subject' });
      subscriberCallback({ currentSubject: 'New Subject' });

      expect(dom.setValue).toHaveBeenCalledWith('#subject-int-select', 'New Subject');
    });

    it('should not update DOM if the select element value already matches state', () => {
      setupSubjectValueObserver();
      const subscriberCallback = store.subscribe.mock.calls[0][0];

      dom.qs.mockReturnValue({ value: 'Same Subject' });
      subscriberCallback({ currentSubject: 'Same Subject' });

      expect(dom.setValue).not.toHaveBeenCalled();
    });
  });
});