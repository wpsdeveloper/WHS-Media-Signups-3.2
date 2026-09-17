import * as dom from '../common/dom.js';
import * as dates from '../common/dates.js';
import { store } from "../common/store.js";
import { CHECKIN_CONFIG, CheckinBox } from '../common/checkin-box.js';
import { Signup } from '../../shared/types/signups.js';

export class AdminDataRow {
  element: HTMLElement;
  signup: Signup;
  rowId: string = '';
  
  constructor(rowId: string, signup: Signup) {
    this.rowId = rowId;
    this.signup = signup;
    
    const templateSelector = signup.type === 'Staff reservation'
      ? '#staff-row-template'
      : '#student-row-template';

    const template = dom.qs<HTMLTemplateElement>(templateSelector); // clone the template
    if (!template?.content) throw new Error(`${templateSelector} template not found`);;
    const clonedNode = template.content.cloneNode(true) as DocumentFragment;
    const firstChild = clonedNode.firstElementChild as HTMLElement;
    if (!firstChild) throw new Error(`Empty template for ${templateSelector}`);
    this.element = firstChild;
    this.element.removeAttribute('id');
    this.element.classList.add('data-row');
    
    dom.setAttribute(this.element, 'dataset.signupId', this.rowId);
  }

  populate() {
    const { element, signup } = this;

    // render student names and room badges
    const dateDiv = element.querySelector('.signup-date') as HTMLInputElement;
    if (dateDiv) dom.setHTML(dateDiv, dates.formatDateSlashes(new Date(signup.date)));
    
    const periodDiv = element.querySelector('.signup-period') as HTMLInputElement;
    const period = signup?.period === "Wed. PM Int." ? signup.period : "Period " + signup.period;
    if (periodDiv) dom.setHTML(periodDiv, period);

    // render editor links/icons
    const isEditor = store.getState()?.isEditor;
    const editIcons = element.querySelector('.edit-icons') as HTMLElement;
    if (editIcons) {
      dom.setVisible(editIcons, true);
      if (isEditor) {
        const editLink = editIcons.querySelector('a.edit-link') as HTMLAnchorElement;
        if (editLink) {
          const editUrl = `${editLink.href}&id=${signup.rowId}`
          dom.setAttribute(editLink, "href", editUrl);
        }
      }
    }
    
    //render type label and study info
    const typeDiv = element.querySelector('.type') as HTMLElement;
    if (typeDiv) dom.setText(typeDiv, getSignupTypeLabel(signup));
    
    const studyTeacherDiv = element.querySelector('.study-teacher') as HTMLElement;
    if (studyTeacherDiv) dom.setText(studyTeacherDiv, signup.teacherStudy || "");
    
    const commentDiv = element.querySelector('.comments') as HTMLElement;
    if (commentDiv) dom.setText(commentDiv, signup.comments || "");

    // render room information
    const roomDiv = element.querySelector('.room') as HTMLElement;
    if (roomDiv) {
      const roomText = signup.room
      ? `Glass Room ${signup.room}, reserved by ${signup.email}`
      : "";
      dom.setText(roomDiv, roomText);
    }

  this.mountCheckinBoxes();
  }

  mountCheckinBoxes() {
    (Object.entries(CHECKIN_CONFIG) as Array<[keyof typeof CHECKIN_CONFIG, typeof CHECKIN_CONFIG[keyof typeof CHECKIN_CONFIG]]>)
        .forEach(([checkinType, config]) => {
      const panel = dom.qs(`div[data-type="${checkinType}"]`) as HTMLElement;
      if (panel) {
        panel.innerHTML = ''; // Ensure container is clean before appending
        const checkinBox = new CheckinBox(checkinType, this.signup.rowId);
        if (!checkinBox.element) return;
        panel.append(checkinBox.element);
        checkinBox.render();
      }
    });
  }

  handleEditClick() {

  }

  handleSaveClick(){

  }

  handleCancelClick(){}

  handleDeleteClick(){}
}

// =====================================================================
// PURE HELPER FUNCTIONS
// =====================================================================

function getSignupTypeLabel(signup: Signup) {
  switch (signup.type) {
    case 'Intervention':
      return `Intervention: ${signup.subject}`;
    case 'Tutoring':
      return `NHS Tutoring: ${signup.subject}`;
    case 'Assessment':
      return `Assessment Makeup: ${signup.teacherAcad}`;
    case 'Alt setting':
      return `Alt Setting for ${signup.teacherAcad}`;
    case 'Non-intervention':
      return `Non-Intervention (${signup.purpose}/${signup.teacherAcad})`;
    case 'Staff reservation':
      return 'Staff reservation';
    default:
      console.warn('Unknown signup type:', signup.type);
      return signup.type || '';
  }
}
