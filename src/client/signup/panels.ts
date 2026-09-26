import * as dom from "../common/dom";
import { SignupState, store } from './signup-store';

/**
 * Maps SignupType values to their corresponding CSS class selectors.
 */
export const PANEL_MAP: Record<SignupType, string> = {
  'Intervention': '.intervention-only',
  'Assessment': '.assessment-only',
  'Tutoring': '.tutoring-only',
  'Non-intervention': '.non-intervention-only',
  'Alt setting': '.alt-setting-only',
  'Staff reservation': '.staff-reservation-only',
};

export const ALL_TYPE_PANELS_SELECTOR =
  ".intervention-only, .assessment-only, .tutoring-only, .non-intervention-only, .alt-setting-only, .staff-reservation-only";

/**
 * Pure calculation: Returns the CSS selector for a given signup type, or null if unknown/empty.
 */
export function getPanelSelectorForType(type: SignupType | null | undefined): string | null {
  if (!type) return null;
  return PANEL_MAP[type] ?? null;
}

/**
 * Hides all type-specific detail panel containers.
 */
export const hideTypes = () => {
  dom.setVisible(ALL_TYPE_PANELS_SELECTOR, false);
};

/**
 * UI View: Shows the appropriate panel for a given type while ensuring all others are hidden.
 */
export const showPanelForType = (currentType: SignupType | null | undefined) => {
  hideTypes();

  const targetSelector = getPanelSelectorForType(currentType);
  if (targetSelector) {
    dom.setVisible(targetSelector, true);
  }
};

/**
 * Orchestrator: Updates the Details section of the form based on which Type is selected.
 */
export const updateDetailsPanel = (currentType: SignupType | null | undefined) => {
  showPanelForType(currentType);
};

/**
 * Subscriber: Automatically updates panel visibilities when state.ui_currentType changes.
 */
export const setupPanelsObserver = () => {
  store.subscribe((state: SignupState) => {
    updateDetailsPanel(state.ui_currentType);
  }, ['ui_currentType']);
};
