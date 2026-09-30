import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CheckinBox } from '../../client/common/checkin-box';
import * as dom from '../../client/common/dom';

vi.mock('../../client/common/dom', () => ({
  qs: vi.fn(),
  setVisible: vi.fn(),
  setText: vi.fn(),
  setValue: vi.fn(),
  addEventListener: vi.fn(),
  valueOf: vi.fn(),
}));

vi.mock('../../client/common/checkin', () => ({
  saveCheckinTime: vi.fn(),
}));

describe('CheckinBox Component', () => {
  let mockTemplate;
  let mockStore;

  beforeEach(() => {
    vi.clearAllMocks();

    const frag = document.createDocumentFragment();
    const div = document.createElement('div');
    div.innerHTML = `
      <button class="checkin-btn"></button>
      <span class="checkin-box-label"></span>
      <div class="time">
        <span class="time-badge"><span class="time-value"></span></span>
        <div class="time-edit"><input/></div>
        <button class="save-btn"></button>
        <button class="delete-btn"></button>
        <button class="cancel-btn"></button>
      </div>
      <div class="spinner"></div>
    `;
    frag.append(div);

    mockTemplate = { content: frag };

    dom.qs.mockImplementation((selector) => {
      if (selector === 'template#checkin-box') return mockTemplate;
      return null;
    });

    mockStore = {
      getSignups: vi.fn().mockReturnValue([{ rowId: '1', studyIn1: '' }]),
      setSignups: vi.fn(),
    };
  });

  describe('Constructor', () => {
    it('initializes properties correctly', () => {
      const box = new CheckinBox('study-checkin', '1', '', mockStore, false);
      expect(box.type).toBe('study-checkin');
      expect(box.label).toBe('Study In');
      expect(box.buttonText).toBe('Check In');
      expect(box.propName).toBe('studyIn1');
    });
  });

  describe('State Rendering', () => {
    it('renders ready state', () => {
      const box = new CheckinBox('study-checkin', '1', '', mockStore, false);
      box.setComponentState('ready');
      expect(dom.setVisible).toHaveBeenCalledWith(box.checkinButton, true);
    });

    it('renders loading state', () => {
      const box = new CheckinBox('study-checkin', '1', '', mockStore, false);
      box.setComponentState('loading');
      expect(dom.setVisible).toHaveBeenCalledWith(box.spinner, true);
    });
  });

  describe('updateSignups', () => {
    it('updates signup property in store list', () => {
      const box = new CheckinBox('study-checkin', '1', '', mockStore, false);
      const updated = box.updateSignups('1', '10:00 AM');
      expect(updated[0].studyIn1).toBe('10:00 AM');
    });
  });
});
