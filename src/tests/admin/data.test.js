import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAuditHandler, getStudentAudit, setupAuditObserver } from '../../client/admin/data.js';
import * as dom from '../../client/common/dom.js';
import * as messaging from '../../client/common/messaging.js';
import * as parser from '../../client/common/parsers.js';
import { store } from '../../client/common/store.js';

vi.mock('../../client/common/dom.js', () => ({
  qs: vi.fn(),
}));

vi.mock('../../client/common/messaging.js', () => ({
  showLoadingModal: vi.fn(),
  hideLoadingModal: vi.fn(),
  processError: vi.fn(),
}));

vi.mock('../../client/common/parsers.js', () => ({
  parseSignups: vi.fn(),
}));

vi.mock('../../client/common/store.js', () => ({
  store: {
    getState: vi.fn(),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

vi.mock('../../client/common/debug.js', () => ({
  DEBUG: false,
}));

describe('data module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuditHandler', () => {
    it('returns early if student name input length is less than 3 characters', async () => {
      vi.mocked(dom.qs).mockReturnValue({ value: 'ab' });

      await getAuditHandler();

      expect(store.setState).not.toHaveBeenCalled();
    });

    it('parses email from "Name <email>" format and updates store state', async () => {
      vi.mocked(dom.qs).mockReturnValue({ value: 'Jane Doe <jane@example.com>' });

      await getAuditHandler();

      expect(store.setState).toHaveBeenCalledWith({
        requestedStudentEmail: 'jane@example.com',
      });
    });

    it('does not update store state if email pattern in brackets is missing', async () => {
      vi.mocked(dom.qs).mockReturnValue({ value: 'Jane Doe No Email' });

      await getAuditHandler();

      expect(store.setState).not.toHaveBeenCalled();
    });

    it('catches thrown exceptions and delegates to messaging.processError', async () => {
      const error = new Error("Error");
      vi.mocked(dom.qs).mockImplementation(() => {
        throw error;
      });

      await getAuditHandler();

      expect(messaging.processError).toHaveBeenCalledWith(error, 
        'Error parsing student name:'
      );
    });
  });

  describe('getStudentAudit', () => {
    let mockGetStudentAuditGAS;
    let mockWithFailureHandler;
    let mockWithSuccessHandler;

    beforeEach(() => {
      mockGetStudentAuditGAS = vi.fn();
      mockWithFailureHandler = vi.fn().mockReturnValue({
        getStudentAudit: mockGetStudentAuditGAS,
      });
      mockWithSuccessHandler = vi.fn().mockReturnValue({
        withFailureHandler: mockWithFailureHandler,
      });

      global.google = {
        script: {
          run: {
            withSuccessHandler: mockWithSuccessHandler,
          },
        },
      };

      vi.mocked(store.getState).mockReturnValue({
        requestedStudentEmail: 'student@example.com',
      });
    });

    it('shows loading modal and calls GAS getStudentAudit on success', async () => {
      mockGetStudentAuditGAS.mockImplementation(function () {
        const successCb = mockWithSuccessHandler.mock.calls[0][0];
        successCb([{ id: 1 }]);
      });

      const auditPromise = getStudentAudit();
      expect(messaging.showLoadingModal).toHaveBeenCalledWith('Getting student data');

      const data = await auditPromise;
      expect(mockWithSuccessHandler).toHaveBeenCalled();
      expect(mockWithFailureHandler).toHaveBeenCalled();
      expect(mockGetStudentAuditGAS).toHaveBeenCalledWith('student@example.com');
      expect(data).toEqual([{ id: 1 }]);
    });

    it('rejects promise when GAS execution fails', async () => {
      const errorObj = new Error('GAS Script Execution Failure');
      mockGetStudentAuditGAS.mockImplementation(function () {
        const failureCb = mockWithFailureHandler.mock.calls[0][0];
        failureCb(errorObj);
      });

      await expect(getStudentAudit()).rejects.toThrow('GAS Script Execution Failure');
    });
  });

  describe('setupAuditObserver', () => {
    it('subscribes to state changes for requestedStudentEmail and updates store signups', async () => {
      let subscriberCallback;
      vi.mocked(store.subscribe).mockImplementation((cb) => {
        subscriberCallback = cb;
      });

      vi.mocked(store.getState).mockReturnValue({
        requestedStudentEmail: 'student@example.com',
      });
      vi.mocked(parser.parseSignups).mockReturnValue([{ id: 101 }]);

      mockGASSuccess([{ raw: 'signup' }]);

      setupAuditObserver();

      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), ['requestedStudentEmail']);

      await subscriberCallback({ currentStudentName: 'Jane' });

      expect(parser.parseSignups).toHaveBeenCalledWith([{ raw: 'signup' }]);
      expect(store.setState).toHaveBeenCalledWith({ signups: [{ id: 101 }] });
      expect(messaging.hideLoadingModal).toHaveBeenCalled();
    });
  });
});

function mockGASSuccess(data) {
  const mockGetStudentAuditGAS = vi.fn().mockImplementation(() => {
    const successCb = mockWithSuccessHandler.mock.calls[0][0];
    successCb(data);
  });
  const mockWithFailureHandler = vi.fn().mockReturnValue({
    getStudentAudit: mockGetStudentAuditGAS,
  });
  const mockWithSuccessHandler = vi.fn().mockReturnValue({
    withFailureHandler: mockWithFailureHandler,
  });

  global.google = {
    script: {
      run: {
        withSuccessHandler: mockWithSuccessHandler,
      },
    },
  };
}