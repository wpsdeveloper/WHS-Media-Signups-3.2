import * as dom from './dom.js';
import * as checkin from './checkin.js';
import * as dates from "./dates.js";
import { store } from "./store";

export class CheckinBox {
  static TYPES = Object.freeze({
    STUDY_CHECKIN: "study-checkin",
    MEDIA_CHECKIN: "media-checkin",
    MEDIA_CHECKOUT: "media-checkout",
    STUDY_RETURN: "study-return",
  });

  static CHECKIN_TYPES = Object.freeze(Object.values(CheckinBox.TYPES));

  static CHECKIN_LABEL = Object.freeze({
    [CheckinBox.TYPES.STUDY_CHECKIN]: 'Study In',
    [CheckinBox.TYPES.MEDIA_CHECKIN]: 'Media In',
    [CheckinBox.TYPES.MEDIA_CHECKOUT]: 'Media Out',
    [CheckinBox.TYPES.STUDY_RETURN]: 'Study Return',
  });

  static CHECKIN_BTN_TEXT = Object.freeze({
    [CheckinBox.TYPES.STUDY_CHECKIN]: 'Check In',
    [CheckinBox.TYPES.MEDIA_CHECKIN]: 'Check In',
    [CheckinBox.TYPES.MEDIA_CHECKOUT]: 'Check Out',
    [CheckinBox.TYPES.STUDY_RETURN]: 'Return',
  });

  element = null;
  type = "";
  label = "";
  className = "";
  timeValue = "";
  rowId = null;
  state = "ready";

  constructor(type, rowId, timeValue = "") {
    const template = dom.qs("template#checkin-box");
    this.element = template.content.cloneNode(true);
    
    this.checkinButton = this.element.querySelector(".checkin-btn");
    this.checkinLabel = this.element.querySelector(".checkin-box-label");
    this.timeDiv = this.element.querySelector(".time");
    this.timeValueDiv = this.element.querySelector(".time-value");
    this.timeEditDiv = this.element.querySelector(".time-edit");
    this.timeEditInput = this.element.querySelector(".time-edit input");
    this.primaryButtonsDiv = this.element.querySelector(".primary-buttons");
    this.editStartButton = this.element.querySelector(".edit-start-btn");
    this.editSaveBtn = this.element.querySelector(".save-btn");
    this.deleteBtn = this.element.querySelector(".delete-btn");
    this.cancelBtn = this.element.querySelector(".cancel-btn");
    this.spinner= this.element.querySelector(".spinner");
    
    this.type = type;
    this.rowId = rowId;
    this.label = CheckinBox.CHECKIN_LABEL[type];
    this.timeValue = timeValue || "";
    this.buttonText = CheckinBox.CHECKIN_BTN_TEXT[type];

    this.bindEvents();
  }
  
  bindEvents() {
      dom.addEventListener(this.checkinButton, 'click', (e) => this.handleCheckinClick(this.type, e.target));
      dom.addEventListener(this.editStartButton, 'click', (e) => this.handleEditStartClick(this.type, e.target));
      dom.addEventListener(this.editSaveBtn, 'click', (e) => this.handleEditSaveClick(this.type, e.target));
      dom.addEventListener(this.cancelBtn, 'click', (e) => this.handleCancelClick(this.type, e.target));
      dom.addEventListener(this.deleteBtn, 'click', (e) => this.handleDeleteClick(this.type, e.target));
  }

 setComponentState(state) {
    this.state = state;
    this.render();
  }
  
  render() {
    dom.setText(this.checkinLabel, this.label);
    dom.setText(this.checkinButton, this.buttonText);

    switch (this.state) {
      case "ready":
        this.renderReady();
        break;
      case "loading":
        this.renderLoading();
        break;
      case "editing":
        this.renderEditing();
        break;
      case "hasData":
        this.renderHasData();
        break;
      default:
        console.error("Unknown state: ", this.state);
     }
  }

  renderReady() {
    dom.setVisible(this.checkinButton, true);
    dom.setVisible(this.primaryButtonsDiv, true);
    dom.setVisible(this.timeDiv, false);
    dom.setVisible(this.timeValueDiv, false);
    dom.setVisible(this.timeEditDiv, false);
    dom.setVisible(this.spinner, false); 
  }
  
  renderLoading() {
    dom.setVisible(this.checkinButton, false);
    dom.setVisible(this.primaryButtonsDiv, false);
    dom.setVisible(this.timeDiv, false);
    dom.setVisible(this.timeValueDiv, false);
    dom.setVisible(this.timeEditDiv, false);
    dom.setVisible(this.spinner, true);
  }
  
  renderEditing() {
    dom.setVisible(this.checkinButton, false);
    dom.setVisible(this.primaryButtonsDiv, false);
    dom.setVisible(this.timeDiv, true);
    dom.setVisible(this.timeValueDiv, false);
    if (this.timeValue) dom.setValue(this.timeEditInput, this.timeValue);
    dom.setVisible(this.timeEditDiv, true);
    dom.setVisible(this.spinner, false);
  }
  
  renderHasData() {
    dom.setVisible(this.checkinButton, false);
    dom.setVisible(this.primaryButtonsDiv, true);
    
    dom.setVisible(this.timeDiv, true);
    dom.setVisible(this.timeValueDiv, true);
    dom.setText(this.timeValueDiv, this.timeValue);
    dom.setVisible(this.timeEditDiv, false);
    
    dom.setVisible(this.spinner, false);
  }

  async handleCheckinClick() {
    this.setComponentState("loading");

    const formattedTime = dates.formatTime(new Date());
    this.timeValue = await checkin.checkin(this, formattedTime);
    const updatedSignups = this.updateSignups(this.rowId, this.timeValue);
    
    store.setState({signups: updatedSignups});
    this.setComponentState("hasData");
  }
  
  handleEditStartClick() {
    this.setComponentState("editing");
    dom.setTimeInputValue(this.timeEditInput, this.timeValue);
  }
  
  handleEditSaveClick() {
    const inputtedValue = dom.valueOf(this.timeEditInput);
    
    dom.qs(".validation-error", this.element)?.remove();
    if (!dates.isValidTime24Hr(inputtedValue)) {
      const error = document.createElement("span");
      error.className = "validation-error text-danger";
      error.innerHTML = "<small>Invalid time</small>";
      this.element.append(error);
      return;
    }
    this.timeValue = dates.convert24HrTo12Hr(inputtedValue);
    checkin.checkin(this, this.timeValue);
    
    const updatedSignups = this.updateSignups(this.rowId, this.timeValue);   
    store.setState({signups: updatedSignups});
    this.setComponentState("hasData");
  }

  handleCancelClick() {
    if (this.timeValue.length >0) {
      this.setComponentState("hasData");
    } else {
      this.setComponentState("ready");   
    }
  }

  handleDeleteClick() {
    this.setComponentState("ready");
  }

  updateSignups(rowId, newValue) {
    const { signups } = store.getState();
    const type = this.type;
    const thisSignup = signups.filter(su => su.rowId == rowId);
      thisSignup.forEach(su => {
      su[type] = newValue;
    });

    return signups;
  }
}