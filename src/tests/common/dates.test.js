import {
  toDateInputValue,
  isSameDate,
  parseDateInput,
  formatDateSlashes,
  isValidTime24Hr,
  isValidTime12Hr,
  formatTime,
  convert24HrTo12Hr,
} from '../../client/common/dates.ts';

/* toDateInputValue(date) */
test('toDateInputValue', () => {
  // Standard cases
  expect(toDateInputValue(new Date(2024, 0, 1))).toBe('2024-01-01'); // Jan 1st
  expect(toDateInputValue(new Date(2024, 11, 31))).toBe('2024-12-31'); // Dec 31st

  // Current date
  const today = new Date();
  expect(toDateInputValue(today)).toMatch(/\d{4}-\d{2}-\d{2}/); // YYYY-MM-DD pattern

  // Invalid parameters
  expect(() => toDateInputValue('2026-10-15')).toThrow();
  expect(() => toDateInputValue('')).toThrow();
  expect(() => toDateInputValue(null)).toThrow();
});

/* isSameDate(date1, date2) */
test('isSameDate', () => {
  // Same day
  expect(isSameDate(new Date(2024, 0, 15), new Date(2024, 0, 15))).toBe(true);

  // Different days in same month
  expect(isSameDate(new Date(2024, 0, 15), new Date(2024, 0, 16))).toBe(false);
  
  // Different months
  expect(isSameDate(new Date(2024, 0, 15), new Date(2024, 1, 15))).toBe(false);
  
  // Different years
  expect(isSameDate(new Date(2023, 0, 15), new Date(2024, 0, 15))).toBe(false);
  
  // With different times (should still match)
  expect(
    isSameDate(new Date(2024, 0, 15, 9, 0), new Date(2024, 0, 15, 21, 30)),
  ).toBe(true);
  
  expect(() => isSameDate(new Date(2024, 0, 15), "2024-01-15")).toThrow();
  expect(() => isSameDate( "2024-01-15", new Date(2024, 0, 15))).toThrow();

});

/* parseDateInput(value) */
test('parseDateInput', () => {
  // Valid inputs
  expect(parseDateInput('2024-01-01')).toEqual(new Date(2024, 0, 1));

  // Leading zeros
  expect(parseDateInput('2024-01-01')).toEqual(new Date(2024, 0, 1));

  // Month boundary (Jan → Dec)
  expect(parseDateInput('2024-12-31')).toEqual(new Date(2024, 11, 31));

  // Invalid inputs
  expect(() => parseDateInput('invalid')).toThrow(); // returns-invalid-date;
  expect(() => parseDateInput('')).toThrow(); // returns-invalid-date;
});

/* formatDateSlashes(date) */
test('formatDateSlashes', () => {
  // Standard format
  expect(formatDateSlashes(new Date(2024, 0, 15))).toBe('1/15/2024');

  // Month without leading zero (if desired)
  expect(formatDateSlashes(new Date(2024, 0, 1))).toBe('1/1/2024');

  // Edge cases - year boundaries
  expect(formatDateSlashes(new Date(2000, 0, 1))).toBe('1/1/2000');
  expect(formatDateSlashes(new Date(9999, 11, 31))).toBe('12/31/9999');
});

  /* isValidTime12Hr(timeStr) */
test('isValidTime12Hr', () => {
  // Valid times
  expect(isValidTime12Hr('9:00 AM')).toBe(true);
  expect(isValidTime12Hr('9:00 am')).toBe(true); // case-insensitive
  expect(isValidTime12Hr('12:30 PM')).toBe(true);
  
  // With space variations
  expect(isValidTime12Hr('9:00 AM')).toBe(true);
  expect(isValidTime12Hr('11:00 pm')).toBe(true); // with space instead of colon
  
  // Invalid times
  expect(isValidTime12Hr('13:00 PM')).toBe(false); // hour > 12
  expect(isValidTime12Hr('9:60 AM')).toBe(false); // invalid minutes
  expect(isValidTime12Hr('9 AM')).toBe(false); // missing minutes
});

/* isValidTime24Hr(timeStr) */
test('isValidTime24Hr', () => {
  // Valid times
  expect(isValidTime24Hr('9:00')).toBe(true);
  expect(isValidTime24Hr('00:00')).toBe(true); // midnight
  expect(isValidTime24Hr('23:59')).toBe(true);

  // Invalid times
  expect(isValidTime24Hr('24:00')).toBe(false); // hour > 23
  expect(isValidTime24Hr('25:00')).toBe(false);
  expect(isValidTime24Hr('9:60')).toBe(false); // invalid minutes
});

/* formatTime(date) */
test('formatTime', () => {
  // Standard conversions
  expect(formatTime(new Date(2024, 0, 15, 9, 0))).toBe('9:00 AM');
  expect(formatTime(new Date(2024, 0, 15, 14, 30))).toBe('2:30 PM');

  // Midnight and noon
  expect(formatTime(new Date(2024, 0, 15, 0, 0))).toBe('12:00 AM');
  expect(formatTime(new Date(2024, 0, 15, 12, 0))).toBe('12:00 PM');

  // Minute padding
  expect(formatTime(new Date(2024, 0, 15, 9, 5))).toBe('9:05 AM');

  // Invalid inputs
  expect(() => formatTime('invalid')).not.toThrow(); // Should handle gracefully
  expect(() => formatTime('')).not.toThrow(); // Should handle gracefully
});

/* convert24HrTo12Hr(timeStr) */
test('convert24HrTo12Hr', () => {
  // Standard conversions
  expect(convert24HrTo12Hr('9:00')).toBe('9:00 AM');
  expect(convert24HrTo12Hr('13:00')).toBe('1:00 PM');

  // Edge cases - midnight and noon
  expect(convert24HrTo12Hr('00:00')).toBe('12:00 AM'); // Midnight
  expect(convert24HrTo12Hr('12:00')).toBe('12:00 PM'); // Noon

  // Minutes preservation
  expect(convert24HrTo12Hr('9:5')).toBe('9:05 AM');
});
