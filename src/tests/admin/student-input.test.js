import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clearStudentInput, studentInputChangeHandler, renderStudentDatalist, setupStudentInputObserver } from '../../client/admin/student-input';
import * as dom from '../../client/common/dom';
import { store } from '../../client/admin/admin-store';

vi.mock('../../client/common/dom', () => ({
  qs: vi.fn(),
  valueOf: vi.fn(),
  setVisible: vi.fn(),
}));

vi.mock('../../client/admin/admin-store', () => ({
  store: {
    setState: vi.fn(),
    subscribe: vi.fn(),
    getState: vi.fn().mockReturnValue({ students: [] }),
  },
}));

describe('Admin Student Input Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('clearStudentInput', () => {
    it('resets input value and clears store', () => {
      const mockInput = { value: 'test', focus: vi.fn(), setAttribute: vi.fn() };
      const mockHelper = { style: {}, classList: { remove: vi.fn(), add: vi.fn() } };
      const mockList = { replaceChildren: vi.fn(), id: 'student-suggestions' };

      dom.qs.mockImplementation((selector) => {
        if (selector === '#student-search-helper') return mockHelper;
        if (selector === '.student-autocomplete') return mockInput;
        if (selector === '#student-suggestions') return mockList;
        return null;
      });

      clearStudentInput();
      expect(mockInput.value).toBe('');
      expect(store.setState).toHaveBeenCalledWith({ ui_currentStudentName: '', ui_requestedStudentEmail: '' });
    });
  });

  describe('renderStudentDatalist', () => {
    it('renders datalist options when query length is >= 2', () => {
      const mockInput = { setAttribute: vi.fn() };
      const mockList = { replaceChildren: vi.fn(), id: 'student-suggestions' };
      dom.qs.mockImplementation((selector) => {
        if (selector === '.student-autocomplete') return mockInput;
        if (selector === '#student-suggestions') return mockList;
        return null;
      });

      renderStudentDatalist(['Doe, John <john@example.com>'], 'john');
      expect(mockList.replaceChildren).toHaveBeenCalled();
    });
  });

  describe('setupStudentInputObserver', () => {
    it('subscribes to studentNames and ui_currentStudentName', () => {
      setupStudentInputObserver();
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), ['studentNames', 'ui_currentStudentName']);
    });
  });
});
