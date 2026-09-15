import { describe, it, expect, vi, beforeEach } from 'vitest';
import { studentInputChangeHandler, renderStudentDatalist, setupStudentInputObserver } from '../../src/signup/student-input.js';
import * as dom from '../../src/common/dom.js';
import { store } from '../../src/signup/store.js';

// Mock dependencies
vi.mock('../../src/common/dom.js', () => ({
  qs: vi.fn(),
}));

vi.mock('../../src/signup/store.js', () => ({
  store: { 
    setState: vi.fn(), 
    subscribe: vi.fn() 
  }
}));

describe('Student Input Module', () => {
  let mockInput;
  let mockList;
  let mockOption;

  beforeEach(() => {
    vi.clearAllMocks();

    mockInput = { setAttribute: vi.fn() };
    mockList = { id: 'student-suggestions', replaceChildren: vi.fn() };
    mockOption = { value: '' };

    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'datalist') return mockList;
      if (tag === 'option') return mockOption;
    });
    vi.spyOn(document.body, 'append').mockImplementation(() => {});
  });

  describe('studentInputChangeHandler', () => {
    it('should update the store with the current student name query', () => {
      const mockEvent = { target: { value: 'Smi' } };
      
      studentInputChangeHandler(mockEvent);
      
      expect(store.setState).toHaveBeenCalledWith({ currentStudentName: 'Smi' });
    });
  });

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
      
      expect(mockList.replaceChildren).toHaveBeenCalledWith(); // Called with no args
    });

    it('should populate suggestions if the query is 3 or more characters', () => {
      dom.qs.mockImplementation(selector => selector === '.student-autocomplete' ? mockInput : mockList);
      
      renderStudentDatalist(['Smith, John'], 'Smi');
      
      expect(document.createElement).toHaveBeenCalledWith('option');
      expect(mockOption.value).toBe('Smith, John');
      expect(mockList.replaceChildren).toHaveBeenCalledWith(mockOption);
    });
  });

  describe('setupStudentInputObserver', () => {
    it('should subscribe to the store looking for studentNames and currentStudentName', () => {
      setupStudentInputObserver();
      
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['studentNames', 'currentStudentName']
      );
    });

    it('should trigger renderStudentDatalist when store state updates', () => {
      setupStudentInputObserver();
      const subscriberCallback = store.subscribe.mock.calls[0][0];

      dom.qs.mockImplementation(selector => selector === '.student-autocomplete' ? mockInput : mockList);
      
      subscriberCallback({ studentNames: ['Doe, Jane'], currentStudentName: 'Doe' });
      
      expect(mockList.replaceChildren).toHaveBeenCalled();
    });
  });
});