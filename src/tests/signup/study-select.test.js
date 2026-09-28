import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  studyTeacherChangeHandler, 
  updateStudyOptions, 
  showStudyAltInput, 
  setupStudyOptionsObserver, 
  setupStudySelectValueObserver ,
  chooseSemester,
} from '../../client/signup/study-select.js';
import * as dom from '../../client/common/dom.js';
import * as dates from '../../client/common/dates.ts';
import { store } from '../../client/common/store.js';

// Mock dependencies
/**
 * Mocks DOM manipulation utilities.
 */
vi.mock('../../client/common/dom.js', () => ({
  clearOptions: vi.fn(),
  setVisible: vi.fn(),
  valueOf: vi.fn(),
  appendOption: vi.fn(),
  setAttribute: vi.fn(),
  qs: vi.fn(),
  qsa: vi.fn(),
  setValue: vi.fn(),
}));

/**
 * Mocks date utilities for predictable parsing and semester evaluation.
 */
vi.mock('../../client/common/dates.ts', () => ({
  /**
   * @param {string} d - The date to parse
   * @returns {Date} Parsed Date object
   */
  parseDateInput: vi.fn(d => new Date(d)),
  /**
   * @param {Date} d1 - First date
   * @param {Date} d2 - Second date
   * @returns {boolean} True if the dates share the same calendar day
   */
  isSameDate: vi.fn((d1, d2) => d1.toDateString() === d2.toDateString()),
  /**
   * @returns {string} The mock semester string
   */
  chooseSemester: vi.fn(),
}));

/**
 * Mocks the central state store to track state updates and subscriptions.
 */
vi.mock('../../client/common/store.js', () => ({
  store: { 
    setState: vi.fn(),
    subscribe: vi.fn() 
  }
}));

describe('Study Select Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Tests for the study teacher change event handler.
   */
  describe('studyTeacherChangeHandler', () => {
    it('should update store state with the selected teacher', () => {
      // Simulate changing the selected teacher in the UI
      const mockEvent = { target: { value: 'Mr. Smith' } };
      studyTeacherChangeHandler(mockEvent);
      expect(store.setState).toHaveBeenCalledWith({ currentStudyTeacher: 'Mr. Smith' });
    });
  });

  /**
   * Tests for updating study select options dynamically based on date, period, and schedules.
   */
  describe('updateStudyOptions', () => {
    it('should clear options and return early if arguments are missing', () => {
      // Test missing required inputs
      updateStudyOptions(null, '1', 'Intervention', null, []);
      expect(dom.clearOptions).toHaveBeenCalledWith('#study-teacher-select');
      expect(dom.setVisible).not.toHaveBeenCalled();
    });

    it('should hide study div if period is Wed. PM', () => {
      // Wednesday afternoons might have special rules hiding the study selection
      updateStudyOptions('2023-11-01', 'Wed. PM', 'Non-intervention', { s2Date: '2099-01-01' }, []);
      expect(dom.setVisible).toHaveBeenCalledWith('#study-div', false);
    });

    it('should append "Directly from class" if the DOM type input is "Alt setting"', () => {
      // Handle the alternative setting edge case which provides a static option
      dom.valueOf.mockReturnValue('Alt setting');
      
      updateStudyOptions('2023-11-01', '1', 'Alt setting', { s2Date: '2099-01-01' }, []);
      
      expect(dom.appendOption).toHaveBeenCalledWith('#study-teacher-select', 'Directly from class', 'Directly from class', false);
    });

    it('should use S1 schedules if today is before s2Date and append valid teachers', () => {
      dom.valueOf.mockReturnValue('Tutoring');
      dates.isSameDate.mockReturnValue(true);
      dates.chooseSemester.mockReturnValue('1'); // Force Semester 1 behavior
      
      const studyTeachers = {
        s2Date: '2099-01-01', // Forces S1
        s1: { 'A': { '1': ['Teacher 1', 'Teacher 2'] } }
      };
      
      const schedules = [{ date: '2023-11-01', day: 'A' }];

      updateStudyOptions('2023-11-01', '1', 'Intervention', studyTeachers, schedules);

      expect(dom.appendOption).toHaveBeenCalledWith('#study-teacher-select', 'Teacher 1', 'Teacher 1', false);
      expect(dom.appendOption).toHaveBeenCalledWith('#study-teacher-select', 'Teacher 2', 'Teacher 2', false);
    });

    it('should use S2 schedules if today is after s2Date', () => {
      dom.valueOf.mockReturnValue('Tutoring');
      dates.isSameDate.mockReturnValue(true);
      dates.chooseSemester.mockReturnValue('2'); // Force Semester 2 behavior

      const studyTeachers = {
        s2Date: '2000-01-01', // Forces S2
        s1: { 'A': { '1': ['Wrong Teacher'] } },
        s2: { 'A': { '1': ['Right Teacher'] } }
      };
      
      const schedules = [{ date: '2023-11-01', day: 'A' }];

      updateStudyOptions('2023-11-01', '1', 'Intervention', studyTeachers, schedules);

      expect(dom.appendOption).toHaveBeenCalledWith('#study-teacher-select', 'Right Teacher', 'Right Teacher', false);
      expect(dom.appendOption).not.toHaveBeenCalledWith('#study-teacher-select', 'Wrong Teacher', 'Wrong Teacher', false);
    });
  });

  /**
   * Tests for the study options observer configuration.
   */
  describe('setupStudyOptionsObserver', () => {
    it('should subscribe to the store with correct dependencies and trigger updates', () => {
      setupStudyOptionsObserver();
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['ui_currentDate', 'ui_currentPeriod', 'ui_currentType', 'studyTeachers', 'dailySchedules']
      );

      const subscriberCallback = store.subscribe.mock.calls[0][0];
      
      // Tell the mock to return an empty array so showStudyAltInput evaluates length === 0
      dom.qsa.mockReturnValue([]);

      subscriberCallback({
        currentDate: '2023-11-01',
        currentPeriod: '1',
        currentType: 'Tutoring',
        studyTeachers: [], // Note: You can remove this property if it's no longer in the store
        dailySchedules: []
      });

      expect(dom.clearOptions).toHaveBeenCalled();
      expect(dom.setVisible).toHaveBeenCalledWith('#study-teacher-input', true);
    });
  });

  /**
   * Tests for value sync observer on study select.
   */
  describe('setupStudySelectValueObserver', () => {
    it('should synchronize DOM selection when state.currentStudyTeacher changes', () => {
      setupStudySelectValueObserver();
      const subscriberCallback = store.subscribe.mock.calls[0][0];

      // This test relies on dom.qs which is properly mocked here to simulate existing selection
      dom.qs.mockReturnValue({ value: 'Old Teacher' });
      subscriberCallback({ currentStudyTeacher: 'New Teacher' });

      expect(dom.setValue).toHaveBeenCalledWith('#study-teacher-select', 'New Teacher');
    });
  });
});