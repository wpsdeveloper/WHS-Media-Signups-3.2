import * as dom from './dom';
import * as checkin from './checkin';
import * as dates from "./dates";

export type CheckinPropName = 'studyIn1' | 'mediaIn' | 'mediaOut'|'studyIn2';

export type CheckinConfig = Record<
  CheckinType, {
    label: string,
    btnText: string,
    propName: CheckinPropName,
    className: string,
  }>

export const CHECKIN_CONFIG: CheckinConfig = {
  'study-checkin': { 
    label: 'Study In', 
    btnText: 'Check In', 
    propName: 'studyIn1',
    className: '.study-checkin', 
  },
  'media-checkin': { 
    label: 'Media In', 
    btnText: 'Check In', 
    propName: 'mediaIn',
    className: '.media-checkin', 
 
  },
  'media-checkout': { 
    label: 'Media Out', 
    btnText: 'Check Out', 
    propName: 'mediaOut',
    className: '.media-checkout',
  },
  'study-return': { 
    label: 'Study Return', 
    btnText: 'Return', 
    propName: 'studyIn2',
    className: '.study-return', 
  },
} as const;

export interface CheckinStore {
  getSignups(): readonly Signup[];
  setSignups(signups: Signup[]): void;
}

export class CheckinBox {
  static readonly TYPES = {
    STUDY_CHECKIN: "study-checkin",
    MEDIA_CHECKIN: "media-checkin",
    MEDIA_CHECKOUT: "media-checkout",
    STUDY_RETURN: "study-return",
  } as const;

  type: CheckinType;
  label: string;
  buttonText: string;
  propName: CheckinKeys;
  className: string = "";
  timeValue: string = "";
  rowId: string = "";
  state: CheckinBoxState = "ready";
  
  element: HTMLElement | null = null;
  checkinButton: HTMLButtonElement;
  checkinLabel: HTMLElement;
  timeDiv: HTMLElement;
  timeBadge: HTMLElement;
  timeValueDiv: HTMLElement;
  timeEditDiv: HTMLElement;
  timeEditInput: HTMLInputElement;
  editSaveBtn: HTMLButtonElement;
  deleteBtn: HTMLButtonElement;
  cancelBtn: HTMLButtonElement;
  spinner: HTMLElement;
  store: CheckinStore;
  isEditor: boolean;

  constructor(
    type: CheckinType, 
    rowId: string, 
    timeValue: string = "",
    store: CheckinStore,
    isEditor: boolean = false,
  ){
    this.type = type;
    this.rowId = rowId;
    this.timeValue = timeValue || "";
    this.store = store;
    this.isEditor = isEditor;

    const template = dom.qs<HTMLTemplateElement>("template#checkin-box");
    if (!template) throw new Error ('Checkbox template not found');
    const clonedNode = template.content.cloneNode(true) as DocumentFragment;
    const firstChild = clonedNode.firstElementChild as HTMLElement;
    if (!firstChild) throw new Error(`Empty template for CheckinBox`);
    this.element = firstChild;
    
    this.checkinButton = this.element.querySelector(".checkin-btn") as HTMLButtonElement;
    this.checkinLabel = this.element.querySelector(".checkin-box-label") as HTMLElement;
    this.timeDiv = this.element.querySelector(".time") as HTMLElement;
    this.timeBadge = this.element.querySelector(".time-badge") as HTMLElement;
    this.timeValueDiv = this.element.querySelector(".time-value") as HTMLElement;
    this.timeEditDiv = this.element.querySelector(".time-edit") as HTMLElement;
    this.timeEditInput = this.element.querySelector(".time-edit input") as HTMLInputElement;
    this.editSaveBtn = this.element.querySelector(".save-btn") as HTMLButtonElement;
    this.deleteBtn = this.element.querySelector(".delete-btn") as HTMLButtonElement;
    this.cancelBtn = this.element.querySelector(".cancel-btn") as HTMLButtonElement;
    this.spinner= this.element.querySelector(".spinner") as HTMLElement;

    this.state = this.timeValue ? 'hasData' : 'ready';
    
    const config = CHECKIN_CONFIG[this.type];
    this.label = config.label;
    this.buttonText = config.btnText;
    this.propName = config.propName;

    this.bindEvents();
  }
  
  bindEvents(): void {
    dom.addEventListener(this.checkinButton, 'click', () => this.handleCheckinClick());
    
    // Clicking the badge opens the editor
    if (this.timeBadge) {
      dom.addEventListener(this.timeBadge, 'click', () => this.handleEditStartClick());
      this.timeBadge.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleEditStartClick();
        }
      });
    }

    dom.addEventListener(this.editSaveBtn, 'click', () => this.handleEditSaveClick());
    dom.addEventListener(this.cancelBtn, 'click', () => this.handleCancelClick());
    dom.addEventListener(this.deleteBtn, 'click', () => this.handleDeleteClick());

    if (this.timeEditInput) {
      this.timeEditInput.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleEditSaveClick();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.handleCancelClick();
        }
      });
    }
  }

  setComponentState(state: CheckinBoxState): void {
    this.state = state;
    this.render();
  }
  
  render(): void {
    dom.setText(this.checkinLabel, this.label);
    dom.setText(this.checkinButton, this.buttonText);
    dom.setText(this.timeValueDiv, this.timeValue);

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

  renderReady(): void {
    dom.setVisible(this.checkinButton, true);
    dom.setVisible(this.timeDiv, false);
    dom.setVisible(this.timeBadge, false);
    dom.setVisible(this.timeEditDiv, false);
    dom.setVisible(this.spinner, false); 
  }
  
  renderLoading(): void {
    dom.setVisible(this.checkinButton, false);
    dom.setVisible(this.timeDiv, false);
    dom.setVisible(this.timeBadge, false);
    dom.setVisible(this.timeEditDiv, false);
    dom.setVisible(this.spinner, true);
  }
  
  renderEditing(): void {
    dom.setVisible(this.checkinButton, false);
    dom.setVisible(this.timeDiv, true);
    dom.setVisible(this.timeBadge, false);
    dom.setVisible(this.timeEditDiv, true);
    if (this.timeValue) dom.setValue(this.timeEditInput, this.timeValue);
    dom.setVisible(this.spinner, false);
    setTimeout(() => this.timeEditInput?.focus(), 20);
  }
  
  renderHasData(): void {
    dom.setVisible(this.checkinButton, false);
    dom.setVisible(this.timeDiv, true);
    dom.setVisible(this.timeBadge, true);
    dom.setText(this.timeValueDiv, this.timeValue);
    dom.setVisible(this.timeEditDiv, false);
    dom.setVisible(this.spinner, false);

    const editHintIcon = this.element?.querySelector(".edit-hint-icon") as HTMLElement | null;
    if (this.isEditor) {
      this.timeBadge.classList.add("cursor-pointer");
      this.timeBadge.classList.remove("pe-none");
      this.timeBadge.setAttribute("role", "button");
      this.timeBadge.setAttribute("tabindex", "0");
      this.timeBadge.setAttribute("title", "Click to edit or clear time");
      if (editHintIcon) dom.setVisible(editHintIcon, true);
    } else {
      this.timeBadge.classList.remove("cursor-pointer");
      this.timeBadge.classList.add("pe-none");
      this.timeBadge.removeAttribute("role");
      this.timeBadge.removeAttribute("tabindex");
      this.timeBadge.removeAttribute("title");
      if (editHintIcon) dom.setVisible(editHintIcon, false);
    }
  }

  async uploadCheckinValue() {
    this.setComponentState("loading");
  
    await checkin.saveCheckinTime(this);
    const updatedSignups = this.updateSignups(this.rowId, this.timeValue);
    
    this.store.setSignups(updatedSignups);
  }
  
  async handleCheckinClick(): Promise<void> {
    this.timeValue = dates.formatTime(new Date());
    this.uploadCheckinValue();
    this.setComponentState("hasData");
  }
  
  handleEditStartClick(): void {
    if (!this.isEditor) return;
    this.setComponentState("editing");
    dom.setTimeInputValue(this.timeEditInput, this.timeValue);
  }
  
  handleEditSaveClick(): void {
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
    this.uploadCheckinValue();
    
    this.setComponentState("hasData");
  }
  
  handleCancelClick(): void {
    if (this.timeValue.length >0) {
      this.setComponentState("hasData");
    } else {
      this.setComponentState("ready");   
    }
  }
  
  handleDeleteClick(): void {
    this.timeValue = "";
    this.uploadCheckinValue();
    this.setComponentState("ready");
  }

  updateSignups(rowId: Signup['rowId'], newValue: string): Signup[] {
    // 1. Fallback to an empty array immediately to avoid the early return bug
    const signups = (this.store.getSignups() as Signup[]) || [];
    
    const propName = CHECKIN_CONFIG[this.type].propName;

    // 2. Map handles the iteration and replacement cleanly
    return signups.map(signup =>
      signup.rowId === rowId
        ? { ...signup, [propName]: newValue }
        : signup
    );
  }
}