import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ALL_STUDIES, getAvailableStudies, studyTeacherChangeHandler, updateStudyOptions, setupStudyObservers } from '../../client/attendance/study-select';
import * as dom from '../../client/common/dom';
import { store } from '../../client/attendance/attendance-store';

vi.mock('../../client/common/dom', () => ({
  valueOf: vi.fn(),
  clearOptions: vi.fn(),
  appendOption: vi.fn(),
  qs: vi.fn(),
  setValue: vi.fn(),
}));

vi.mock('../../client/attendance/attendance-store', () => ({
  store: {
    setState: vi.fn(),
    getState: vi.fn().mockReturnValue({ ui_currentStudy: 'All studies' }),
    subscribe: vi.fn(),
  },
}));

describe('Study Select Module', () => {
  const date = new Date('2023-10-15');
  const signups = [
    { date, period: '1', teacherStudy: 'Mr. Smith' },
    { date, period: '1', teacherStudy: 'Ms. Jones' },
    { date, period: '2', teacherStudy: 'Mr. Smith' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailableStudies', () => {
    it('returns [ALL_STUDIES] if date or period missing', () => {
      expect(getAvailableStudies(signups, null, '1')).toEqual([ALL_STUDIES]);
    });

    it('extracts unique sorted studies for date and period', () => {
      const studies = getAvailableStudies(signups, date, '1');
      expect(studies).toEqual([ALL_STUDIES, 'Mr. Smith', 'Ms. Jones']);
    });
  });

  describe('studyTeacherChangeHandler', () => {
    it('updates store with selected study', () => {
      const event = { target: { value: 'Mr. Smith' } };
      studyTeacherChangeHandler(event);
      expect(store.setState).toHaveBeenCalledWith({ ui_currentStudy: 'Mr. Smith' });
    });
  });

  describe('updateStudyOptions', () => {
    it('updates options in DOM', () => {
      updateStudyOptions(date, '1', signups);
      expect(dom.clearOptions).toHaveBeenCalledWith('#study-select');
      expect(dom.appendOption).toHaveBeenCalledWith('#study-select', ALL_STUDIES, ALL_STUDIES, false);
      expect(dom.appendOption).toHaveBeenCalledWith('#study-select', 'Mr. Smith', 'Mr. Smith', false);
      expect(dom.appendOption).toHaveBeenCalledWith('#study-select', 'Ms. Jones', 'Ms. Jones', false);
    });
  });

  describe('setupStudyObservers', () => {
    it('subscribes to date, period, signups and currentStudy', () => {
      setupStudyObservers();
      expect(store.subscribe).toHaveBeenCalledTimes(2);
    });
  });
});
