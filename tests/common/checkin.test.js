import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as checkin from '../../src/common/checkin.js';
import * as dom from '../../src/common/dom.js';
import * as dates from '../../src/common/dates.js';

vi.mock('../../src/common/dom.js', () => ({
  qs: vi.fn(),
  qsa: vi.fn(),
  setVisible: vi.fn(),
  setValue: vi.fn(),
  setText: vi.fn(),
}));

vi.mock('../../src/common/dates.js', () => ({
  formatTime: vi.fn((val) => `formatted-${val}`),
  isValidTime: vi.fn(),
}));

vi.mock('../../src/common/debug.js', () => ({
  DEBUG: false,
}));

describe('checkin.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.google = {
      script: {
        run: {
          withSuccessHandler: vi.fn().mockReturnThis(),
          withFailureHandler: vi.fn().mockReturnThis(),
          setCheckin: vi.fn(),
        },
      },
    };
  });

  describe('showEditCheckin', () => {
    it('shows the edit UI and hides other elements', () => {
      const mockButton = { closest: vi.fn().mockReturnValue({ dataset: { signupId: '123' } }) };
      checkin.showEditCheckin('mediaIn', mockButton);
      
      expect(dom.setVisible).toHaveBeenCalledWith(`.data-row[data-signup-id="123"] .media-checkin .time-edit`, true);
      expect(dom.setVisible).toHaveBeenCalledWith(`.data-row[data-signup-id="123"] .media-checkin button, .data-row[data-signup-id="123"] .media-checkin .primary-buttons, .data-row[data-signup-id="123"] .media-checkin .time-value`, false);
    });
  });

  describe('cancelEditCheckin', () => {
    it('cancels the edit UI and restores original elements', () => {
      const mockButton = { closest: vi.fn().mockReturnValue({ dataset: { signupId: '456' } }) };
      checkin.cancelEditCheckin('mediaOut', mockButton);
      
      expect(dom.setVisible).toHaveBeenCalledWith(`.data-row[data-signup-id="456"] .media-checkout .time-edit`, false);
      expect(dom.setVisible).toHaveBeenCalledWith(`.data-row[data-signup-id="456"] .media-checkout button`, false);
      expect(dom.setVisible).toHaveBeenCalledWith(`.data-row[data-signup-id="456"] .media-checkout .primary-buttons`, true);
    });
  });

  describe('formatCheckin', () => {
    it('formats an empty checkin value correctly', () => {
      checkin.formatCheckin('studyIn1', '789', '');
      const box = `.data-row[data-signup-id="789"] .study-checkin`;
      
      expect(dom.setVisible).toHaveBeenCalledWith(`${box} .spinner`, false);
      expect(dom.setVisible).toHaveBeenCalledWith(`${box} button`, true);
      expect(dom.setVisible).toHaveBeenCalledWith(`${box} .time`, false);
      expect(dom.setValue).toHaveBeenCalledWith(`${box} .timeInput`, '');
    });

    it('formats a populated checkin value correctly', () => {
      checkin.formatCheckin('studyIn1', '789', '14:00');
      const box = `.data-row[data-signup-id="789"] .study-checkin`;
      
      expect(dom.setVisible).toHaveBeenCalledWith(`${box} button`, false);
      expect(dom.setText).toHaveBeenCalledWith(`${box}.time-value`, 'formatted-14:00');
      expect(dom.setValue).toHaveBeenCalledWith(`${box} .timeInput`, 'formatted-14:00');
    });
  });

  describe('setCheckin', () => {
    it('calls google.script.run with the correct payload and handlers', () => {
      checkin.setCheckin('studyIn2', '111', '09:00');
      
      expect(global.google.script.run.withSuccessHandler).toHaveBeenCalledWith(checkin.checkinSuccess);
      expect(global.google.script.run.setCheckin).toHaveBeenCalledWith('studyIn2', '111', '09:00');
    });
  });
});