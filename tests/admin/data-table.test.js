import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initObservers,
  resort,
  sortSignups,
  showAttendance,
  showSignupInfo,
} from '../../src/admin/data-table.js';
import * as dom from '../../src/common/dom.js';
import { store } from '../../src/common/store.js';
import { DataRow } from '../../src/admin/data-row.js';

vi.mock('../../src/common/dom.js', () => ({
  qs: vi.fn(),
  qsa: vi.fn(),
  setVisible: vi.fn(),
}));

vi.mock('../../src/common/dates.js', () => ({
  parseDateInput: vi.fn(),
  isSameDate: vi.fn(),
}));

vi.mock('../../src/common/messaging.js', () => ({}));

vi.mock('../../src/common/store.js', () => ({
  store: {
    subscribe: vi.fn(),
    getState: vi.fn(),
    setState: vi.fn(),
  },
}));

vi.mock('../../src/admin/data-row.js', () => ({
  DataRow: vi.fn().mockImplementation((rowId, signup) => ({
    rowId,
    signup,
    element: document.createElement('div'),
    populate: vi.fn(),
  })),
}));

describe('data-table', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initObservers', () => {
    let observerCallbacks = [];

    beforeEach(() => {
      observerCallbacks = [];
      vi.mocked(store.subscribe).mockImplementation((cb) => {
        observerCallbacks.push(cb);
      });
    });

    it('subscribes observers to store with specified key triggers', () => {
      initObservers();
      expect(store.subscribe).toHaveBeenCalledTimes(2);
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), [
        'signups',
        'currentSortField',
        'currentSortOrder',
        'requestedStudentEmail',
      ]);
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), [
        'currentSortField',
        'currentSortOrder',
      ]);
    });

    describe('Signups Observer', () => {
      let targetTable;

      beforeEach(() => {
        targetTable = document.createElement('div');
        vi.mocked(dom.qs).mockImplementation((selector) => {
          if (selector === '#student-panel') return targetTable;
          return null;
        });
        vi.mocked(dom.qsa).mockReturnValue([]);
      });

      it('does nothing if requestedStudentEmail is empty', () => {
        initObservers();
        const signupObserver = observerCallbacks[0];

        signupObserver({
          signups: [],
          currentSortField: 'student',
          currentSortOrder: 'asc',
          requestedStudentEmail: '',
        });

        expect(dom.qsa).not.toHaveBeenCalled();
        expect(store.setState).not.toHaveBeenCalled();
      });

      it('removes existing rows and renders filtered rows for requested student', () => {
        initObservers();
        const signupObserver = observerCallbacks[0];

        const mockExistingRow = { remove: vi.fn() };
        vi.mocked(dom.qsa).mockReturnValue([mockExistingRow]);

        const mockSignups = [
          { rowId: '1', emailStudent: 'target@test.com', lastname: 'Smith' },
          { rowId: '2', emailStudent: 'other@test.com', lastname: 'Jones' },
        ];

        signupObserver({
          signups: mockSignups,
          currentSortField: 'student',
          currentSortOrder: 'asc',
          requestedStudentEmail: 'target@test.com',
        });

        expect(dom.qsa).toHaveBeenCalledWith('#student-panel .student-row');
        expect(mockExistingRow.remove).toHaveBeenCalled();
        expect(DataRow).toHaveBeenCalledTimes(1);
        expect(DataRow).toHaveBeenCalledWith('1', mockSignups[0]);
        expect(store.setState).toHaveBeenCalledWith({
          dataRows: [expect.objectContaining({ rowId: '1' })],
        });
      });
    });

    describe('Sort Header UI Observer', () => {
      let studentHeaderIcon, studyHeaderIcon, activeSortIcon;

      beforeEach(() => {
        studentHeaderIcon = document.createElement('div');
        studyHeaderIcon = document.createElement('div');
        activeSortIcon = document.createElement('i');

        vi.mocked(dom.qsa).mockReturnValue([activeSortIcon]);
        vi.mocked(dom.qs).mockImplementation((selector) => {
          if (selector === '.sort-student') return studentHeaderIcon;
          if (selector === '.sort-study') return studyHeaderIcon;
          if (selector === '.sort-icon i.active') return activeSortIcon;
          return null;
        });
      });

      it('activates student header and sets down caret for ascending order', () => {
        initObservers();
        const sortObserver = observerCallbacks[1];

        sortObserver({ currentSortField: 'student', currentSortOrder: 'asc' });

        expect(studentHeaderIcon.classList.contains('active')).toBe(true);
        expect(activeSortIcon.classList.contains('fa-caret-down')).toBe(true);
      });

      it('activates study header and sets up caret for descending order', () => {
        initObservers();
        const sortObserver = observerCallbacks[1];

        sortObserver({ currentSortField: 'study', currentSortOrder: 'desc' });

        expect(studyHeaderIcon.classList.contains('active')).toBe(true);
        expect(activeSortIcon.classList.contains('fa-caret-up')).toBe(true);
      });
    });
  });

  describe('resort', () => {
    it('toggles sort order from asc to desc when same field is selected', () => {
      vi.mocked(store.getState).mockReturnValue({
        currentSortField: 'student',
        currentSortOrder: 'asc',
      });

      resort('student');

      expect(store.setState).toHaveBeenCalledWith({
        currentSortField: 'student',
        currentSortOrder: 'desc',
      });
    });

    it('defaults to asc order when a new field is selected', () => {
      vi.mocked(store.getState).mockReturnValue({
        currentSortField: 'student',
        currentSortOrder: 'desc',
      });

      resort('study');

      expect(store.setState).toHaveBeenCalledWith({
        currentSortField: 'study',
        currentSortOrder: 'asc',
      });
    });
  });

  describe('sortSignups', () => {
    const mockData = [
      { lastname: 'Zapata', teacherStudy: 'Mr. Baker' },
      { lastname: 'Adams', teacherStudy: 'Ms. Clark' },
    ];

    it('sorts by student lastname in ascending order', () => {
      const result = sortSignups(mockData, 'student', 'asc');
      expect(result[0].lastname).toBe('Adams');
      expect(result[1].lastname).toBe('Zapata');
    });

    it('sorts by student lastname in descending order', () => {
      const result = sortSignups(mockData, 'student', 'desc');
      expect(result[0].lastname).toBe('Zapata');
      expect(result[1].lastname).toBe('Adams');
    });

    it('sorts by teacherStudy in ascending order', () => {
      const result = sortSignups(mockData, 'study', 'asc');
      expect(result[0].teacherStudy).toBe('Mr. Baker');
      expect(result[1].teacherStudy).toBe('Ms. Clark');
    });

    it('does not mutate the original array', () => {
      const copy = [...mockData];
      sortSignups(mockData, 'student', 'asc');
      expect(mockData).toEqual(copy);
    });
  });

  describe('showAttendance', () => {
    it('resets panel transform and updates header visibility', () => {
      const mockPanel = document.createElement('div');
      const signupInfo = document.createElement('div');
      const attendanceInfo = document.createElement('div');

      vi.mocked(dom.qsa).mockReturnValue([mockPanel]);
      vi.mocked(dom.qs).mockImplementation((selector) => {
        if (selector === '.header-row .signup-info') return signupInfo;
        if (selector === '.header-row .attendance-info') return attendanceInfo;
        return null;
      });

      showAttendance();

      expect(mockPanel.style.transform).toBe('translate(0, 0)');
      expect(dom.setVisible).toHaveBeenCalledWith(signupInfo, false);
      expect(dom.setVisible).toHaveBeenCalledWith(attendanceInfo, true);
    });
  });

  describe('showSignupInfo', () => {
    it('calculates width and translates panels left', () => {
      const mockPanel = document.createElement('div');
      const signupInfo = document.createElement('div');
      const attendanceInfo = {
        getBoundingClientRect: vi.fn(() => ({ width: 224 })),
      };

      vi.mocked(dom.qsa).mockReturnValue([mockPanel]);
      vi.mocked(dom.qs).mockImplementation((selector) => {
        if (selector === '.header-row .signup-info') return signupInfo;
        if (selector === '.header-row .attendance-info') return attendanceInfo;
        return null;
      });

      showSignupInfo();

      expect(mockPanel.style.transform).toBe('translate(-200px, 0)');
      expect(dom.setVisible).toHaveBeenCalledWith(signupInfo, true);
      expect(dom.setVisible).toHaveBeenCalledWith(attendanceInfo, false);
    });
  });
});