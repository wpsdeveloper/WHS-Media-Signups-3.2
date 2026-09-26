import * as dom from '../common/dom';
import { CHECKIN_CONFIG, CheckinBox } from '../common/checkin-box';
import { checkinStore } from './attendance-store';
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

    this.renderStudentName(element, vm.lastname, vm.firstname, vm.room)
    this.renderEditIcons(element, vm.userIsEditor, vm.rowId);
    this.renderType(element, vm.type, vm.typeDetails);
    this.renderStudyTeacher(element, vm.teacherStudy);
    this.renderComments(element, vm.comments);
    this.renderRoom(element, vm.room, vm.email);

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

  renderStudentName(element: HTMLElement, lastname: string, firstname: string, room: string) {
    const studentNameDiv = element.querySelector(
      '.student-name',
    ) as HTMLElement;
    if (studentNameDiv) {
      const roomBadge = getRoomBadge(room);
      dom.setHTML(
        studentNameDiv,
        `${lastname}, ${firstname}${roomBadge}`,
      );
    }
  }

  renderEditIcons(element: HTMLElement, userIsEditor: boolean, rowId: string) {
    const editIcons = element.querySelector('.edit-icons') as HTMLElement;
    if (editIcons) {
      dom.setVisible(editIcons, userIsEditor);

      if (userIsEditor) {
        const editLink = editIcons.querySelector(
          'a.edit-link',
        ) as HTMLAnchorElement;
        if (editLink) {
          const editUrl = `${editLink.href}&id=${rowId}`;
          dom.setAttribute(editLink, 'href', editUrl);
        }
      }
    } 
  }

  renderType(element: HTMLElement, type: string, typeDetails: string) {
    const typeLabel = getTypeLabel(type);
    const detailsLabel = typeDetails.length > 0 ? ` (${typeDetails})` : '';
    const typeDiv = element.querySelector('.type') as HTMLInputElement;
    if (typeDiv) dom.setText(typeDiv, `${typeLabel}${detailsLabel}`);
  }

  renderStudyTeacher(element: HTMLElement, teacherStudy: string) {
    const studyTeacherDiv = element.querySelector(
      '.study-teacher',
    ) as HTMLInputElement;
    if (studyTeacherDiv) {
      dom.setText(studyTeacherDiv, teacherStudy || '');
    }
  }

  renderComments(element: HTMLElement, comments: string) {
    const commentDiv = element.querySelector('.comments') as HTMLInputElement;
    if (commentDiv) dom.setText(commentDiv, comments || '');
  }

  renderRoom(element: HTMLElement, room: string, email: string) {
    const roomDiv = element.querySelector('.room') as HTMLInputElement;
    if (roomDiv) {
      const roomText = room
        ? `Glass Room ${room}, reserved by ${email}`
        : '';
      dom.setText(roomDiv, roomText);
    }
  }


  mountCheckinBoxes(element: HTMLElement) {
    const attendancePanel: HTMLElement = element.querySelector(
      '.attendance-info',
    ) as HTMLElement;
    const detailsPanel: HTMLElement = element.querySelector(
      '.details-info',
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

  handleEditClick() {}

  handleSaveClick() {}

  handleCancelClick() {}

  handleDeleteClick() {}
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

export type AttendanceDataRowViewModel = {
  room: string,
  firstname: string,
  lastname: string,
  rowId: string,
  teacherStudy: string,
  comments: string,
  typeDetails: string,
  type: string,
  roomText: string,
  rowIsStaff: boolean,
  userIsEditor: boolean,
  email: string,
  studyIn1: string, 
  studyIn2: string, 
  mediaIn: string, 
  mediaOut: string,
};
