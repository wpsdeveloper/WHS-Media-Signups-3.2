import * as dates from '../common/dates.js';
import * as dom from '../common/dom.js';

export class SettingsRow {
  element = null;
  key = null;
  setting = null;
  
  constructor(key, setting) {
    this.key = key;
    this.setting = setting;
    
    const templateSelector = '#settings-row-template';
    const template = dom.qs(templateSelector); // clone the template
    this.element = template.content.cloneNode(true).firstElementChild;
    this.element.removeAttribute('id');
    this.element.classList.add('settings-row');
    
    dom.setAttribute(this.element, 'dataset.key', this.key);
  }

  populate() {
    const { element, setting } = this;
    const { key, value, description, comments, type } = setting;

    const keyDiv = element.querySelector(".key");
    dom.setText(keyDiv, key);
    
    const descriptionDiv = element.querySelector(".description");
    dom.setText(descriptionDiv, description);
    
    const commentsDiv = element.querySelector(".comments");
    dom.setText(commentsDiv, comments);

    const input = element.querySelector(".value input");

    switch(type) {
      case "string":
      case "string-array":
        input.value = value;
        input.type = "text";
        break;
      case "integer":
        input.value = value;
        input.type = "number";
        break;
      case "boolean":
        const on = (value==="On") || (value==="true");
        input.classList.remove("form-control");
        input.classList.add("form-check-input");
        input.type = "checkbox";
        input.checked = on;
        break;
      case "date":
        const date = dates.parseDateInput(value);
        // Format date to YYYY-MM-DD (handling timezone offset issues)
        const day = ("0" + date.getDate()).slice(-2);
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();
        input.type = "date";
        input.value = `${year}-${month}-${day}`;
        
        break;
    }
  }

  handleEditClick() {

  }

  handleSaveClick(){

  }

  handleCancelClick(){}

  handleDeleteClick(){}
}
