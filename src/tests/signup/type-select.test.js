import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  typeChangeHandler, 
  resetAllTypes, 
  toggleInterventions, 
  toggleAssessmentMakeups, 
  toggleAltSetting, 
  toggleTutoring, 
  toggleNonInterventions,
  toggleInterventionsLink,
  toggleTutoringLink,
  setupTypeInputObserver 
} from '../../client/signup/type-select';
import * as dom from '../../client/common/dom';
import { store } from '../../client/signup/signup-store';

// Mock dependencies
/**
 * Mocks DOM elements and manipulations.
 */
vi.mock('../../client/common/dom', () => ({
  setDisabled: vi.fn(),
  setVisible: vi.fn(),
  setChecked: vi.fn(),
  setText: vi.fn(),
  getAttribute: vi.fn(),
  setValue: vi.fn(),
  qs: vi.fn(),
}));

/**
 * Mocks the central state management store.
 */
vi.mock('../../client/signup/signup-store', () => ({
  store: { 
    setState: vi.fn(),
    subscribe: vi.fn() 
  }
}));

describe('Type Input Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Tests for the type selection change handler.
   */
  describe('typeChangeHandler', () => {
    it('should update store state with the selected type', () => {
      // Simulates user clicking a different signup type radio button
      const mockEvent = { target: { value: 'Tutoring' } };
      typeChangeHandler(mockEvent);
      expect(store.setState).toHaveBeenCalledWith({ ui_currentType: 'Tutoring' });
    });
  });

  /**
   * Tests for UI reset and dynamic disabling utilities for signup types.
   */
  describe('UI Reset and Disable Utilities', () => {
    it('toggleInterventions should disable Interventions option', () => {
      toggleInterventions(false);
      expect(dom.setDisabled).toHaveBeenCalledWith('#type-select option[value="Intervention"]', true);
    });

    it('toggleInterventions should enable Interventions option', () => {
      toggleInterventions(true);
      expect(dom.setDisabled).toHaveBeenCalledWith('#type-select option[value="Intervention"]', false);
    });

    // Validating the remaining single-input disablers follow the same pattern
    const toggleFunctions = [
      { func: toggleInterventions, selectorVal: 'Intervention' },
      { func: toggleAssessmentMakeups, selectorVal: 'Assessment' },
      { func: toggleAltSetting, selectorVal: 'Alt setting' },
      { func: toggleTutoring, selectorVal: 'Tutoring' },
      { func: toggleNonInterventions, selectorVal: 'Non-intervention' },
    ];

    toggleFunctions.forEach(({ func, selectorVal }) => {
      it(`${func.name} should toggle ${selectorVal} correctly`, () => {
        func(true);
        expect(dom.setDisabled).toHaveBeenCalledWith(`#type-select option[value="${selectorVal}"]`, false);
        func(false);
        expect(dom.setDisabled).toHaveBeenCalledWith(`#type-select option[value="${selectorVal}"]`, true);
      });
    });
  });

  /**
   * Tests for toggling visibility of help links based on their href attributes.
   */
  describe('Link Toggles', () => {
    it('toggleInterventionsLink should set visibility based on href length', () => {
      // Long URLs indicate a valid link is present, short URLs indicate missing or placeholder links
      dom.getAttribute.mockReturnValue('https://example.com/very/long/url/that/exceeds/the/fifty-eight/char/limit');
      toggleInterventionsLink();
      expect(dom.getAttribute).toHaveBeenCalledWith('.int-link', 'href');
      expect(dom.setVisible).toHaveBeenCalledWith('.int-link', true);

      dom.getAttribute.mockReturnValue('short-url');
      toggleInterventionsLink();
      expect(dom.setVisible).toHaveBeenCalledWith('.int-link', false);
    });

    it('toggleTutoringLink should evaluate href and set visibility', () => {
      // NOTE: Passing a selector to match source code, assuming the bug mentioned below gets fixed.
      dom.getAttribute.mockReturnValue('short-url');
      toggleTutoringLink();
      expect(dom.setVisible).toHaveBeenCalledWith('.tut-link', false);
    });
  });

  /**
   * Tests for the store observer that syncs the UI radio buttons with state.
   */
  describe('setupTypeInputObserver', () => {
    it('should subscribe to currentType and check the corresponding radio button', () => {
      setupTypeInputObserver();
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['ui_currentType']
      );

      const subscriberCallback = store.subscribe.mock.calls[0][0];
      
      const mockRadio = {};
      dom.qs.mockReturnValue(mockRadio);
      
      subscriberCallback({ ui_currentType: 'Assessment' });
      
      expect(dom.qs).toHaveBeenCalledWith("#type-select");
      expect(dom.setValue).toHaveBeenCalledWith("#type-select", 'Assessment');
    });

    it('should not throw if currentType is null or radio is missing', () => {
      setupTypeInputObserver();
      const subscriberCallback = store.subscribe.mock.calls[0][0];

      // Missing radio button from DOM should be handled gracefully
      dom.qs.mockReturnValue(null);
      
      expect(() => subscriberCallback({ currentType: null })).not.toThrow();
      expect(() => subscriberCallback({ currentType: 'Unknown' })).not.toThrow();
    });
  });
});