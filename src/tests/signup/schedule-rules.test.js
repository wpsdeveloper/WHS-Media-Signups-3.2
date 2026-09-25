import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateScheduleRules, setupScheduleRulesObserver } from '../../client/signup/schedule-rules.js';
import * as dates from '../../client/common/dates.ts';
import { store } from '../../client/common/store.js';
import * as typeInput from '../../client/signup/type-input.js';

// Mock dependencies
vi.mock('../../client/common/dates.ts', () => ({
  parseDateInput: vi.fn(d => new Date(d)),
  isSameDate: vi.fn((d1, d2) => d1.toDateString() === d2.toDateString()),
}));

vi.mock('../../client/common/store.js', () => ({
  store: { 
    subscribe: vi.fn(),
    setState: vi.fn()
  }
}));

vi.mock('../../client/signup/type-input.js', () => ({
  resetAllTypes: vi.fn(),
  disableInterventions: vi.fn(),
  disableAssessmentMakeups: vi.fn(),
  disableAltSetting: vi.fn(),
  disableTutoring: vi.fn(),
  disableWednesdayInterventions: vi.fn(),
  disableNonInterventions: vi.fn(),
}));

describe('Schedule Rules Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('evaluateScheduleRules', () => {
    it('should reset all types and return null if date or period is missing', () => {
      const result = evaluateScheduleRules(null, '1', []);
      expect(typeInput.resetAllTypes).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should disable Wednesday interventions and return null if no schedule matches', () => {
      const result = evaluateScheduleRules('2023-10-04', 'Wed. PM', []);
      expect(typeInput.disableWednesdayInterventions).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null if matching schedule has no specials for the period', () => {
      const schedules = [{
        date: '2023-10-02',
        specials: { '2': {} }
      }];
      
      const result = evaluateScheduleRules('2023-10-02', '1', schedules);
      expect(result).toBeNull();
    });

    it('should evaluate special rules and disable appropriate types based on string length > 0', () => {
      const schedules = [{
        date: '2023-10-02',
        specials: {
          '1': {
            allowInterventions: 'No',
            allowAssessmentMakeups: 'Not allowed',
            allowAltSetting: 'Nope',
            allowTutoring: 'Nah',
            allowNonInterventions: 'No way',
            max: '5'
          }
        }
      }];

      const result = evaluateScheduleRules('2023-10-02', '1', schedules);

      expect(typeInput.disableInterventions).toHaveBeenCalled();
      expect(typeInput.disableAssessmentMakeups).toHaveBeenCalled();
      expect(typeInput.disableAltSetting).toHaveBeenCalled();
      expect(typeInput.disableTutoring).toHaveBeenCalled();
      expect(typeInput.disableNonInterventions).toHaveBeenCalled();
      expect(result).toBe(5);
    });

    it('should not disable types if special rule strings are empty', () => {
        const schedules = [{
          date: '2023-10-02',
          specials: {
            '1': {
              allowInterventions: '',
              allowAssessmentMakeups: '',
              allowAltSetting: '',
              allowTutoring: '',
              allowNonInterventions: ''
            }
          }
        }];
  
        const result = evaluateScheduleRules('2023-10-02', '1', schedules);
  
        expect(typeInput.disableInterventions).not.toHaveBeenCalled();
        expect(result).toBe(0);
      });
  });

  describe('setupScheduleRulesObserver', () => {
    it('should subscribe to the store with the correct dependencies', () => {
      setupScheduleRulesObserver();
      expect(store.subscribe).toHaveBeenCalledWith(
        expect.any(Function), 
        ['ui_currentDate', 'ui_currentPeriod', 'dailySchedules']
      );
    });

    it('should update currentMax with specialMax if greater than 0', () => {
      setupScheduleRulesObserver();
      const subscriberCallback = store.subscribe.mock.calls[0][0];

      // Setup evaluateScheduleRules to return a special max via schedule mock
      dates.isSameDate.mockReturnValue(true);
      const mockState = {
        currentDate: '2023-10-02',
        currentPeriod: '1',
        dailySchedules: [{ date: '2023-10-02', specials: { '1': { allowInterventions: '', max: '10' } } }],
        currentMax: 15,
        defaultMax: 15
      };

      subscriberCallback(mockState);
      
      expect(store.setState).toHaveBeenCalledWith({ currentMax: 10 });
    });

    it('should update currentMax with defaultMax if specialMax is 0 or null', () => {
        setupScheduleRulesObserver();
        const subscriberCallback = store.subscribe.mock.calls[0][0];
  
        const mockState = {
          currentDate: '2023-10-02',
          currentPeriod: '1',
          dailySchedules: [],
          currentMax: 10,
          defaultMax: 15
        };
  
        subscriberCallback(mockState);
        
        expect(store.setState).toHaveBeenCalledWith({ currentMax: 15 });
      });
  });
});