import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as checkin from '../../client/common/checkin';

vi.mock('../../client/common/dom', () => ({
  qs: vi.fn(),
  setVisible: vi.fn(),
  setText: vi.fn(),
}));

vi.mock('../../client/common/messaging', () => ({
  processError: vi.fn(),
}));

vi.mock('../../client/common/debug', () => ({
  IS_DEBUG: false,
}));

describe('Checkin Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.google = {
      script: {
        run: {
          withSuccessHandler: vi.fn().mockImplementation((cb) => ({
            withFailureHandler: vi.fn().mockReturnValue({
              setCheckin: vi.fn().mockImplementation((...args) => {
                if (cb) cb(args);
              }),
            }),
          })),
        },
      },
    };
  });

  describe('saveCheckinTime', () => {
    it('calls setCheckin on server with checkinBox properties', async () => {
      const mockBox = { propName: 'studyIn1', rowId: '123', timeValue: '10:00 AM' };
      await checkin.saveCheckinTime(mockBox);
      expect(global.google.script.run.withSuccessHandler).toHaveBeenCalled();
    });
  });

  describe('checkinSuccess', () => {
    it('logs success without throwing', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      checkin.checkinSuccess({ propName: 'studyIn1', id: '1', value: '10:00 AM' });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
