import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleIntTeacherAltInput, setupInterventionTeacherObserver } from '../../client/signup/interventions-teacher-select.js';
import * as dom from '../../client/common/dom.js';
import { store } from '../../client/signup/signup-store.js';

// Mock dependencies
vi.mock('../../client/common/dom.js', () => ({
  setVisible: vi.fn(),
}));

vi.mock('../../client/signup/signup-store.js', () => ({
  store: { subscribe: vi.fn() }
}));

/**
 * Test suite for the Interventions Teacher Select Module.
 * Contains tests for UI toggling and state observation logic.
 */
describe('Interventions Teacher Select Module', () => {
  beforeEach(() => {
    // Clear all mock history before each test to ensure test isolation
    vi.clearAllMocks();
  });

  /**
   * Tests for the toggleIntTeacherAltInput function.
   * This function determines whether to show a select dropdown or a text input
   * for intervention teachers based on the current period and available teachers.
   */
  describe('toggleIntTeacherAltInput', () => {
    it('should show text input and hide select when showAltInput is true', () => {
      toggleIntTeacherAltInput(true);
      
      expect(dom.setVisible).toHaveBeenCalledWith('#subject-int-select', false);
      expect(dom.setVisible).toHaveBeenCalledWith('#subject-int-input', true);
    });

    it('should show select dropdown and hide text input when showAltInput is false', () => {
      toggleIntTeacherAltInput(false);
      
      expect(dom.setVisible).toHaveBeenCalledWith('#subject-int-select', true);
      expect(dom.setVisible).toHaveBeenCalledWith('#subject-int-input', false);
    });
  });

  /**
   * Tests for the setupInterventionTeacherObserver function.
   * Ensures the observer is properly registered with the store and triggers
   * the appropriate UI updates when state changes.
   */
  describe('setupInterventionTeacherObserver', () => {
    it('should subscribe to the store with the correct dependency array', () => {
      setupInterventionTeacherObserver();
      
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['ui_currentScheduleBlock', 'ui_currentPeriod']
      );
    });

    it('should trigger the toggle function when store state updates', () => {
      setupInterventionTeacherObserver();
      
      // Extract the callback registered with the store
      const subscriberCallback = store.subscribe.mock.calls[0][0];
      
      // Fire the callback to ensure it interacts with the DOM properly
      // Wed. PM period triggers alt input
      subscriberCallback({ ui_currentScheduleBlock: { period: 'Wed. PM' }, ui_currentPeriod: 'Wed. PM' });
      
      expect(dom.setVisible).toHaveBeenCalledWith('#subject-int-input', true);
    });
  });
});