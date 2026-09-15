import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleIntTeacherAltInput, setupInterventionTeacherObserver } from '../../src/signup/interventions-teacher-select.js';
import * as dom from '../../src/common/dom.js';
import { store } from '../../src/common/store.js';

// Mock dependencies
vi.mock('../../src/common/dom.js', () => ({
  setVisible: vi.fn(),
}));

vi.mock('../../src/common/store.js', () => ({
  store: { subscribe: vi.fn() }
}));

describe('Interventions Teacher Select Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toggleIntTeacherAltInput', () => {
    it('should show text input and hide select when period is "Wed. PM"', () => {
      toggleIntTeacherAltInput(['Teacher A'], 'Wed. PM');
      
      expect(dom.setVisible).toHaveBeenCalledWith('#subject-int-select', false);
      expect(dom.setVisible).toHaveBeenCalledWith('#subject-int-input', true);
    });

    it('should show text input when interventionTeachers is null or undefined', () => {
      toggleIntTeacherAltInput(null, '1');
      
      expect(dom.setVisible).toHaveBeenCalledWith('#subject-int-select', false);
      expect(dom.setVisible).toHaveBeenCalledWith('#subject-int-input', true);
    });

    it('should show text input when interventionTeachers array is empty', () => {
      toggleIntTeacherAltInput([], '2');
      
      expect(dom.setVisible).toHaveBeenCalledWith('#subject-int-select', false);
      expect(dom.setVisible).toHaveBeenCalledWith('#subject-int-input', true);
    });

    it('should show select dropdown when teachers are available and period is not Wed. PM', () => {
      toggleIntTeacherAltInput(['Teacher A', 'Teacher B'], '3');
      
      expect(dom.setVisible).toHaveBeenCalledWith('#subject-int-select', true);
      expect(dom.setVisible).toHaveBeenCalledWith('#subject-int-input', false);
    });
  });

  describe('setupInterventionTeacherObserver', () => {
    it('should subscribe to the store with the correct dependency array', () => {
      setupInterventionTeacherObserver();
      
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['interventionTeachers', 'currentPeriod']
      );
    });

    it('should trigger the toggle function when store state updates', () => {
      setupInterventionTeacherObserver();
      
      // Extract the callback registered with the store
      const subscriberCallback = store.subscribe.mock.calls[0][0];
      
      // Fire the callback to ensure it interacts with the DOM properly
      subscriberCallback({ interventionTeachers: [], currentPeriod: '1' });
      
      expect(dom.setVisible).toHaveBeenCalledWith('#subject-int-input', true);
    });
  });
});