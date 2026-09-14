import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsRow } from '../../src/admin/settings-row.js';
import * as dom from '../../src/common/dom.js';

vi.mock('../../src/common/dom.js', () => ({
  qs: vi.fn(),
  setAttribute: vi.fn(),
  setText: vi.fn(),
}));

describe('SettingsRow', () => {
  let mockTemplate;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTemplate = document.createElement('template');
    mockTemplate.innerHTML = `
      <div id="settings-row-template">
        <div class="key"></div>
        <div class="description"></div>
        <div class="comments"></div>
        <div class="value">
          <input class="form-control" />
        </div>
      </div>
    `;

    vi.mocked(dom.qs).mockReturnValue(mockTemplate);
  });

  describe('Constructor', () => {
    it('queries settings row template and initializes element', () => {
      const setting = { key: 'MAX_SIGNUPS', value: '10' };
      const row = new SettingsRow('MAX_SIGNUPS', setting);

      expect(dom.qs).toHaveBeenCalledWith('#settings-row-template');
      expect(row.element.hasAttribute('id')).toBe(false);
      expect(row.element.classList.contains('settings-row')).toBe(true);
      expect(dom.setAttribute).toHaveBeenCalledWith(row.element, 'dataset.key', 'MAX_SIGNUPS');
    });
  });

  describe('populate', () => {
    it('populates text fields for key, description, and comments', () => {
      const setting = {
        key: 'MAX_SIGNUPS',
        value: '10',
        description: 'Maximum daily signups allowed',
        comments: 'System limit',
        type: 'integer',
      };
      const row = new SettingsRow('MAX_SIGNUPS', setting);
      row.populate();

      expect(dom.setText).toHaveBeenCalledWith(row.element.querySelector('.key'), 'MAX_SIGNUPS');
      expect(dom.setText).toHaveBeenCalledWith(
        row.element.querySelector('.description'),
        'Maximum daily signups allowed'
      );
      expect(dom.setText).toHaveBeenCalledWith(
        row.element.querySelector('.comments'),
        'System limit'
      );
    });

    it('handles "string" and "string-array" setting types', () => {
      const setting = {
        key: 'APP_NAME',
        value: 'PassApp',
        type: 'string',
      };
      const row = new SettingsRow('APP_NAME', setting);
      row.populate();

      const input = row.element.querySelector('.value input');
      expect(input.type).toBe('text');
      expect(input.value).toBe('PassApp');
    });

    it('handles "integer" setting type', () => {
      const setting = {
        key: 'LIMIT',
        value: '5',
        type: 'integer',
      };
      const row = new SettingsRow('LIMIT', setting);
      row.populate();

      const input = row.element.querySelector('.value input');
      expect(input.type).toBe('number');
      expect(input.value).toBe('5');
    });

    describe('boolean types', () => {
      it('sets checkbox to checked when value is "On"', () => {
        const setting = { key: 'ENABLED', value: 'On', type: 'boolean' };
        const row = new SettingsRow('ENABLED', setting);
        row.populate();

        const input = row.element.querySelector('.value input');
        expect(input.type).toBe('checkbox');
        expect(input.checked).toBe(true);
        expect(input.classList.contains('form-check-input')).toBe(true);
        expect(input.classList.contains('form-control')).toBe(false);
      });

      it('sets checkbox to checked when value is "true"', () => {
        const setting = { key: 'ENABLED', value: 'true', type: 'boolean' };
        const row = new SettingsRow('ENABLED', setting);
        row.populate();

        const input = row.element.querySelector('.value input');
        expect(input.checked).toBe(true);
      });

      it('sets checkbox to unchecked when value is falsey or "Off"', () => {
        const setting = { key: 'ENABLED', value: 'Off', type: 'boolean' };
        const row = new SettingsRow('ENABLED', setting);
        row.populate();

        const input = row.element.querySelector('.value input');
        expect(input.checked).toBe(false);
      });
    });

    it('handles "date" setting type and formats ISO date string correctly', () => {
      const setting = {
        key: 'START_DATE',
        value: '2026-10-05T00:00:00',
        type: 'date',
      };
      const row = new SettingsRow('START_DATE', setting);
      row.populate();

      const input = row.element.querySelector('.value input');
      expect(input.type).toBe('date');
      expect(input.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});