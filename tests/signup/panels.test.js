import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hideTypes, updateDetailsPanel, setupPanelsObserver } from '../../src/signup/panels.js';
import * as dom from '../../src/common/dom.js';
import { store } from '../../src/signup/store.js';

// Mock dependencies
vi.mock('../../src/common/dom.js', () => ({
  setVisible: vi.fn(),
}));

vi.mock('../../src/signup/store.js', () => ({
  store: { subscribe: vi.fn() }
}));

describe('Panels Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hideTypes', () => {
    it('should hide all type-specific detail panel containers', () => {
      hideTypes();
      
      const expectedSelectors = '.intervention-only, .assessment-only, .tutoring-only, .non-intervention-only, .alt-setting-only, .staff-reservation-only';
      expect(dom.setVisible).toHaveBeenCalledWith(expectedSelectors, false);
    });
  });

  describe('updateDetailsPanel', () => {
    it('should hide all types first', () => {
      updateDetailsPanel('Intervention');
      const expectedSelectors = '.intervention-only, .assessment-only, .tutoring-only, .non-intervention-only, .alt-setting-only, .staff-reservation-only';
      expect(dom.setVisible).toHaveBeenCalledWith(expectedSelectors, false);
    });

    it('should return early and not show any panel if currentType is falsy', () => {
      updateDetailsPanel(null);
      
      // Should be called once from hideTypes, but not a second time to show anything
      expect(dom.setVisible).toHaveBeenCalledTimes(1); 
    });

    it('should show the correct panel for a valid currentType', () => {
      updateDetailsPanel('Tutoring');
      
      expect(dom.setVisible).toHaveBeenCalledWith('.tutoring-only', true);
    });

    it('should not attempt to show a panel if the currentType is not in the map', () => {
      updateDetailsPanel('Unknown Type');
      
      // Should be called once from hideTypes, but not a second time to show anything
      expect(dom.setVisible).toHaveBeenCalledTimes(1);
    });
  });

  describe('setupPanelsObserver', () => {
    it('should subscribe to the store looking for currentType changes', () => {
      setupPanelsObserver();
      
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['currentType']
      );
    });

    it('should trigger updateDetailsPanel when the store state updates', () => {
      setupPanelsObserver();
      
      const subscriberCallback = store.subscribe.mock.calls[0][0];
      
      subscriberCallback({ currentType: 'Assessment' });
      
      expect(dom.setVisible).toHaveBeenCalledWith('.assessment-only', true);
    });
  });
});