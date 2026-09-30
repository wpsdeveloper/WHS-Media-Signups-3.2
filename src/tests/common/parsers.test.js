import { describe, it, expect } from 'vitest';
import {
  parseStudents,
  parseStudentNames,
  parseDailyBlocks,
  parseInterventionTeachers,
  parseNoFlyList,
  parseMaxSignups,
  parseSignups,
  parseStudyTeachers,
  parseUpdateStudent
} from '../../client/common/parsers';

describe('Parsers Module', () => {
  describe('parseStudents', () => {
    it('should return the array if an array is provided', () => {
      const students = [{ firstname: 'John' }];
      expect(parseStudents(students)).toEqual(students);
    });

    it('should return an empty array if a non-array is provided', () => {
      expect(parseStudents(null)).toEqual([]);
      expect(parseStudents('string')).toEqual([]);
    });
  });

  describe('parseStudentNames', () => {
    it('should map student objects to formatted strings', () => {
      const students = [
        { firstname: 'John', lastname: 'Doe', email: 'john@test.com' },
        { firstname: 'Jane', lastname: 'Smith', email: 'jane@test.com' }
      ];
      const expected = [
        'Doe, John <john@test.com>',
        'Smith, Jane <jane@test.com>'
      ];
      expect(parseStudentNames(students)).toEqual(expected);
    });

    it('should return an empty array if a non-array is provided', () => {
      expect(parseStudentNames(null)).toEqual([]);
    });
  });

  describe('parseNoFlyList', () => {
    it('should return the array if provided', () => {
      const emails = ['bad@test.com'];
      expect(parseNoFlyList(emails)).toEqual(emails);
    });

    it('should return an empty array if not an array', () => {
      expect(parseNoFlyList('bad@test.com')).toEqual([]);
    });
  });

  describe('parseMaxSignups', () => {
    it('should parse a valid number string', () => {
      expect(parseMaxSignups('20')).toBe(20);
    });

    it('should return 10 as a fallback for invalid numbers', () => {
      expect(parseMaxSignups('invalid')).toBe(10);
      expect(parseMaxSignups(null)).toBe(10);
    });
  });
});
