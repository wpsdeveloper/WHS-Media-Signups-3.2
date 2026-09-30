import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setPanelView, panelViewListener, initObservers } from '../../client/attendance/attendance-panels';
import * as dom from '../../client/common/dom';
import { store } from '../../client/attendance/attendance-store';

vi.mock('../../client/common/dom', () => ({
  setVisible: vi.fn(),
  qsa: vi.fn().mockReturnValue([]),
  qs: vi.fn().mockReturnValue({ classList: { add: vi.fn() } }),
}));

vi.mock('../../client/attendance/attendance-store', () => ({
  store: {
    subscribe: vi.fn(),
    setState: vi.fn(),
  },
}));

describe('Attendance Panels Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setPanelView', () => {
    it('sets attendance panel view correctly', () => {
      setPanelView('attendance');
      expect(dom.setVisible).toHaveBeenCalledWith('.slider-wrapper', true);
      expect(dom.setVisible).toHaveBeenCalledWith('.panel', false);
      expect(dom.setVisible).toHaveBeenCalledWith('.attendance-info', true);
    });

    it('sets list panel view correctly with slider hidden', () => {
      setPanelView('list');
      expect(dom.setVisible).toHaveBeenCalledWith('.slider-wrapper', false);
    });
  });

  describe('panelViewListener', () => {
    it('updates store with new panel view', () => {
      panelViewListener('details');
      expect(store.setState).toHaveBeenCalledWith({ ui_currentView: 'details' });
    });
  });

  describe('initObservers', () => {
    it('subscribes to ui_currentView changes', () => {
      initObservers();
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), ['ui_currentView']);
    });
  });
});
