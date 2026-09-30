import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  getAvailableInterventionTeachers,
  subjectChangeHandler,
  updateSubjectUi,
  updateSubjectOptions, 
  setupSubjectObservers 
} from '../../client/signup/subject-select';
import * as dom from '../../client/common/dom';
import { store } from '../../client/signup/signup-store';

/**
 * Mocks DOM manipulation utilities.
 */
vi.mock('../../client/common/dom', () => ({
  clearOptions: vi.fn(),
  appendOption: vi.fn(),
  qs: vi.fn(),
  setValue: vi.fn(),
  valueOf: vi.fn(),
}));

/**
 * Mocks the central state store to track state updates and subscriptions.
 */
vi.mock('../../client/signup/signup-store', () => ({
  store: { 
    setState: vi.fn(),
    subscribe: vi.fn() 
  }
}));

describe('Subject Select Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Tests for the pure calculation function.
   */
  describe('getAvailableInterventionTeachers', () => {
    it('should return an empty array if currentScheduleBlock is null', () => {
      expect(getAvailableInterventionTeachers(null)).toEqual([]);
    });

    it('should return intervention teachers from the schedule block', () => {
      const block = { interventionTeachers: ['Mr. Math', 'Ms. Science'] };
      expect(getAvailableInterventionTeachers(block)).toEqual(['Mr. Math', 'Ms. Science']);
    });

    it('should append currentSubject if it is not already in the teachers list', () => {
      const block = { interventionTeachers: ['Mr. Math'] };
      expect(getAvailableInterventionTeachers(block, 'Ms. Art')).toEqual(['Mr. Math', 'Ms. Art']);
    });

    it('should not duplicate currentSubject if it is already in the teachers list', () => {
      const block = { interventionTeachers: ['Mr. Math', 'Ms. Science'] };
      expect(getAvailableInterventionTeachers(block, 'Ms. Science')).toEqual(['Mr. Math', 'Ms. Science']);
    });
  });

  /**
   * Tests for the subject selection change handler.
   */
  describe('subjectChangeHandler', () => {
    it('should update store state with the selected subject from event target', () => {
      const mockEvent = { target: { value: 'Math' } };
      subjectChangeHandler(mockEvent);
      expect(store.setState).toHaveBeenCalledWith({ ui_currentSubject: 'Math' });
    });

    it('should fall back to DOM value methods if event or target value is missing', () => {
      // Mock dom.valueOf to simulate finding a value in the #subject-int-input field
      dom.valueOf.mockImplementation((selector) => {
        if (selector === '#subject-int-input') return 'History';
        return null;
      });

      subjectChangeHandler();
      expect(store.setState).toHaveBeenCalledWith({ ui_currentSubject: 'History' });
    });
  });

  /**
   * Tests for the UI view update logic.
   */
  describe('updateSubjectUi', () => {
    it('should clear options and append new teachers', () => {
      updateSubjectUi(['Mr. Math', 'Ms. Science'], null);
      
      expect(dom.clearOptions).toHaveBeenCalledWith('#subject-int-select');
      expect(dom.appendOption).toHaveBeenCalledWith('#subject-int-select', 'Mr. Math', 'Mr. Math');
      expect(dom.appendOption).toHaveBeenCalledWith('#subject-int-select', 'Ms. Science', 'Ms. Science');
      expect(dom.setValue).not.toHaveBeenCalled();
    });

    it('should set the selected value if currentSubject is provided and element exists', () => {
      dom.qs.mockReturnValue(true); // Simulate element exists
      updateSubjectUi(['Mr. Math'], 'Mr. Math');
      
      expect(dom.setValue).toHaveBeenCalledWith('#subject-int-select', 'Mr. Math');
    });
  });

  /**
   * Tests for the orchestration function.
   */
  describe('updateSubjectOptions', () => {
    it('should orchestrate calculating available teachers and updating the UI', () => {
      dom.qs.mockReturnValue(true);
      const block = { interventionTeachers: ['Mr. Math'] };
      
      updateSubjectOptions(block, 'Ms. History');

      // It should clear, append both the intervention teacher and the current subject, then set value
      expect(dom.clearOptions).toHaveBeenCalledWith('#subject-int-select');
      expect(dom.appendOption).toHaveBeenCalledWith('#subject-int-select', 'Mr. Math', 'Mr. Math');
      expect(dom.appendOption).toHaveBeenCalledWith('#subject-int-select', 'Ms. History', 'Ms. History');
      expect(dom.setValue).toHaveBeenCalledWith('#subject-int-select', 'Ms. History');
    });
  });

  /**
   * Tests for setting up the store observers.
   */
  describe('setupSubjectObservers', () => {
    it('should register two subscriptions on the store', () => {
      setupSubjectObservers();
      expect(store.subscribe).toHaveBeenCalledTimes(2);
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), ['ui_currentScheduleBlock']);
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), ['ui_currentSubject']);
    });

    it('should trigger updateSubjectOptions on ui_currentScheduleBlock state change', () => {
      setupSubjectObservers();
      const scheduleBlockCallback = store.subscribe.mock.calls.find(call => call[1].includes('ui_currentScheduleBlock'))[0];
      
      scheduleBlockCallback({
        ui_currentScheduleBlock: { interventionTeachers: ['Mr. Math'] },
        ui_currentSubject: 'Mr. Math'
      });

      expect(dom.clearOptions).toHaveBeenCalledWith('#subject-int-select');
      expect(dom.appendOption).toHaveBeenCalledWith('#subject-int-select', 'Mr. Math', 'Mr. Math');
    });

    it('should synchronize DOM elements when state.ui_currentSubject changes', () => {
      setupSubjectObservers();
      const subjectCallback = store.subscribe.mock.calls.find(call => call[1].includes('ui_currentSubject'))[0];

      // Simulate the UI inputs having an outdated value
      dom.qs.mockImplementation(() => ({ value: 'Old Subject' }));
      
      subjectCallback({ ui_currentSubject: 'New Subject' });

      expect(dom.setValue).toHaveBeenCalledWith('#subject-int-select', 'New Subject');
      expect(dom.setValue).toHaveBeenCalledWith('#subject-int-input', 'New Subject');
      expect(dom.setValue).toHaveBeenCalledWith('#subject-non-int', 'New Subject');
    });

    it('should not update DOM if the DOM elements already match the state', () => {
      setupSubjectObservers();
      const subjectCallback = store.subscribe.mock.calls.find(call => call[1].includes('ui_currentSubject'))[0];

      // Simulate the UI already being in sync
      dom.qs.mockImplementation(() => ({ value: 'Same Subject' }));
      
      subjectCallback({ ui_currentSubject: 'Same Subject' });

      expect(dom.setValue).not.toHaveBeenCalled();
    });
  });
});