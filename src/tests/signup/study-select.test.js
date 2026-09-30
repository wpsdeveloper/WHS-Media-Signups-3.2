import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getAvailableStudyTeachers,
  updateStudyUi,
  toggleStudyInputVisibility,
  studyTeacherChangeHandler, 
  updateStudyOptions, 
  setupStudyObservers 
} from '../../client/signup/study-select';
import * as dom from '../../client/common/dom';
import { store } from '../../client/signup/signup-store';

/**
 * Mocks DOM manipulation utilities.
 */
vi.mock('../../client/common/dom', () => ({
  clearOptions: vi.fn(),
  setVisible: vi.fn(),
  valueOf: vi.fn(),
  appendOption: vi.fn(),
  qs: vi.fn(),
  setValue: vi.fn(),
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

describe('Study Select Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Tests for pure calculation of available study teachers.
   */
  describe('getAvailableStudyTeachers', () => {
    it('should return an empty array if currentScheduleBlock or currentType is missing', () => {
      expect(getAvailableStudyTeachers(null, 'Intervention')).toEqual([]);
      expect(getAvailableStudyTeachers({ studyTeachers: ['Mr. A'] }, null)).toEqual([]);
    });

    it('should return existing teachers from the schedule block', () => {
      const block = { studyTeachers: ['Mr. Smith', 'Ms. Jones'] };
      expect(getAvailableStudyTeachers(block, 'Intervention')).toEqual(['Mr. Smith', 'Ms. Jones']);
    });

    it('should append "Directly from class" if type is "Alt setting"', () => {
      const block = { studyTeachers: ['Mr. Smith'] };
      const result = getAvailableStudyTeachers(block, 'Alt setting');
      expect(result).toContain('Directly from class');
    });

    it('should append "Coming from class" if period is not Wed. PM and type is not Intervention/Non-intervention', () => {
      const block = { period: '1', studyTeachers: ['Mr. Smith'] };
      const result = getAvailableStudyTeachers(block, 'Tutoring');
      expect(result).toContain('Coming from class');
    });

    it('should NOT append "Coming from class" if period is Wed. PM', () => {
      const block = { period: 'Wed. PM', studyTeachers: ['Mr. Smith'] };
      const result = getAvailableStudyTeachers(block, 'Tutoring');
      expect(result).not.toContain('Coming from class');
    });

    it('should append currentStudyTeacher if it is not already in the list', () => {
      const block = { studyTeachers: ['Mr. Smith'] };
      const result = getAvailableStudyTeachers(block, 'Intervention', 'Mr. Existing');
      expect(result).toContain('Mr. Existing');
    });
  });

  /**
   * Tests for visibility toggling.
   */
  describe('toggleStudyInputVisibility', () => {
    it('should show select and hide input when options exist', () => {
      toggleStudyInputVisibility(true);
      expect(dom.setVisible).toHaveBeenCalledWith('#study-teacher-select', true);
      expect(dom.setVisible).toHaveBeenCalledWith('#study-teacher-input', false);
    });

    it('should hide select and show input when options do not exist', () => {
      toggleStudyInputVisibility(false);
      expect(dom.setVisible).toHaveBeenCalledWith('#study-teacher-select', false);
      expect(dom.setVisible).toHaveBeenCalledWith('#study-teacher-input', true);
    });
  });

  /**
   * Tests for the UI rendering logic.
   */
  describe('updateStudyUi', () => {
    it('should clear options, hide inputs, and return early if schedule block is missing', () => {
      updateStudyUi(null, [], null);
      expect(dom.clearOptions).toHaveBeenCalledWith('#study-teacher-select');
      expect(dom.setVisible).toHaveBeenCalledWith('#study-teacher-select', false);
      expect(dom.setVisible).toHaveBeenCalledWith('#study-teacher-input', true);
      // Ensure we didn't try to check period property of null
      expect(dom.setVisible).not.toHaveBeenCalledWith('#study-div', expect.anything());
    });

    it('should hide study div if period is Wed. PM', () => {
      const block = { period: 'Wed. PM' };
      updateStudyUi(block, ['Mr. Smith'], null);
      expect(dom.setVisible).toHaveBeenCalledWith('#study-div', false);
    });

    it('should show study div for non-Wed. PM periods', () => {
      const block = { period: '1' };
      updateStudyUi(block, ['Mr. Smith'], null);
      expect(dom.setVisible).toHaveBeenCalledWith('#study-div', true);
    });

    it('should append provided teachers and toggle visibility based on options', () => {
      const block = { period: '1' };
      const teachers = ['Mr. Smith', 'Ms. Jones'];
      
      updateStudyUi(block, teachers, null);
      
      expect(dom.appendOption).toHaveBeenCalledWith('#study-teacher-select', 'Mr. Smith', 'Mr. Smith', false);
      expect(dom.appendOption).toHaveBeenCalledWith('#study-teacher-select', 'Ms. Jones', 'Ms. Jones', false);
      expect(dom.setVisible).toHaveBeenCalledWith('#study-teacher-select', true);
    });

    it('should restore current selected teacher in the UI if provided', () => {
      const block = { period: '1' };
      updateStudyUi(block, ['Mr. Smith'], 'Mr. Smith');
      expect(dom.setValue).toHaveBeenCalledWith('#study-teacher-select', 'Mr. Smith');
    });
  });

  /**
   * Tests for the study teacher change event handler.
   */
  describe('studyTeacherChangeHandler', () => {
    it('should update store state with the selected teacher from event target', () => {
      const mockEvent = { target: { value: 'Mr. Smith' } };
      studyTeacherChangeHandler(mockEvent);
      expect(store.setState).toHaveBeenCalledWith({ ui_currentStudyTeacher: 'Mr. Smith' });
    });

    it('should fall back to DOM value methods if event target is missing', () => {
      dom.valueOf.mockImplementation((selector) => {
        if (selector === '#study-teacher-input') return 'Ms. Input';
        return null;
      });

      studyTeacherChangeHandler();
      expect(store.setState).toHaveBeenCalledWith({ ui_currentStudyTeacher: 'Ms. Input' });
    });
  });

  /**
   * Tests for the orchestrator function.
   */
  describe('updateStudyOptions', () => {
    it('should orchestrate calculating available teachers and updating the UI', () => {
      const block = { period: '1', studyTeachers: ['Mr. Math'] };
      
      // We pass 'Alt setting' which should inject 'Directly from class'
      updateStudyOptions(block, 'Alt setting', 'Mr. History');

      expect(dom.clearOptions).toHaveBeenCalledWith('#study-teacher-select');
      expect(dom.appendOption).toHaveBeenCalledWith('#study-teacher-select', 'Mr. Math', 'Mr. Math', false);
      expect(dom.appendOption).toHaveBeenCalledWith('#study-teacher-select', 'Directly from class', 'Directly from class', false);
      expect(dom.appendOption).toHaveBeenCalledWith('#study-teacher-select', 'Mr. History', 'Mr. History', false);
      expect(dom.setValue).toHaveBeenCalledWith('#study-teacher-select', 'Mr. History');
    });
  });

  /**
   * Tests for the setup of state observers.
   */
  describe('setupStudyObservers', () => {
    it('should subscribe to schedule block and type changes', () => {
      setupStudyObservers();
      
      expect(store.subscribe).toHaveBeenCalledTimes(2);
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['ui_currentScheduleBlock', 'ui_currentPeriod', 'ui_currentType']
      );
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['ui_currentStudyTeacher']
      );
    });

    it('should trigger UI updates when schedule block or type changes', () => {
      setupStudyObservers();
      const optionsCallback = store.subscribe.mock.calls[0][0];

      optionsCallback({
        ui_currentScheduleBlock: { period: '1', studyTeachers: ['Mr. Smith'] },
        ui_currentType: 'Intervention',
        ui_currentStudyTeacher: null
      });

      expect(dom.clearOptions).toHaveBeenCalledWith('#study-teacher-select');
      expect(dom.appendOption).toHaveBeenCalledWith('#study-teacher-select', 'Mr. Smith', 'Mr. Smith', false);
    });

    it('should synchronize DOM elements when state.ui_currentStudyTeacher changes', () => {
      setupStudyObservers();
      const subjectCallback = store.subscribe.mock.calls[1][0];

      // Simulate inputs containing stale values
      dom.qs.mockReturnValue({ value: 'Old Teacher' });
      
      subjectCallback({ ui_currentStudyTeacher: 'New Teacher' });

      expect(dom.setValue).toHaveBeenCalledWith('#study-teacher-select', 'New Teacher');
      expect(dom.setValue).toHaveBeenCalledWith('#study-teacher-input', 'New Teacher');
    });

    it('should not update DOM if values already match state', () => {
      setupStudyObservers();
      const subjectCallback = store.subscribe.mock.calls[1][0];

      // Simulate inputs already containing correct value
      dom.qs.mockReturnValue({ value: 'Same Teacher' });
      
      subjectCallback({ ui_currentStudyTeacher: 'Same Teacher' });

      expect(dom.setValue).not.toHaveBeenCalled();
    });
  });
});