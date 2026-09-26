import * as dom from '../common/dom';
import { CHECKIN_CONFIG, CheckinBox, CheckinType } from '../common/checkin-box';
import { AttendanceState, checkinStore } from './attendance-store';
import { getRoomBadge } from './glass-rooms-status';

export interface AttendanceDataRowViewModel {
  type: string;
  room: string;
  studentNameLabel: string;
  rowId: string;
  teacherStudy: string;
  comments: string;
  typeDetails: string;
  typeAndDetailsLabel: string;
  roomLabel: string;
  rowIsStaff: boolean;
  userIsEditor: boolean;
  editUrl: string;
  studyIn1: string;
  studyIn2: string;
  mediaIn: string;
  mediaOut: string;
}

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

    const editIcons = element.querySelector('.edit-icons') as HTMLElement | null;
    if (editIcons) {
      dom.setVisible(editIcons, vm.userIsEditor);

      if (vm.userIsEditor) {
        const editLink = editIcons.querySelector('a.edit-link') as HTMLAnchorElement | null;
        if (editLink) {
          dom.setAttribute(editLink, 'href', vm.editUrl);
          dom.setAttribute(editLink, 'target', '_blank');
        }
      }
    }

    this.mountCheckinBoxes(element);
  }

  getElement(rowIsStaff: boolean): HTMLElement | null {
    const templateSelector = rowIsStaff ? '#staff-row-template' : '#student-row-template';

    const template = dom.qs<HTMLTemplateElement>(templateSelector);
    if (!template?.content) {
      throw new Error(`${templateSelector} template not found`);
    }

    const clonedNode = template.content.cloneNode(true) as DocumentFragment;
    const firstChild = clonedNode.firstElementChild as HTMLElement;

    return firstChild || null;
  }

  mountCheckinBoxes(element: HTMLElement) {
    const attendancePanel = element.querySelector('.attendance-info') as HTMLElement | null;
    if (!attendancePanel) return;

    (Object.keys(CHECKIN_CONFIG) as CheckinType[]).forEach((type) => {
      const propName = CHECKIN_CONFIG[type].propName;
      const panel = attendancePanel.querySelector(`div[data-type="${type}"]`);
      if (panel) {
        const rowId = this.viewModel.rowId;
        const timeValue = this.viewModel[propName];

        const checkinBox = new CheckinBox(type, rowId, timeValue, checkinStore);

        panel.innerHTML = ''; // Ensure container is clean before appending
        if (checkinBox.element) {
          panel.append(checkinBox.element);
          checkinBox.render();
        }
      }
    });
  }
}

export const makeDataRowViewModel = (
  signup: Signup,
  state: AttendanceState
): AttendanceDataRowViewModel => {
  const {
    type = '',
    firstname = '',
    lastname = '',
    rowId = '',
    teacherStudy = '',
    comments = '',
    email = '',
    studyIn1 = '',
    studyIn2 = '',
    mediaIn = '',
    mediaOut = '',
  } = signup;

  const rowIsStaff = type === 'Staff reservation';
  const userIsEditor = state.isEditor;
  const scriptUrl = state.appConfig?.scriptUrl || '';
  const separator = scriptUrl.includes('?') ? '&' : '?';
  const editUrl = scriptUrl
    ? `${scriptUrl}${separator}page=update&id=${rowId}`
    : `?page=update&id=${rowId}`;

  const typeDetails = getSignupTypeDetails(signup);
  const typeLabel = getTypeLabel(type);
  const detailsLabel = typeDetails.length > 0 ? ` (${typeDetails})` : '';
  const typeAndDetailsLabel = `${typeLabel}${detailsLabel}`;

  const room = signup.room ? String(signup.room).trim() : '';
  const roomLabel = room ? `Glass Room ${room}, reserved by ${email}` : '';

  const roomBadge = getRoomBadge(room);
  const studentNameLabel = `${lastname}, ${firstname}${roomBadge}`;

  return {
    type,
    room,
    studentNameLabel,
    rowId,
    teacherStudy,
    comments,
    typeDetails,
    rowIsStaff,
    userIsEditor,
    editUrl,
    typeAndDetailsLabel,
    roomLabel,
    studyIn1,
    studyIn2,
    mediaIn,
    mediaOut,
  };
};

const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'Intervention':
    case 'Alt setting':
    case 'Non-intervention':
    case 'Staff reservation':
      return type;
    case 'Assessment':
      return 'Assessment make-up';
    case 'Tutoring':
      return 'NHS Tutoring';
    default:
      return '';
  }
};

function getSignupTypeDetails(signup: Signup): string {
  switch (signup.type) {
    case 'Intervention':
    case 'Tutoring':
      return signup.subject || '';
    case 'Assessment':
    case 'Alt setting':
      return signup.teacherAcad || '';
    case 'Non-intervention':
      return `${signup.purpose || ''}/${signup.teacherAcad || ''}`;
    case 'Staff reservation':
      return '';
    default:
      return '';
  }
}
