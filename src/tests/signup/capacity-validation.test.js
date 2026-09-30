import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCapacityStatus, preventSignupForNoFly, setupCapacityValidationObserver } from '../../client/signup/capacity-validation';
import * as dom from '../../client/common/dom';
import { store } from '../../client/signup/signup-store';

vi.mock('../../client/common/dom', () => ({
  setDisabled: vi.fn(),
  setChecked: vi.fn(),
  setVisible: vi.fn(),
  setText: vi.fn(),
}));

vi.mock('../../client/signup/signup-store', () => ({
  store: { subscribe: vi.fn(), getState: vi.fn() }
}));

describe('Capacity Validation Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCapacityStatus', () => {
    it('should return default not full if no schedule block', () => {
      const status = getCapacityStatus(null, [], 10);
      expect(status.isFull).toBe(false);
    });

    it('should calculate isFull based on matching signups count', () => {
      const block = { date: new Date('2023-10-01'), period: '1' };
      const signups = [
        { date: '2023-10-01', period: '1', type: 'Tutoring' },
        { date: '2023-10-01', period: '1', type: 'Non-intervention' }
      ];
      
      const status = getCapacityStatus(block, signups, 2);
      expect(status.isFull).toBe(true);
      expect(status.count).toBe(2);
    });
  });

  describe('preventSignupForNoFly', () => {
    it('should disable non-intervention if user is on no-fly list', () => {
      store.getState.mockReturnValue({ students: [{ email: 'bad@test.com', noFly: true }] });
      preventSignupForNoFly('bad@test.com');
      expect(dom.setDisabled).toHaveBeenCalledWith('input#non-intervention', true);
    });
  });

  describe('setupCapacityValidationObserver', () => {
    it('should subscribe to store with dependencies', () => {
      setupCapacityValidationObserver();
      expect(store.subscribe).toHaveBeenCalled();
    });
  });
});
