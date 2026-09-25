import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initObservers,
  resort,
  sortSignups,
  showAttendance,
  showSignupInfo,
} from '../../client/admin/settings-table.js';
import * as dom from '../../client/common/dom.js';
import { store } from '../../client/common/store.js';
import { SettingsRow } from '../../client/admin/settings-row.js';

vi.mock('../../client/common/dom.js', () => ({
  qs: vi.fn(),
  qsa: vi.fn(),
  setVisible: vi.fn(),
}));

vi.mock('../../client/common/store.js', () => ({
  store: {
    subscribe: vi.fn(),
    getState: vi.fn(),
    setState: vi.fn(),
  },
}));

vi.mock('../../client/admin/settings-row.js', () => ({
  SettingsRow: vi.fn().mockImplementation((key, setting) => ({
    key,
    setting,
    element: document.createElement('div'),
    populate: vi.fn(),
  })),
}));

describe('settings-table', () => {
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
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), ['settings']);
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), [
        'ui_currentSortField',
        'ui_currentSortOrder',
      ]);
    });

    describe('Settings Observer', () => {
      let targetTable;

      beforeEach(() => {
        targetTable = document.createElement('div');
        vi.mocked(dom.qs).mockImplementation((selector) => {
          if (selector === '#settings-panel') return targetTable;
          return null;
        });
        vi.mocked(dom.qsa).mockReturnValue([]);
      });

      it('bails early if settings is null or undefined', () => {
        initObservers();
        const settingsObserver = observerCallbacks[0];

        settingsObserver({ settings: null });

        expect(dom.qsa).not.toHaveBeenCalled();
        expect(SettingsRow).not.toHaveBeenCalled();
      });

      it('removes existing rows and renders new settings rows', () => {
        initObservers();
        const settingsObserver = observerCallbacks[0];

        const mockExistingRow = { remove: vi.fn() };
        vi.mocked(dom.qsa).mockReturnValue([mockExistingRow]);

        const mockSettings = [
          { key: 'MAX_SIGNUPS', value: '10' },
          { key: 'APP_NAME', value: 'PassApp' },
        ];

        settingsObserver({ settings: mockSettings });

        expect(dom.qsa).toHaveBeenCalledWith('#settings-panel .settings-row');
        expect(mockExistingRow.remove).toHaveBeenCalled();
        expect(SettingsRow).toHaveBeenCalledTimes(2);
        expect(SettingsRow).toHaveBeenCalledWith('MAX_SIGNUPS', mockSettings[0]);
        expect(SettingsRow).toHaveBeenCalledWith('APP_NAME', mockSettings[1]);
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

      it('updates sort icon classes according to active field and direction', () => {
        initObservers();
        const sortObserver = observerCallbacks[1];

        sortObserver({ currentSortField: 'student', currentSortOrder: 'asc' });

        expect(studentHeaderIcon.classList.contains('active')).toBe(true);
        expect(activeSortIcon.classList.contains('fa-caret-down')).toBe(true);
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

    it('sorts signups array correctly by specified target field', () => {
      const result = sortSignups(mockData, 'student', 'asc');
      expect(result[0].lastname).toBe('Adams');
      expect(result[1].lastname).toBe('Zapata');
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