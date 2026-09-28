import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hideTypes, updateDetailsPanel, setupPanelsObserver } from '../../client/signup/panels.js';
import * as dom from '../../client/common/dom.js';
import { store } from '../../client/common/store.js';

// Mock dependencies
vi.mock('../../client/common/dom.js', () => ({
  setVisible: vi.fn(),
}));

vi.mock('../../client/common/store.js', () => ({
  store: { subscribe: vi.fn() }
}));

/**
 * Test suite for the Panels Module.
 * Contains tests for toggling the visibility of specific detail panels based on type.
 */
describe('Panels Module', () => {
  beforeEach(() => {
    // Clear all mock history to ensure test isolation
    vi.clearAllMocks();
  });

  /**
   * Tests for the hideTypes function.
   * Verifies that all type-specific panels are hidden.
   */
  describe('hideTypes', () => {
    it('should hide all type-specific detail panel containers', () => {
      hideTypes();
      
      const expectedSelectors = '.intervention-only, .assessment-only, .tutoring-only, .non-intervention-only, .alt-setting-only, .staff-reservation-only';
      expect(dom.setVisible).toHaveBeenCalledWith(expectedSelectors, false);
    });
  });

  /**
   * Tests for the updateDetailsPanel function.
   * Verifies that the correct panel is shown for a given currentType.
   */
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

  /**
   * Tests for the setupPanelsObserver function.
   * Ensures the observer triggers UI updates when the currentType changes.
   */
  describe('setupPanelsObserver', () => {
    it('should subscribe to the store looking for currentType changes', () => {
      setupPanelsObserver();
      
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['ui_currentType']
      );
    });

    it('should trigger updateDetailsPanel when the store state updates', () => {
      setupPanelsObserver();
      
      const subscriberCallback = store.subscribe.mock.calls[0][0];
      
      // Simulate state update
      subscriberCallback({ currentType: 'Assessment' });
      
      expect(dom.setVisible).toHaveBeenCalledWith('.assessment-only', true);
    });
  });
});