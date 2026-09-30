import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAuditHandler, getStudentAudit, saveSettingsHandler, setupAuditObserver } from '../../client/admin/data';
import * as dom from '../../client/common/dom';
import * as messaging from '../../client/common/messaging';
import * as parser from '../../client/common/parsers';
import { store } from '../../client/admin/admin-store';

vi.mock('../../client/common/dom', () => ({
  qs: vi.fn(),
  qsa: vi.fn().mockReturnValue([]),
}));

vi.mock('../../client/common/messaging', () => ({
  showLoadingModal: vi.fn(),
  hideLoadingModal: vi.fn(),
  processError: vi.fn(),
  showSuccessToast: vi.fn(),
}));

vi.mock('../../client/common/parsers', () => ({
  parseSignups: vi.fn(),
  safeJsonParse: vi.fn(),
}));

vi.mock('../../client/admin/admin-store', () => ({
  store: {
    getState: vi.fn().mockReturnValue({ ui_requestedStudentEmail: 'student@example.com', settings: [] }),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

vi.mock('../../client/common/debug', () => ({
  IS_DEBUG: false,
}));

describe('Admin Data Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuditHandler', () => {
    it('returns early if student name input length is less than 2', async () => {
      dom.qs.mockReturnValue({ value: 'a' });
      await getAuditHandler();
      expect(store.setState).not.toHaveBeenCalled();
    });

    it('parses email from bracketed format and updates store', async () => {
      dom.qs.mockReturnValue({ value: 'John Doe <john@example.com>' });
      await getAuditHandler();
      expect(store.setState).toHaveBeenCalledWith({ ui_requestedStudentEmail: 'john@example.com' });
    });
  });

  describe('setupAuditObserver', () => {
    it('subscribes to ui_requestedStudentEmail changes', () => {
      setupAuditObserver();
      expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function), ['ui_requestedStudentEmail']);
    });
  });
});
