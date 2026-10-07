/**
 * @file admin-data-row.ts
 * @description Manages rendering and view-model construction for admin audit table rows.
 */

import * as dom from '../common/dom';
import * as dates from '../common/dates';
import { store, checkinStore, AdminState } from "./admin-store";
import { CHECKIN_CONFIG, CheckinBox } from '../common/checkin-box';

/**
 * Interface representing the view model for an admin data row.
 */
export interface AdminDataRowViewModel {
  type: string;
  room: string;
  date: string;
  period: string;
  studentNameLabel: string;
  rowId: string;
  teacherStudy: string;
  comments: string;
  typeDetails: string;
  typeAndDetailsLabel: string;
  roomLabel: string;
  rowIsStaff: boolean;
  userIsEditor: boolean;
  userIsAdmin: boolean;
  editUrl: string;
  studyIn1: string;
  studyIn2: string;
  mediaIn: string;
  mediaOut: string;
}

/**
 * Class representing an individual admin table row component.
 */
export class AdminDataRow {
  viewModel: AdminDataRowViewModel;
  element: HTMLElement | null;
  
  /**
   * Constructs a new AdminDataRow.
   * 
   * @param viewModel - The view model containing row data.
   */
  constructor(viewModel: AdminDataRowViewModel) {
    this.viewModel = viewModel;
    this.element = this.getElement();
  }

  /**
   * Renders the row element, populates fields, and mounts check-in boxes.
   */
  render() {
    const vm = this.viewModel;
    const element = this.element;
    if (!element) return;

    element.removeAttribute('id');
    element.classList.add('data-row');

    dom.setHTML(element.querySelector('.signup-date'), vm.date || '');
    dom.setHTML(element.querySelector('.signup-period'), vm.period || '');
    dom.setHTML(element.querySelector('.student-name'), vm.studentNameLabel || '');
    dom.setText(element.querySelector('.type'), vm.typeAndDetailsLabel || '');
    dom.setText(element.querySelector('.study-teacher'), vm.teacherStudy || '');
    dom.setText(element.querySelector('.comments'), vm.comments || '');

    const editIcons = element.querySelector('.edit-icons') as HTMLElement | null;
    if (editIcons) {
      dom.setVisible(editIcons, vm.userIsEditor || vm.userIsAdmin);

      if (vm.userIsEditor) {
        const editLink = editIcons.querySelector('a.edit-link') as HTMLAnchorElement | null;
        if (editLink) {
          dom.setAttribute(editLink, 'href', vm.editUrl);
          dom.setAttribute(editLink, 'target', '_blank');
        }
      }

      // Add delete button for admins
      if (vm.userIsAdmin) {
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Delete';
        deleteBtn.className = 'btn btn-danger btn-sm ml-2';
        deleteBtn.onclick = () => {
          if (confirm('Are you sure you want to delete this signup?')) {
            // @ts-ignore - google.script.run is provided by the environment
            google.script.run
              .withSuccessHandler(() => {
                element.remove();
              })
              .deleteSignup(vm.rowId);
          }
        };
        editIcons.appendChild(deleteBtn);
      }
    }

    this.mountCheckinBoxes(element);
  }

  /**
   * Retrieves and clones the student row template.
   * 
   * @returns The cloned HTMLElement template.
   */
  getElement(): HTMLElement | null {
    const templateSelector = '#student-row-template';

    const template = dom.qs<HTMLTemplateElement>(templateSelector);
    if (!template?.content) {
      throw new Error(`${templateSelector} template not found`);
    }

    const clonedNode = template.content.cloneNode(true) as DocumentFragment;
    const firstChild = clonedNode.firstElementChild as HTMLElement;

    return firstChild || null;
  }

  /**
   * Mounts check-in boxes into their respective containers within the row.
   * 
   * @param element - The row HTMLElement.
   */
  mountCheckinBoxes(element: HTMLElement) {
    const attendancePanel = element.querySelector('.attendance-info') as HTMLElement | null;
    if (!attendancePanel) return;

    (Object.keys(CHECKIN_CONFIG) as CheckinType[]).forEach((type) => {
      const propName = CHECKIN_CONFIG[type].propName;
      const panel = attendancePanel.querySelector(`div[data-type="${String(type)}"]`);
      if (panel) {
        const rowId = this.viewModel.rowId;
        const timeValue = this.viewModel[propName];
        const isEditor = this.viewModel.userIsEditor;

        const checkinBox = new CheckinBox(type, rowId, timeValue, checkinStore, isEditor);

        panel.innerHTML = ''; // Ensure container is clean before appending
        if (checkinBox.element) {
          panel.append(checkinBox.element);
          checkinBox.render();
        }
      }
    });
  }
}

/**
 * Creates an AdminDataRowViewModel from a signup record and admin state.
 * 
 * @param signup - The Signup record.
 * @param state - The current AdminState.
 * @returns The populated AdminDataRowViewModel.
 */
export const makeDataRowViewModel = (
  signup: Signup,
  state: AdminState
): AdminDataRowViewModel => {
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
  const userIsAdmin = state.isAdmin;
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

  const studentNameLabel = `${lastname}, ${firstname}`;

  const date = dates.formatDateSlashes(signup.date);
  const period = signup?.period === "Wed. PM Int." ? signup.period : "Period " + signup.period;

  return {
    type,
    date,
    period,
    room,
    studentNameLabel,
    rowId,
    teacherStudy,
    comments,
    typeDetails,
    rowIsStaff,
    userIsEditor,
    userIsAdmin,
    editUrl,
    typeAndDetailsLabel,
    roomLabel,
    studyIn1,
    studyIn2,
    mediaIn,
    mediaOut,
  };
};

/**
 * Returns a human-readable label for a signup type.
 * 
 * @param type - The signup type string.
 * @returns Formatted type label.
 */
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

/**
 * Extracts specific detail strings based on signup type.
 * 
 * @param signup - The Signup record.
 * @returns Details string for the signup.
 */
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
