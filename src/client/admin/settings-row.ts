/**
 * @file settings-row.ts
 * @description Manages rendering and value population for individual App Setting rows in the admin settings table.
 */

import * as dates from '../common/dates';
import * as dom from '../common/dom';

/**
 * Class representing an individual settings table row.
 */
export class SettingsRow {
  element: HTMLElement;
  key: string;
  setting: Setting;
  
  /**
   * Constructs a new SettingsRow instance.
   * 
   * @param key - The setting key.
   * @param setting - The Setting object.
   */
  constructor(key: string, setting: Setting) {
    this.key = key;
    this.setting = setting;
    
    const templateSelector = '#settings-row-template';
    const template = dom.qs(templateSelector) as HTMLTemplateElement;
    const clonedElement = template.content.cloneNode(true) as HTMLElement;
    const child = clonedElement.firstElementChild as HTMLElement;
    if (!child) throw new Error('Missing settings template');
  
    this.element = child;
    this.element.removeAttribute('id');
    this.element.classList.add('settings-row');
    
    dom.setAttribute(this.element, 'dataset.key', this.key);
  }

  /**
   * Populates the row with setting details, descriptions, and dynamic input controls (switches, inputs).
   */
  populate() {
    const { element, setting } = this;
    const { key, value, description, comments } = setting;
    const dataType = setting.dataType || (setting as any).type;

    const keyDiv = element.querySelector(".key") as HTMLElement;
    if (keyDiv) dom.setText(keyDiv, key);
    
    const descriptionDiv = element.querySelector(".description") as HTMLElement;
    if (descriptionDiv) dom.setText(descriptionDiv, description);
    
    const commentsDiv = element.querySelector(".comments") as HTMLElement;
    if (commentsDiv) dom.setText(commentsDiv, comments);

    const isBoolean = dataType === "boolean" || typeof value === "boolean" || String(value).toLowerCase() === "on" || String(value).toLowerCase() === "off";

    if (isBoolean) {
      const strVal = String(value).trim().toLowerCase();
      const isOn = strVal === "on" || strVal === "true" || value === true;
      const safeKey = (key || 'setting').replace(/[^a-zA-Z0-9_-]/g, "_");
      const valueDiv = element.querySelector(".value") as HTMLElement;
      if (valueDiv) {
        valueDiv.innerHTML = `
          <div class="form-check form-switch d-inline-flex align-items-center gap-2 mb-0 py-1">
            <input 
              class="form-check-input setting-toggle-switch" 
              type="checkbox" 
              role="switch" 
              id="setting-${safeKey}" 
              ${isOn ? 'checked' : ''} 
            />
            <label class="form-check-label fw-bold setting-toggle-label user-select-none ${isOn ? 'text-success' : 'text-secondary'}" for="setting-${safeKey}">
              ${isOn ? 'On' : 'Off'}
            </label>
          </div>
        `;
        const toggleInput = valueDiv.querySelector(`#setting-${safeKey}`) as HTMLInputElement | null;
        const toggleLabel = valueDiv.querySelector(`.setting-toggle-label`) as HTMLLabelElement | null;
        if (toggleInput && toggleLabel) {
          toggleInput.addEventListener("change", () => {
            if (toggleInput.checked) {
              toggleLabel.textContent = "On";
              toggleLabel.classList.remove("text-secondary");
              toggleLabel.classList.add("text-success");
            } else {
              toggleLabel.textContent = "Off";
              toggleLabel.classList.remove("text-success");
              toggleLabel.classList.add("text-secondary");
            }
          });
        }
      }
      return;
    }

    const input = element.querySelector(".value input") as HTMLInputElement;
    if (!input) return;

    if (dataType === "integer" || typeof value === "number") {
      input.type = "number";
      input.value = String(value);
    } else if (dataType === "date" && value instanceof Date) {
      input.type = "date";
      input.value = !isNaN(value.getTime()) ? dates.toDateInputValue(value) : String(value);
    } else if (dataType === "string-array" || Array.isArray(value)) {
      input.type = "text";
      input.value = Array.isArray(value) ? value.join(", ") : String(value);
    } else {
      input.type = "text";
      input.value = value !== undefined && value !== null ? String(value) : '';
    }
  }
}
