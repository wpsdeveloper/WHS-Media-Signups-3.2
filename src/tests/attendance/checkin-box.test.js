import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CheckinBox } from '../../attendance/checkin-box.js';
import * as dom from '../../common/dom.js';
import * as checkin from '../../attendance/checkin.js';
import * as dates from '../../common/dates.js';
import { store } from '../../attendance/store.js';

vi.mock('../../common/dom.js');
vi.mock('../../attendance/checkin.js');
vi.mock('../../common/dates.js');
vi.mock('../../attendance/store.js');

describe('CheckinBox', () => {
  let mockTemplate;
  let mockElement;

  beforeEach(() => {
    vi.clearAllMocks();

    mockElement = {
      querySelector: vi.fn().mockReturnValue({}),
      append: vi.fn(),
    };

    mockTemplate = {
      content: {
        cloneNode: vi.fn().mockReturnValue(mockElement),
      },
    };

    dom.qs.mockImplementation((selector) => {
      if (selector === 'template#checkin-box') return mockTemplate;
      return null;
    });

    store.getState.mockReturnValue({ signups: [{ rowId: 1 }] });
  });

  describe('Initialization', () => {
    it('sets initial properties and binds events correctly', () => {
      const box = new CheckinBox(CheckinBox.TYPES.STUDY_CHECKIN, 1);
      
      expect(dom.qs).toHaveBeenCalledWith('template#checkin-box');
      expect(box.type).toBe('study-checkin');
      expect(box.label).toBe('Study In');
      expect(box.buttonText).toBe('Check In');
      expect(dom.addEventListener).toHaveBeenCalledTimes(5);
    });
  });

  describe('State Rendering', () => {
    let box;
    beforeEach(() => {
      box = new CheckinBox(CheckinBox.TYPES.STUDY_CHECKIN, 1);
    });

    it('renders the ready state', () => {
      box.setComponentState('ready');
      expect(dom.setVisible).toHaveBeenCalledWith(box.checkinButton, true);
      expect(dom.setVisible).toHaveBeenCalledWith(box.spinner, false);
    });

    it('renders the loading state', () => {
      box.setComponentState('loading');
      expect(dom.setVisible).toHaveBeenCalledWith(box.checkinButton, false);
      expect(dom.setVisible).toHaveBeenCalledWith(box.spinner, true);
    });

    it('renders the editing state', () => {
      box.timeValue = '10:00 AM';
      box.setComponentState('editing');
      expect(dom.setVisible).toHaveBeenCalledWith(box.timeDiv, true);
      expect(dom.setValue).toHaveBeenCalledWith(box.timeEditInput, '10:00 AM');
    });

    it('renders the hasData state', () => {
      box.timeValue = '11:00 AM';
      box.setComponentState('hasData');
      expect(dom.setText).toHaveBeenCalledWith(box.timeValueDiv, '11:00 AM');
      expect(dom.setVisible).toHaveBeenCalledWith(box.primaryButtonsDiv, true);
    });
  });

  describe('Event Handlers', () => {
    let box;
    beforeEach(() => {
      box = new CheckinBox(CheckinBox.TYPES.STUDY_CHECKIN, 1);
    });

    it('handles checkin click', async () => {
      dates.formatTime.mockReturnValue('12:00 PM');
      checkin.checkin.mockResolvedValue('12:00 PM');
      
      await box.handleCheckinClick();
      
      expect(box.state).toBe('hasData');
      expect(checkin.checkin).toHaveBeenCalledWith(box, '12:00 PM');
      expect(store.setState).toHaveBeenCalled();
    });

    it('handles edit start click', () => {
      box.handleEditStartClick();
      expect(box.state).toBe('editing');
      expect(dom.setTimeInputValue).toHaveBeenCalled();
    });

    it('handles edit save click with valid time', () => {
      dom.valueOf.mockReturnValue('13:00');
      dates.isValidTime24Hr.mockReturnValue(true);
      dates.convert24HrTo12Hr.mockReturnValue('1:00 PM');
      
      box.handleEditSaveClick();
      
      expect(box.state).toBe('hasData');
      expect(box.timeValue).toBe('1:00 PM');
      expect(checkin.checkin).toHaveBeenCalledWith(box, '1:00 PM');
    });

    it('rejects edit save click with invalid time', () => {
      dom.valueOf.mockReturnValue('invalid');
      dates.isValidTime24Hr.mockReturnValue(false);
      
      box.handleEditSaveClick();
      
      expect(mockElement.append).toHaveBeenCalled();
      expect(box.state).not.toBe('hasData');
    });

    it('handles cancel click', () => {
      box.timeValue = '10:00 AM';
      box.handleCancelClick();
      expect(box.state).toBe('hasData');

      box.timeValue = '';
      box.handleCancelClick();
      expect(box.state).toBe('ready');
    });
  });
});