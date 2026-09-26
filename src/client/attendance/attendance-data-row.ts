import * as dom from '../common/dom';
import { CHECKIN_CONFIG, CheckinBox } from '../common/checkin-box';
import { AttendanceState, checkinStore } from './attendance-store';
import { getRoomBadge } from './glass-rooms-status';

export class AttendanceDataRow {
  viewModel: AttendanceDataRowViewModel;
  element: HTMLElement | null;

  constructor(viewModel: AttendanceDataRowViewModel) {
    this.viewModel = viewModel;
    this.element = this.getElement(viewModel.rowIsStaff);
  }

  render() {
    const vm = this.viewModel;
    const element = this.element;
    if (!element) return;
    
    element.removeAttribute('id');
    element.classList.add('data-row');
    
    dom.setHTML(element.querySelector('.student-name'), vm.studentNameLabel || '');
    dom.setText(element.querySelector('.type'), vm.typeAndDetailsLabel || '');
    dom.setText(element.querySelector('.study-teacher'), vm.teacherStudy || '');
    dom.setText(element.querySelector('.comments'), vm.comments || '');
    dom.setText(element.querySelector('.room'), vm.roomLabel);

    const editIcons = element.querySelector('.edit-icons') as HTMLElement;
    if (editIcons) {
      dom.setVisible(editIcons, vm.userIsEditor);

      if (vm.userIsEditor) {
        const editLink = editIcons.querySelector(
          'a.edit-link',
        ) as HTMLAnchorElement;
        if (editLink) {
          dom.setAttribute(editLink, 'href', vm.editUrl);
        }
      }
    } 

    this.mountCheckinBoxes(element);
  }

  getElement(rowIsStaff: boolean): HTMLElement | null {
    const templateSelector = rowIsStaff
    ? '#staff-row-template'
      : '#student-row-template';

    const template = dom.qs<HTMLTemplateElement>(templateSelector); // clone the template
    if (!template?.content)
      throw new Error(`${templateSelector} template not found`);

    const clonedNode = template.content.cloneNode(true) as DocumentFragment;
    const firstChild = clonedNode.firstElementChild as HTMLElement;
    
    return firstChild || null;
  }

  mountCheckinBoxes(element: HTMLElement) {
    const attendancePanel: HTMLElement = element.querySelector(
      '.attendance-info',
    ) as HTMLElement;
    
    if (!attendancePanel) return;

    const checkinType = Object.keys(CHECKIN_CONFIG);
    checkinType.forEach((type) => {
      const propName = CHECKIN_CONFIG[type].propName;
      const panel = attendancePanel.querySelector(`div[data-type="${type}"]`);
      if (panel) {
        const rowId = this.viewModel.rowId;
        const timeValue = this.viewModel[propName];

        const checkinBox = new CheckinBox(
          type,
          rowId,
          timeValue,
          checkinStore,
        );

        panel.innerHTML = ''; // Ensure container is clean before appending
        panel.append(checkinBox.element as HTMLElement);
        checkinBox.render();
      }
    });
  }

  handleDeleteClick() {}
}

export type AttendanceDataRowViewModel = {
  room: string,
  studentNameLabel: string,
  rowId: string,
  teacherStudy: string,
  comments: string,
  typeAndDetailsLabel: string,
  type: string,
  roomLabel: string,
  rowIsStaff: boolean,
  userIsEditor: boolean,
  editUrl: string,
  studyIn1: string, 
  studyIn2: string, 
  mediaIn: string, 
  mediaOut: string,
};


export const makeDataRowViewModel = (signup: Signup, state: AttendanceState): AttendanceDataRowViewModel => {
  const { type, firstname, lastname, rowId, teacherStudy, comments, email, studyIn1, studyIn2, mediaIn, mediaOut } = signup;
  
  const rowIsStaff = signup.type === 'Staff reservation';
  const userIsEditor = state.isEditor;
  const scriptUrl = state.appConfig?.scriptUrl || "#";
  const editUrl = `${scriptUrl}&id=${rowId}`;

  const typeDetails = getSignupTypeDetails(signup) || "";
  const typeLabel = getTypeLabel(type);
  const detailsLabel = typeDetails.length > 0 ? ` (${typeDetails})` : '';
  const typeAndDetailsLabel = `${typeLabel}${detailsLabel}`;
  
  const room = String(signup.room);
  const roomLabel = room
        ? `Glass Room ${room}, reserved by ${email}`
        : '';

  const roomBadge = getRoomBadge(room);
  const studentNameLabel = `${lastname}, ${firstname}${roomBadge}`;


    return {
      type, room, studentNameLabel, rowId, teacherStudy, comments, typeDetails, rowIsStaff, userIsEditor, 
      editUrl, typeAndDetailsLabel, roomLabel, studyIn1, studyIn2, mediaIn, mediaOut,
    } as AttendanceDataRowViewModel;
}


const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'Intervention':
    case 'Alt setting':
    case 'Non-intervention':
    case 'Staff reservation':
      return String(type);
    case 'Assessment':
      return 'Assessment make-up';
    case 'Tutoring':
      return 'NHS Tutoring';
    default:
      return '';
  }
};

function getSignupTypeDetails(signup: Signup) {
  switch (signup.type) {
    case 'Intervention':
    case 'Tutoring':
      return signup.subject;
    case 'Assessment':
      case 'Alt setting':
      return signup.teacherAcad;
    case 'Non-intervention':
      return `${signup.purpose}/${signup.teacherAcad})`;
    case 'Staff reservation':
      return '';
    default:
  }
}

