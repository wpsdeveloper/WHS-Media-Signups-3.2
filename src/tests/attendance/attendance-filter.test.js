import { describe, it, expect, vi } from 'vitest';
import { filterSignups, sortSignups } from '../../client/attendance/attendance-filter';
import * as dates from '../../client/common/dates';

vi.mock('../../client/common/dates', () => ({
  isSameDate: vi.fn((d1, d2) => {
    if (!d1 || !d2) return false;
    return new Date(d1).toDateString() === new Date(d2).toDateString();
  }),
}));

describe('Attendance Filter Module', () => {
  const date1 = new Date('2023-10-15');

  const sampleSignups = [
    { rowId: '1', lastname: 'Zebra', firstname: 'Aaron', date: date1, period: '1', teacherStudy: 'Mr. Smith', type: 'Intervention' },
    { rowId: '2', lastname: 'Aardvark', firstname: 'Bob', date: date1, period: '1', teacherStudy: 'Ms. Jones', type: 'Tutoring' },
    { rowId: '3', lastname: 'Smith', firstname: 'Charlie', date: date1, period: '2', teacherStudy: 'Mr. Smith', type: 'Intervention' },
    { rowId: '4', lastname: 'Staff', firstname: 'Res', date: date1, period: '1', teacherStudy: 'Admin', type: 'Staff reservation' },
  ];

  describe('filterSignups', () => {
    it('returns empty array if targetDate, currentPeriod, or signups missing', () => {
      expect(filterSignups(sampleSignups, null, '1', 'All studies')).toEqual([]);
      expect(filterSignups(sampleSignups, date1, null, 'All studies')).toEqual([]);
      expect(filterSignups(null, date1, '1', 'All studies')).toEqual([]);
    });

    it('filters signups by date and period', () => {
      const results = filterSignups(sampleSignups, date1, '1', 'All studies');
      expect(results.length).toBe(3); // Zebra, Aardvark, Staff res
    });

    it('filters signups by study teacher', () => {
      const results = filterSignups(sampleSignups, date1, '1', 'Mr. Smith');
      // Should include Mr. Smith and Staff reservation (which bypasses study filter)
      expect(results.map(r => r.rowId)).toEqual(['1', '4']);
    });
  });

  describe('sortSignups', () => {
    it('returns empty array if signups is not array', () => {
      expect(sortSignups(null, 'student', 'asc')).toEqual([]);
    });

    it('sorts by student lastname and firstname ascending', () => {
      const sorted = sortSignups(sampleSignups, 'student', 'asc');
      expect(sorted[0].lastname).toBe('Aardvark');
      expect(sorted[1].lastname).toBe('Smith');
      expect(sorted[2].lastname).toBe('Staff');
      expect(sorted[3].lastname).toBe('Zebra');
    });

    it('sorts by study teacher ascending', () => {
      const sorted = sortSignups(sampleSignups, 'study', 'asc');
      expect(sorted[0].teacherStudy).toBe('Admin');
      expect(sorted[1].teacherStudy).toBe('Mr. Smith');
      expect(sorted[2].teacherStudy).toBe('Mr. Smith');
      expect(sorted[3].teacherStudy).toBe('Ms. Jones');
    });
  });
});
