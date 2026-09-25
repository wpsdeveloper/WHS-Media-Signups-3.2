import * as dom from '../common/dom';
import * as dates from '../common/dates';
import { AttendanceState, store, checkinStore } from "./attendance-store";
import { CHECKIN_CONFIG, CheckinBox } from '../common/checkin-box';
import { getRoomBadge } from './glass-rooms-status';

export class AttendanceDataRow {
  element: HTMLElement;
  signup: Signup;
  rowId: string = '';
  state: 'attendance' | 'details' = 'attendance';
  attendancePanel: HTMLElement | null = null;
  detailsPanel: HTMLElement | null = null;;
  
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
    this.element.setAttribute('row-id', rowId);
    
    const attendancePanel: HTMLElement = this.element.querySelector('.attendance-info') as HTMLElement; 
    const detailsPanel: HTMLElement = this.element.querySelector('.details-info') as HTMLElement; 
    if (signup.type != 'Staff reservation') {
      this.attendancePanel = attendancePanel;
      this.detailsPanel = detailsPanel;
    }
  }

  render() {
    switch (this.state) {
      case 'attendance':
        this.renderAttendance();
        break;
      case 'details':
        this.renderDetails();
        break;
      default:
        console.error('Unknown dataRow state: ', this.state);
    }
  }

  renderAttendance() {
    if (this.attendancePanel) dom.setVisible(this.attendancePanel, true);
    if (this.detailsPanel) dom.setVisible(this.detailsPanel, false);
  }

  renderDetails() {
    if (this.attendancePanel) dom.setVisible(this.attendancePanel, false);
    if (this.detailsPanel) dom.setVisible(this.detailsPanel, true);
  }

  populate(currentDate: AttendanceState['ui_currentDate'], currentPeriod: AttendanceState['ui_currentPeriod']) {
    const { element, signup } = this;

    // assigns current-date or current-period tags if appropriate
    if (currentPeriod && currentPeriod === signup.period) {
      element.classList.add('current-period');
    }

    const signupDate = new Date(signup.date);
    if (currentDate && dates.isSameDate(signupDate, currentDate)) {
      element.classList.add('current-date');
    }

    // render student names and room badges
    const studentNameDiv = element.querySelector('.student-name') as HTMLElement;
    if (studentNameDiv) {
      const roomBadge = getRoomBadge(signup.room);
      dom.setHTML(studentNameDiv, `${signup.lastname}, ${signup.firstname}${roomBadge}`);
    }

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
    const typeDiv = element.querySelector('.type') as HTMLInputElement;
    if (typeDiv) dom.setText(typeDiv, getSignupTypeLabel(signup));
    
    const studyTeacherDiv = element.querySelector('.study-teacher') as HTMLInputElement;
    if (studyTeacherDiv) dom.setText(studyTeacherDiv, signup.teacherStudy || "");
    
    const commentDiv = element.querySelector('.comments') as HTMLInputElement;
    if (commentDiv) dom.setText(commentDiv, signup.comments || "");

    // render room information
    const roomDiv = element.querySelector('.room') as HTMLInputElement;
    if (roomDiv) {
      const roomText = signup.room
      ? `Glass Room ${signup.room}, reserved by ${signup.email}`
      : "";
      dom.setText(roomDiv, roomText);
    }

  this.mountCheckinBoxes();
  }

  mountCheckinBoxes() {
    const attendancePanel = this.attendancePanel;
    if (!attendancePanel) return;

    const checkinType = Object.keys(CHECKIN_CONFIG);
    checkinType
    .forEach((type) => {
      const propName = CHECKIN_CONFIG[type].propName;
      const panel = attendancePanel.querySelector(`div[data-type="${type}"]`);
      if (panel) {
        panel.innerHTML = ''; // Ensure container is clean before appending
        const checkinBox = new CheckinBox(type, this.signup.rowId, this.signup[propName], checkinStore);
        panel.append(checkinBox.element as HTMLElement);
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
