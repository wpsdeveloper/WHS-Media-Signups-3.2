import { describe, it, expect } from 'vitest';
import { filterSignups, sortSignups } from '../../client/admin/admin-filter';

describe('Admin Filter Module', () => {
  const sampleSignups = [
    { rowId: '1', lastname: 'Zebra', firstname: 'Aaron', date: '2023-10-16', period: '2', emailStudent: 'student1@example.com', email: 'sub1@example.com' },
    { rowId: '2', lastname: 'Aardvark', firstname: 'Bob', date: '2023-10-15', period: '1', emailStudent: 'student2@example.com', email: 'sub2@example.com' },
    { rowId: '3', lastname: 'Smith', firstname: 'Charlie', date: '2023-10-15', period: '3', emailStudent: '', email: 'student1@example.com' },
  ];

  describe('filterSignups', () => {
    it('returns empty array if signups or requestedStudentEmail missing', () => {
      expect(filterSignups([], 'student1@example.com')).toEqual([]);
      expect(filterSignups(sampleSignups, '')).toEqual([]);
      expect(filterSignups(null, 'student1@example.com')).toEqual([]);
    });

    it('filters signups by student email, submitter email, or empty student email', () => {
      const results = filterSignups(sampleSignups, 'student1@example.com');
      // Should include row 1 (emailStudent matches), row 3 (email matches / empty student email)
      expect(results.length).toBe(2);
      expect(results.map(r => r.rowId)).toEqual(['1', '3']);
    });
  });

  describe('sortSignups', () => {
    it('returns empty array if signups is not array', () => {
      expect(sortSignups(null, 'date', 'asc')).toEqual([]);
    });

    it('sorts by date ascending and descending', () => {
      const sortedAsc = sortSignups(sampleSignups, 'date', 'asc');
      expect(sortedAsc[0].rowId).toBe('2'); // 2023-10-15
      expect(sortedAsc[1].rowId).toBe('3'); // 2023-10-15
      expect(sortedAsc[2].rowId).toBe('1'); // 2023-10-16

      const sortedDesc = sortSignups(sampleSignups, 'date', 'desc');
      expect(sortedDesc[0].rowId).toBe('1'); // 2023-10-16
    });

    it('sorts by period ascending and descending', () => {
      const sortedAsc = sortSignups(sampleSignups, 'period', 'asc');
      expect(sortedAsc[0].period).toBe('1');
      expect(sortedAsc[1].period).toBe('2');
      expect(sortedAsc[2].period).toBe('3');
    });
  });
});
