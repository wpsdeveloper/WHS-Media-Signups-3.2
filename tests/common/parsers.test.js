import { describe, it, expect } from 'vitest';
import {
  parseStudents,
  parseStudentNames,
  parseDailySchedules,
  parseInterventionTeachers,
  parseNoFlyList,
  parseMaxSignups,
  parseSignups,
  parseStudyTeachers,
  parseUpdateStudent
} from '../../src/common/parsers.js';

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

  describe('safeJsonParse wrappers (DailySchedules, InterventionTeachers, Signups, StudyTeachers)', () => {
    const parsersToTest = [
      parseDailySchedules,
      parseInterventionTeachers,
      parseSignups,
      parseStudyTeachers
    ];

    parsersToTest.forEach(parserFunc => {
      describe(parserFunc.name, () => {
        it('should parse a valid JSON string', () => {
          const jsonString = '[{"id": 1}]';
          expect(parserFunc(jsonString)).toEqual([{ id: 1 }]);
        });

        it('should return the input if it is already an object/array', () => {
          const data = [{ id: 1 }];
          expect(parserFunc(data)).toEqual(data);
        });

        it('should return an empty array fallback on invalid JSON', () => {
          expect(parserFunc('invalid-json')).toEqual([]);
        });

        it('should return an empty array on null or undefined', () => {
          expect(parserFunc(null)).toEqual([]);
          expect(parserFunc(undefined)).toEqual([]);
        });
      });
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

    it('should return the number if a number is provided', () => {
      expect(parseMaxSignups(25)).toBe(25);
    });

    it('should return 15 as a fallback for invalid numbers', () => {
      expect(parseMaxSignups('invalid')).toBe(10);
      expect(parseMaxSignups(null)).toBe(10);
    });
  });

  describe('parseUpdateStudent', () => {
    it('should parse a valid JSON string', () => {
      const jsonString = '{"id": 123}';
      expect(parseUpdateStudent(jsonString)).toEqual({ id: 123 });
    });

    it('should return null fallback on invalid JSON', () => {
      expect(parseUpdateStudent('invalid-json')).toBeNull();
    });

    it('should return null on null or undefined', () => {
      expect(parseUpdateStudent(null)).toBeNull();
    });
  });
});