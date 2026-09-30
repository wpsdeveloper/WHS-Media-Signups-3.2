import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initObservers, showAttendance, showSignupInfo } from '../../client/admin/settings-table';
import * as dom from '../../client/common/dom';
import { store } from '../../client/admin/admin-store';

vi.mock('../../client/common/dom', () => ({
  qs: vi.fn(),
  qsa: vi.fn().mockReturnValue([]),
  setVisible: vi.fn(),
}));

vi.mock('../../client/admin/admin-store', () => ({
  store: {
    subscribe: vi.fn(),
    getState: vi.fn(),
    setState: vi.fn(),
  },
}));

describe('Settings Table Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initObservers', () => {
    it('subscribes to settings updates', () => {
      initObservers();
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), ['settings']);
    });
  });

  describe('showAttendance & showSignupInfo', () => {
    it('adjusts panel transforms and header visibility', () => {
      const mockPanel = { style: {} };
      const signupInfo = {};
      const attendanceInfo = { getBoundingClientRect: () => ({ width: 550 }) };

      dom.qsa.mockReturnValue([mockPanel]);
      dom.qs.mockImplementation((selector) => {
        if (selector === '.header-row .signup-info') return signupInfo;
        if (selector === '.header-row .attendance-info') return attendanceInfo;
        return null;
      });

      showAttendance();
      expect(dom.setVisible).toHaveBeenCalledWith('.header-row .attendance-info', true);

      showSignupInfo();
      expect(dom.setVisible).toHaveBeenCalledWith('.header-row .signup-info', true);
    });
  });
});
