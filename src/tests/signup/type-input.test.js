import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  typeChangeHandler, 
  resetAllTypes, 
  disableInterventions, 
  disableAssessmentMakeups, 
  disableAltSetting, 
  disableTutoring, 
  disableWednesdayInterventions, 
  disableNonInterventions,
  toggleInterventionsLink,
  toggleTutoringLink,
  setupTypeInputObserver 
} from '../../client/signup/type-input.js';
import * as dom from '../../client/common/dom.js';
import { store } from '../../client/common/store.js';

// Mock dependencies
vi.mock('../../client/common/dom.js', () => ({
  setDisabled: vi.fn(),
  setVisible: vi.fn(),
  setChecked: vi.fn(),
  setText: vi.fn(),
  getAttribute: vi.fn(),
  qs: vi.fn(),
}));

vi.mock('../../client/common/store.js', () => ({
  store: { 
    setState: vi.fn(),
    subscribe: vi.fn() 
  }
}));

describe('Type Input Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('typeChangeHandler', () => {
    it('should update store state with the selected type', () => {
      const mockEvent = { target: { value: 'Tutoring' } };
      typeChangeHandler(mockEvent);
      expect(store.setState).toHaveBeenCalledWith({ currentType: 'Tutoring' });
    });
  });

  describe('UI Reset and Disable Utilities', () => {
    it('resetAllTypes should re-enable inputs and hide warnings', () => {
      resetAllTypes();
      expect(dom.setDisabled).toHaveBeenCalledWith("input[name='signup-type'], input[name='purpose']", false);
      expect(dom.setVisible).toHaveBeenCalledWith('span.type-warning', false);
    });

    it('disableInterventions should disable input, uncheck, and show warning', () => {
      disableInterventions();
      expect(dom.setDisabled).toHaveBeenCalledWith('input#intervention', true);
      expect(dom.setChecked).toHaveBeenCalledWith('input#intervention', false);
      expect(dom.setVisible).toHaveBeenCalledWith("label[for='intervention'] span.type-warning", true);
      expect(dom.setText).toHaveBeenCalledWith("label[for='intervention'] span.type-warning", 'Not available');
    });

    it('disableNonInterventions should disable multiple inputs and show warnings', () => {
      disableNonInterventions();
      expect(dom.setDisabled).toHaveBeenCalledWith('input#non-intervention', true);
      expect(dom.setDisabled).toHaveBeenCalledWith("input[name='purpose']", true);
      expect(dom.setVisible).toHaveBeenCalledWith("label[for='purpose'] span.type-warning", true);
    });

    // Validating the remaining single-input disablers follow the same pattern
    const disableFunctions = [
      { func: disableAssessmentMakeups, selector: 'assessment' },
      { func: disableAltSetting, selector: 'alt-setting' },
      { func: disableTutoring, selector: 'tutoring' },
      { func: disableWednesdayInterventions, selector: 'non-intervention' }
    ];

    disableFunctions.forEach(({ func, selector }) => {
      it(`${func.name} should disable ${selector} correctly`, () => {
        func();
        expect(dom.setDisabled).toHaveBeenCalledWith(`input#${selector}`, true);
        expect(dom.setChecked).toHaveBeenCalledWith(`input#${selector}`, false);
      });
    });
  });

  describe('Link Toggles', () => {
    it('toggleInterventionsLink should set visibility based on href length', () => {
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

  describe('setupTypeInputObserver', () => {
    it('should subscribe to currentType and check the corresponding radio button', () => {
      setupTypeInputObserver();
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['currentType']
      );

      const subscriberCallback = store.subscribe.mock.calls[0][0];
      
      const mockRadio = {};
      dom.qs.mockReturnValue(mockRadio);
      
      subscriberCallback({ currentType: 'Assessment' });
      
      expect(dom.qs).toHaveBeenCalledWith("input[name='signup-type'][value='Assessment']");
      expect(dom.setChecked).toHaveBeenCalledWith(mockRadio, true);
    });

    it('should not throw if currentType is null or radio is missing', () => {
      setupTypeInputObserver();
      const subscriberCallback = store.subscribe.mock.calls[0][0];

      dom.qs.mockReturnValue(null);
      
      expect(() => subscriberCallback({ currentType: null })).not.toThrow();
      expect(() => subscriberCallback({ currentType: 'Unknown' })).not.toThrow();
    });
  });
});