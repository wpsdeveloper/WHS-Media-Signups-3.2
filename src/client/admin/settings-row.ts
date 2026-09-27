import * as dates from '../common/dates';
import * as dom from '../common/dom';

export class SettingsRow {
  element: HTMLElement;
  key: string;
  setting: Setting;
  
  constructor(key: string, setting: Setting) {
    this.key = key;
    this.setting = setting;
    
    const templateSelector = '#settings-row-template';
    const template = dom.qs(templateSelector) as HTMLTemplateElement; // clone the template
    const clonedElement = template.content.cloneNode(true) as HTMLElement;
    const child = clonedElement.firstElementChild as HTMLElement;
    if (!child) throw new Error('Missing settings template');
  
    this.element = child;
    this.element.removeAttribute('id');
    this.element.classList.add('settings-row');
    
    dom.setAttribute(this.element, 'dataset.key', this.key);
  }

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

    const isBoolean = dataType === "boolean" || typeof value === "boolean" || value === "On" || value === "Off";

    if (isBoolean) {
      const isOn = value === "On" || value === "true" || value === true;
      const safeKey = (key || 'setting').replace(/[^a-zA-Z0-9_-]/g, "_");
      const valueDiv = element.querySelector(".value") as HTMLElement;
      if (valueDiv) {
        valueDiv.innerHTML = `
          <div class="d-flex align-items-center gap-3 py-1">
            <div class="form-check form-check-inline mb-0">
              <input class="form-check-input" type="radio" name="setting-${safeKey}" id="setting-${safeKey}-on" value="On" ${isOn ? 'checked' : ''} />
              <label class="form-check-label fw-semibold user-select-none" for="setting-${safeKey}-on">On</label>
            </div>
            <div class="form-check form-check-inline mb-0">
              <input class="form-check-input" type="radio" name="setting-${safeKey}" id="setting-${safeKey}-off" value="Off" ${!isOn ? 'checked' : ''} />
              <label class="form-check-label fw-semibold user-select-none" for="setting-${safeKey}-off">Off</label>
            </div>
          </div>
        `;
      }
      return;
    }

    const input = element.querySelector(".value input") as HTMLInputElement;
    if (!input) return;

    if (dataType === "integer" || typeof value === "number") {
      input.type = "number";
      input.value = String(value);
    } else if (dataType === "date" || value instanceof Date) {
      input.type = "date";
      const dateObj = value instanceof Date ? value : new Date(value);
      input.value = !isNaN(dateObj.getTime()) ? dates.toDateInputValue(dateObj) : String(value);
    } else if (dataType === "string-array" || Array.isArray(value)) {
      input.type = "text";
      input.value = Array.isArray(value) ? value.join(", ") : String(value);
    } else {
      input.type = "text";
      input.value = value !== undefined && value !== null ? String(value) : '';
    }
  }

  handleEditClick() {

  }

  handleSaveClick(){

  }

  handleCancelClick(){}

  handleDeleteClick(){}
}
