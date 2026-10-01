import { describe, it, expect, vi, beforeEach } from 'vitest';
import { studentInputChangeHandler, renderStudentDatalist } from '../../client/signup/student-input.js';
import * as dom from '../../client/common/dom.js';
import { store } from '../../client/signup/signup-store.js';

// Mock dependencies
vi.mock('../../client/common/dom.js', () => ({
  qs: vi.fn(),
  valueOf: vi.fn(() => ''),
  setVisible: vi.fn(),
  setValue: vi.fn(),
}));

vi.mock('../../client/signup/signup-store.js', () => ({
  store: { 
    setState: vi.fn(), 
    subscribe: vi.fn() 
  }
}));

/**
 * Test suite for the Student Input Module.
 * Tests input handling, datalist rendering, and observer setup for student search fields.
 */
describe('Student Input Module', () => {
  let mockInput;
  let mockList;
  let mockOption;

  /**
   * Runs before each test to clear mocks and set up DOM element mocks.
   */
  beforeEach(() => {
    vi.clearAllMocks();

    mockInput = { setAttribute: vi.fn() };
    mockList = { id: 'student-suggestions', replaceChildren: vi.fn() };
    mockOption = { value: '' };

    // Mock document.createElement to return controlled mock objects
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'datalist') return mockList;
      if (tag === 'option') return mockOption;
    });
    vi.spyOn(document.body, 'append').mockImplementation(() => {});
  });

  /**
   * Tests for the studentInputChangeHandler function.
   */
  describe('studentInputChangeHandler', () => {
    it('should update the store with the current student name query', () => {
      const mockEvent = { target: { value: 'Smi' } };
      dom.valueOf.mockReturnValue('Smi');
      studentInputChangeHandler(mockEvent);
      
      expect(store.setState).toHaveBeenCalledWith({ ui_currentStudentName: 'Smi' });
    });
  });

  /**
   * Tests for the renderStudentDatalist function.
   */
  describe('renderStudentDatalist', () => {
    it('should return early if the input element is not found', () => {
      dom.qs.mockReturnValue(null);
      renderStudentDatalist(['Smith, John'], 'Smi');
      
      expect(document.createElement).not.toHaveBeenCalled();
    });

    it('should create and append a datalist if one does not exist', () => {
      dom.qs.mockImplementation(selector => selector === '.student-autocomplete' ? mockInput : null);
      
      renderStudentDatalist([], 'Smi');
      
      expect(document.createElement).toHaveBeenCalledWith('datalist');
      expect(document.body.append).toHaveBeenCalledWith(mockList);
      expect(mockInput.setAttribute).toHaveBeenCalledWith('list', 'student-suggestions');
    });

    it('should clear suggestions if the query is missing or under 3 characters', () => {
      dom.qs.mockImplementation(selector => selector === '.student-autocomplete' ? mockInput : mockList);
      
      renderStudentDatalist(['Smith, John'], 'Sm');
      
      // If query is < 3 characters, suggestions are cleared via replaceChildren()
      expect(mockList.replaceChildren).toHaveBeenCalled();
    });

    it('should populate suggestions if the query is 3 or more characters', () => {
      dom.qs.mockImplementation(selector => selector === '.student-autocomplete' ? mockInput : mockList);
      
      renderStudentDatalist(['Smith, John'], 'Smi');
      
      expect(document.createElement).toHaveBeenCalledWith('option');
      expect(mockOption.value).toBe('Smith, John');
      expect(mockList.replaceChildren).toHaveBeenCalledWith(mockOption);
    });
  });

});