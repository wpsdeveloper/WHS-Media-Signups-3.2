import * as dom from "../common/dom"
import { SignupState, store } from './signup-store';

// Maps state.currentType values to their corresponding CSS class selectors
const PANEL_MAP = {
  'Intervention': '.intervention-only',
  'Assessment': '.assessment-only',
  'Tutoring': '.tutoring-only',
  'Non-intervention': '.non-intervention-only',
  'Alt setting': '.alt-setting-only',
  'Staff reservation': '.staff-reservation-only'
};

/**
 * Hides all type-specific detail panel containers.
 */
export const hideTypes = () => {
  dom.setVisible(
    ".intervention-only, .assessment-only, .tutoring-only, .non-intervention-only, .alt-setting-only, .staff-reservation-only",
    false
  );
};

/**
 *  Updates the Details section of the form based on which Type is selected 
 * */
export const updateDetailsPanel = (currentType: SignupType | null) => {
  hideTypes();

  if (!currentType) return;

  const targetSelector = PANEL_MAP[currentType];
  if (targetSelector) {
    dom.setVisible(targetSelector, true);
  }
}

/**
 * Subscriber: Automatically updates panel visibilities when state.currentType changes.
 */
export const setupPanelsObserver = () => {
  store.subscribe((state: SignupState) => {
    updateDetailsPanel(state.ui_currentType);
  }, ['ui_currentType']);
};
