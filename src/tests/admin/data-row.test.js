import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataRow } from '../../client/admin/data-row.js';
import * as dom from '../../client/common/dom.js';
import * as dates from '../../client/common/dates.ts';
import { store } from '../../client/common/store.js';
import { CheckinBox } from '../../client/common/checkin-box.js';

vi.mock('../../client/common/dom.js', () => ({
  qs: vi.fn(),
  setAttribute: vi.fn(),
  setVisible: vi.fn(),
  setHTML: vi.fn(),
  setText: vi.fn(),
}));

vi.mock('../../client/common/dates.ts', () => ({
  formatDateSlashes: vi.fn(() => '10/24/2026'),
}));

vi.mock('../../client/common/store.js', () => ({
  store: {
    getState: vi.fn(() => ({ isEditor: false })),
  },
}));

vi.mock('../../client/common/checkin-box.js', () => {
  const MockCheckinBox = vi.fn().mockImplementation(() => ({
    element: document.createElement('div'),
    render: vi.fn(),
  }));
  MockCheckinBox.CHECKIN_TYPES = ['checkin', 'checkout'];
  return { CheckinBox: MockCheckinBox };
});

describe('DataRow', () => {
  let mockTemplate;
  let mockSignup;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSignup = {
      rowId: 'row-123',
      type: 'Intervention',
      subject: 'Math',
      date: '2026-10-24',
      period: '1',
      teacherStudy: 'Mr. Smith',
      comments: 'Needs help with Algebra',
      room: '101',
      email: 'student@example.com',
    };

    mockTemplate = document.createElement('template');
    mockTemplate.innerHTML = `
      <div id="template-root">
        <div class="attendance-info">
          <div data-type="checkin"></div>
          <div data-type="checkout"></div>
        </div>
        <div class="details-info"></div>
        <div class="signup-date"></div>
        <div class="signup-period"></div>
        <div class="edit-icons">
          <a class="edit-link" href="https://example.com/edit?foo=bar">Edit</a>
        </div>
        <div class="type"></div>
        <div class="study-teacher"></div>
        <div class="comments"></div>
        <div class="room"></div>
      </div>
    `;

    vi.mocked(dom.qs).mockReturnValue(mockTemplate);
  });

  describe('Constructor', () => {
    it('selects student template for non-staff reservations', () => {
      new DataRow('row-123', mockSignup);
      expect(dom.qs).toHaveBeenCalledWith('#student-row-template');
    });

    it('selects staff template for staff reservations', () => {
      const staffSignup = { ...mockSignup, type: 'Staff reservation' };
      new DataRow('row-123', staffSignup);
      expect(dom.qs).toHaveBeenCalledWith('#staff-row-template');
    });

    it('initializes element, removes template id, and sets data attribute', () => {
      const row = new DataRow('row-123', mockSignup);
      expect(row.element.hasAttribute('id')).toBe(false);
      expect(row.element.classList.contains('data-row')).toBe(true);
      expect(dom.setAttribute).toHaveBeenCalledWith(row.element, 'dataset.signupId', 'row-123');
    });
  });

  describe('render', () => {
    it('calls renderAttendance when state is "attendance"', () => {
      const row = new DataRow('row-123', mockSignup);
      const spy = vi.spyOn(row, 'renderAttendance');
      row.state = 'attendance';
      row.render();
      expect(spy).toHaveBeenCalledOnce();
    });

    it('calls renderDetails when state is "details"', () => {
      const row = new DataRow('row-123', mockSignup);
      const spy = vi.spyOn(row, 'renderDetails');
      row.state = 'details';
      row.render();
      expect(spy).toHaveBeenCalledOnce();
    });

    it('logs error when state is unknown', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const row = new DataRow('row-123', mockSignup);
      row.state = 'unknown';
      row.render();
      expect(consoleSpy).toHaveBeenCalledWith('Unknown dataRow state: ', 'unknown');
    });
  });

  describe('renderAttendance & renderDetails', () => {
    it('toggles visibility correctly for attendance view', () => {
      const row = new DataRow('row-123', mockSignup);
      row.renderAttendance();
      expect(dom.setVisible).toHaveBeenCalledWith(row.attendancePanel, true);
      expect(dom.setVisible).toHaveBeenCalledWith(row.detailsPanel, false);
    });

    it('toggles visibility correctly for details view', () => {
      const row = new DataRow('row-123', mockSignup);
      row.renderDetails();
      expect(dom.setVisible).toHaveBeenCalledWith(row.attendancePanel, false);
      expect(dom.setVisible).toHaveBeenCalledWith(row.detailsPanel, true);
    });
  });

  describe('populate', () => {
    it('populates formatted date and standard period', () => {
      const row = new DataRow('row-123', mockSignup);
      row.populate();
      expect(dates.formatDateSlashes).toHaveBeenCalled();
      expect(dom.setHTML).toHaveBeenCalledWith(expect.anything(), 'Period 1');
    });

    it('formats special period "Wed. PM Int." without "Period " prefix', () => {
      const row = new DataRow('row-123', { ...mockSignup, period: 'Wed. PM Int.' });
      row.populate();
      expect(dom.setHTML).toHaveBeenCalledWith(expect.anything(), 'Wed. PM Int.');
    });

    it('updates edit link URL when user is an editor', () => {
      vi.mocked(store.getState).mockReturnValue({ isEditor: true });
      const row = new DataRow('row-123', mockSignup);
      row.populate();
      expect(dom.setAttribute).toHaveBeenCalledWith(
        expect.anything(),
        'href',
        'https://example.com/edit?foo=bar&id=row-123'
      );
    });

    it('populates study teacher, comments, and room information correctly', () => {
      const row = new DataRow('row-123', mockSignup);
      row.populate();

      expect(dom.setText).toHaveBeenCalledWith(expect.anything(), 'Mr. Smith');
      expect(dom.setText).toHaveBeenCalledWith(expect.anything(), 'Needs help with Algebra');
      expect(dom.setText).toHaveBeenCalledWith(
        expect.anything(),
        'Glass Room 101, reserved by student@example.com'
      );
    });

    it('handles empty room string gracefully', () => {
      const row = new DataRow('row-123', { ...mockSignup, room: '' });
      row.populate();
      expect(dom.setText).toHaveBeenCalledWith(expect.anything(), '');
    });

    describe('Signup Type Labels', () => {
      const testCases = [
        [{ type: 'Intervention', subject: 'Math' }, 'Intervention: Math'],
        [{ type: 'Tutoring', subject: 'Bio' }, 'NHS Tutoring: Bio'],
        [{ type: 'Assessment', teacherAcad: 'Ms. Lee' }, 'Assessment Makeup: Ms. Lee'],
        [{ type: 'Alt setting', teacherAcad: 'Ms. Lee' }, 'Alt Setting for Ms. Lee'],
        [{ type: 'Non-intervention', purpose: 'Study', teacherAcad: 'Mr. Davis' }, 'Non-Intervention (Study/Mr. Davis)'],
        [{ type: 'Staff reservation' }, 'Staff reservation'],
      ];

      testCases.forEach(([signupData, expectedLabel]) => {
        it(`formats label correctly for ${signupData.type}`, () => {
          const row = new DataRow('row-123', { ...mockSignup, ...signupData });
          row.populate();
          expect(dom.setText).toHaveBeenCalledWith(expect.anything(), expectedLabel);
        });
      });

      it('handles unknown signup type with warning log', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const row = new DataRow('row-123', { ...mockSignup, type: 'CustomType' });
        row.populate();
        expect(consoleSpy).toHaveBeenCalledWith('Unknown signup type:', 'CustomType');
        expect(dom.setText).toHaveBeenCalledWith(expect.anything(), 'CustomType');
      });
    });
  });

  describe('mountCheckinBoxes', () => {
    it('creates and mounts CheckinBox instances into attendance panels', () => {
      const row = new DataRow('row-123', mockSignup);
      row.mountCheckinBoxes();
      expect(CheckinBox).toHaveBeenCalledTimes(2);
      expect(CheckinBox).toHaveBeenCalledWith('checkin', 'row-123');
      expect(CheckinBox).toHaveBeenCalledWith('checkout', 'row-123');
    });

    it('bails out early if attendancePanel is missing', () => {
      const row = new DataRow('row-123', mockSignup);
      row.attendancePanel = null;
      row.mountCheckinBoxes();
      expect(CheckinBox).not.toHaveBeenCalled();
    });
  });
});