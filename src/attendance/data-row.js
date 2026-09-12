import * as dom from '../common/dom.js';
import * as dates from '../common/dates.js';
import { store } from "./store.js";
import { CheckinBox } from './checkin-box.js';

export class DataRow {
  element = null;
  signup = null;
  rowId = '';
  state = 'attendance';
  
  constructor(rowId, signup) {
    this.rowId = rowId;
    this.signup = signup;
    
    const templateSelector = signup.type === 'Staff reservation'
      ? '#staff-row-template'
      : '#student-row-template';

    const template = dom.qs(templateSelector); // clone the template
    this.element = template.content.cloneNode(true).firstElementChild;
    this.element.removeAttribute('id');
    this.element.classList.add('data-row');
    
    dom.setAttribute(this.element, 'dataset.signupId', this.rowId);

    this.attendancePanel = this.element.querySelector('.attendance-info');
    this.detailsPanel = this.element.querySelector('.details-info');
  }

  render() {
    switch (this.state) {
      case 'attendance':
        renderAttendance();
        break;
      case 'details':
        renderDetails();
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

  populate(currentDatePeriod) {
    const { element, signup } = this;


    // assigns current-date or current-period tags if appropriate
    if (currentDatePeriod.period && String(currentDatePeriod.period) === String(signup.period)) {
      element.classList.add('current-period');
    }

    const signupDate = new Date(signup.date);
    if (currentDatePeriod.date && dates.isSameDate(signupDate, dates.parseDateInput(currentDatePeriod.date))) {
      element.classList.add('current-date');
    }

    // render student names and room badges
    const studentNameDiv = element.querySelector('.student-name');
    if (studentNameDiv) {
      const roomBadge = getRoomBadge(signup.room);
      dom.setHTML(studentNameDiv, `${signup.lastname}, ${signup.firstname}${roomBadge}`);
    }

    // render editor links/icons
    const { isEditor } = store.getState();
    const editIcons = element.querySelector('.edit-icons');
    if (editIcons) {
      dom.setVisible(editIcons, true);
      if (isEditor) {
        const editLink = editIcons.querySelector('a.edit-link');
        if (editLink) {
          const editUrl = `${editLink.href}&id=${signup.rowId}`
          dom.setAttribute(editLink, "href", editUrl);
        }
      }
    }
    
    //render type label and study info
    const typeDiv = element.querySelector('.type');
    if (typeDiv) dom.setText(typeDiv, getSignupTypeLabel(signup));
    
    const studyTeacherDiv = element.querySelector('.study-teacher');
    if (studyTeacherDiv) dom.setText(studyTeacherDiv, signup.teacherStudy || "");
    
    const commentDiv = element.querySelector('.comments');
    if (commentDiv) dom.setText(commentDiv, signup.comments || "");

    // render room information
    const roomDiv = element.querySelector('.room');
    if (roomDiv) {
      const roomText = signup.room
      ? `Glass Room ${signup.room}, reserved by ${signup.email}`
      : "";
      dom.setText(roomDiv, roomText);
    }

  this.mountCheckinBoxes();
  }

  mountCheckinBoxes() {
    if (!this.attendancePanel) return;

    CheckinBox.CHECKIN_TYPES.forEach((checkinType) => {
      const panel = this.attendancePanel.querySelector(`div[data-type="${checkinType}"]`);
      if (panel) {
        panel.innerHTML = ''; // Ensure container is clean before appending
        const checkinBox = new CheckinBox(checkinType, this.signup.rowId);
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

function getRoomBadge(room) {
  const roomNum = String(room);
  if (roomNum === '1') {
    return ` <span class="badge text-bg-success room-badge">Room 1</span>`;
  }
  if (roomNum === '2') {
    return ` <span class="badge text-bg-danger room-badge">Room 2</span>`;
  }
  return '';
}

function getSignupTypeLabel(signup) {
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
