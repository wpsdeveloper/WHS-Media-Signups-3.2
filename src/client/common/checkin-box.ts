import * as dom from './dom';
import * as checkin from './checkin';
import * as dates from "./dates";
import { store, StoreState } from "./store";
import { Signup } from "../../shared/types/signups";

export type CheckinType = (typeof CheckinBox.TYPES)[keyof typeof CheckinBox.TYPES];
export type CheckinLabel = typeof CheckinBox.CHECKIN_LABEL[CheckinType];
export type CheckinButtonText = typeof CheckinBox.CHECKIN_BTN_TEXT[CheckinType];
export type CheckinBoxState = "ready" | "loading" | "editing" | "hasData";

export class CheckinBox {
  static readonly TYPES = {
    STUDY_CHECKIN: "study-checkin",
    MEDIA_CHECKIN: "media-checkin",
    MEDIA_CHECKOUT: "media-checkout",
    STUDY_RETURN: "study-return",
  } as const;

  static readonly CHECKIN_TYPES = (Object.values(CheckinBox.TYPES)) as CheckinType[];

  static readonly CHECKIN_LABEL: Record<CheckinType, string> = {
    [CheckinBox.TYPES.STUDY_CHECKIN]: 'Study In',
    [CheckinBox.TYPES.MEDIA_CHECKIN]: 'Media In',
    [CheckinBox.TYPES.MEDIA_CHECKOUT]: 'Media Out',
    [CheckinBox.TYPES.STUDY_RETURN]: 'Study Return',
  };

  static readonly CHECKIN_BTN_TEXT:Record<CheckinType, string> = {
    [CheckinBox.TYPES.STUDY_CHECKIN]: 'Check In',
    [CheckinBox.TYPES.MEDIA_CHECKIN]: 'Check In',
    [CheckinBox.TYPES.MEDIA_CHECKOUT]: 'Check Out',
    [CheckinBox.TYPES.STUDY_RETURN]: 'Return',
  };

  type: CheckinType;
  label: CheckinLabel;
  buttonText: CheckinButtonText;
  className: string = "";
  timeValue: string = "";
  rowId: string = "";
  state: CheckinBoxState = "ready";
  
  element: HTMLElement | null = null;
  checkinButton: HTMLButtonElement;
  checkinLabel: HTMLElement;
  timeDiv: HTMLElement;
  timeValueDiv: HTMLElement;
  timeEditDiv: HTMLElement;
  timeEditInput: HTMLInputElement;
  primaryButtonsDiv: HTMLElement ;
  editStartButton: HTMLButtonElement ;
  editSaveBtn: HTMLButtonElement;
  deleteBtn: HTMLButtonElement;
  cancelBtn: HTMLButtonElement ;
  spinner: HTMLElement;

  constructor(
    type: CheckinBox['type'], 
    rowId: CheckinBox['rowId'], 
    timeValue: CheckinBox['timeValue'] = ""
  ){
    const template = dom.qs<HTMLTemplateElement>("template#checkin-box");
    if (!template) throw new Error ('Checkbox template not found');
    const clonedNode = template.content.cloneNode(true) as DocumentFragment;
    const firstChild = clonedNode.firstElementChild as HTMLElement;
    if (!firstChild) throw new Error(`Empty template for CheckinBox`);
    this.element = firstChild;
    
    this.checkinButton = this.element.querySelector(".checkin-btn") as HTMLButtonElement;
    this.checkinLabel = this.element.querySelector(".checkin-box-label") as HTMLElement;
    this.timeDiv = this.element.querySelector(".time") as HTMLElement;
    this.timeValueDiv = this.element.querySelector(".time-value") as HTMLElement;
    this.timeEditDiv = this.element.querySelector(".time-edit") as HTMLElement;
    this.timeEditInput = this.element.querySelector(".time-edit input") as HTMLInputElement;
    this.primaryButtonsDiv = this.element.querySelector(".primary-buttons") as HTMLElement;
    this.editStartButton = this.element.querySelector(".edit-start-btn") as HTMLButtonElement;
    this.editSaveBtn = this.element.querySelector(".save-btn") as HTMLButtonElement;
    this.deleteBtn = this.element.querySelector(".delete-btn") as HTMLButtonElement;
    this.cancelBtn = this.element.querySelector(".cancel-btn") as HTMLButtonElement;
    this.spinner= this.element.querySelector(".spinner") as HTMLElement;
    
    this.type = type;
    this.rowId = rowId;
    this.label = CheckinBox.CHECKIN_LABEL[type];
    this.timeValue = timeValue || "";
    this.buttonText = CheckinBox.CHECKIN_BTN_TEXT[type];

    this.bindEvents();
  }
  
  bindEvents() {
      dom.addEventListener(this.checkinButton, 'click', () => this.handleCheckinClick());
      dom.addEventListener(this.editStartButton, 'click', () => this.handleEditStartClick());
      dom.addEventListener(this.editSaveBtn, 'click', () => this.handleEditSaveClick());
      dom.addEventListener(this.cancelBtn, 'click', () => this.handleCancelClick());
      dom.addEventListener(this.deleteBtn, 'click', () => this.handleDeleteClick());
  }

 setComponentState(state: CheckinBoxState) {
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
    
    store.setState({signups: updatedSignups} as StoreState);
    this.setComponentState("hasData");
  }
  
  handleEditStartClick() {
    this.setComponentState("editing");
    dom.setTimeInputValue(this.timeEditInput, this.timeValue);
  }
  
  handleEditSaveClick() {
    const inputtedValue = dom.valueOf(this.timeEditInput);
    if (!this.element) return;
    const validationErrorDiv = 
    this.element.querySelector(".validation-error")?.remove();

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
    store.setState({signups: updatedSignups} as StoreState);
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

  updateSignups(rowId: Signup['rowId'], newValue: string) {
    const signups = store.getState()?.signups;
    if (!signups) return;
    
    const type = this.type;
    const thisSignup = signups.filter(su => su.rowId == rowId);
      thisSignup.forEach(su => {
      su[type] = newValue;
    });

    return signups;
  }
}