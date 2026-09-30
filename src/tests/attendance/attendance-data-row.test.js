import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendanceDataRow, makeDataRowViewModel } from '../../client/attendance/attendance-data-row';
import * as dom from '../../client/common/dom';

vi.mock('../../client/common/dom', () => ({
  qs: vi.fn(),
  setHTML: vi.fn(),
  setText: vi.fn(),
  setVisible: vi.fn(),
  setAttribute: vi.fn(),
}));

vi.mock('../../client/attendance/glass-rooms-status', () => ({
  getRoomBadge: vi.fn((room) => (room === '1' ? ' <span class="badge room-badge">Room 1</span>' : '')),
}));

vi.mock('../../client/common/checkin-box', () => ({
  CHECKIN_CONFIG: {
    study: { propName: 'studyIn1' },
    media: { propName: 'mediaIn' },
  },
  CheckinBox: class {
    constructor(type, rowId, timeValue, store, isEditor) {
      this.element = { isCheckinBox: true };
      this.render = vi.fn();
    }
  },
}));

describe('Attendance Data Row Module', () => {
  let mockElement;
  let mockTemplate;

  beforeEach(() => {
    vi.clearAllMocks();

    mockElement = {
      removeAttribute: vi.fn(),
      classList: { add: vi.fn() },
      querySelector: vi.fn().mockImplementation((sel) => {
        if (sel === '.edit-icons') {
          return {
            querySelector: vi.fn().mockReturnValue({}),
          };
        }
        if (sel === '.attendance-info') {
          return {
            querySelector: vi.fn().mockReturnValue({ innerHTML: '', append: vi.fn() }),
          };
        }
        return {};
      }),
    };

    mockTemplate = {
      content: {
        cloneNode: vi.fn().mockReturnValue({
          firstElementChild: mockElement,
        }),
      },
    };

    dom.qs.mockReturnValue(mockTemplate);
  });

  describe('AttendanceDataRow class', () => {
    it('uses student template by default', () => {
      const vm = { rowIsStaff: false, studentNameLabel: 'Doe, John', userIsEditor: false };
      new AttendanceDataRow(vm);
      expect(dom.qs).toHaveBeenCalledWith('#student-row-template');
    });

    it('uses staff template for staff reservation', () => {
      const vm = { rowIsStaff: true, studentNameLabel: 'Staff, Member', userIsEditor: false };
      new AttendanceDataRow(vm);
      expect(dom.qs).toHaveBeenCalledWith('#staff-row-template');
    });

    it('renders fields correctly', () => {
      const vm = {
        rowIsStaff: false,
        studentNameLabel: 'Doe, John',
        typeAndDetailsLabel: 'Intervention (Math)',
        teacherStudy: 'Mr. Smith',
        comments: 'None',
        userIsEditor: true,
        editUrl: 'http://example.com?id=1',
        studyIn1: '',
        mediaIn: '',
      };
      const row = new AttendanceDataRow(vm);
      row.render();

      expect(mockElement.removeAttribute).toHaveBeenCalledWith('id');
      expect(mockElement.classList.add).toHaveBeenCalledWith('data-row');
      expect(dom.setHTML).toHaveBeenCalled();
      expect(dom.setText).toHaveBeenCalled();
    });
  });

  describe('makeDataRowViewModel', () => {
    it('constructs view model correctly', () => {
      const signup = {
        type: 'Intervention',
        firstname: 'John',
        lastname: 'Doe',
        rowId: '123',
        teacherStudy: 'Mr. Smith',
        subject: 'Math',
        room: '1',
        email: 'test@example.com',
      };
      const state = { isEditor: true, appConfig: { scriptUrl: 'http://script.com' } };

      const vm = makeDataRowViewModel(signup, state);
      expect(vm.rowId).toBe('123');
      expect(vm.userIsEditor).toBe(true);
      expect(vm.editUrl).toContain('id=123');
      expect(vm.studentNameLabel).toContain('Doe, John');
      expect(vm.typeAndDetailsLabel).toBe('Intervention (Math)');
    });
  });
});
