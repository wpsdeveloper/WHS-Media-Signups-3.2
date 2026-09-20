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
    const { key, value, description, comments, dataType } = setting;

    const keyDiv = element.querySelector(".key") as HTMLElement;
    dom.setText(keyDiv, key);
    
    const descriptionDiv = element.querySelector(".description") as HTMLElement;
    dom.setText(descriptionDiv, description);
    
    const commentsDiv = element.querySelector(".comments") as HTMLElement;
    dom.setText(commentsDiv, comments);

    const input = element.querySelector(".value input") as HTMLInputElement;

    if (typeof value === "string") {
      input.type = "text";
    } else if (typeof value === "number") {
      input.value = String(value);
      input.type = "number";
    } else if (typeof value === "boolean") {
      const on = (value===true);
      input.classList.remove("form-control");
      input.classList.add("form-check-input");
      input.type = "checkbox";
      input.checked = on;
    } else if (value instanceof Date) {
      // Format date to YYYY-MM-DD (handling timezone offset issues)
      input.value = dates.toDateInputValue(value);
    } else if (Array.isArray(value)) 
      input.value = value.join(", ");
    else {
      console.error("Unsupported data type for setting value:", value);
    }
  }

  handleEditClick() {

  }

  handleSaveClick(){

  }

  handleCancelClick(){}

  handleDeleteClick(){}
}
