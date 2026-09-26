import * as dom from '../common/dom';
import { SignupState, store } from './signup-store';

export interface TypeAvailability {
  intervention: boolean;
  assessment: boolean;
  tutoring: boolean;
  nonIntervention: boolean;
  altSetting: boolean;
}

/**
 * Pure calculation: Evaluates which signup types are permitted based on schedule block rules.
 */
export function getTypeAvailability(currentScheduleBlock: DailyBlock | null): TypeAvailability {
  if (!currentScheduleBlock) {
    return {
      intervention: true,
      assessment: true,
      tutoring: true,
      nonIntervention: true,
      altSetting: true,
    };
  }

  const periodIsWedInt = currentScheduleBlock.period === 'Wed. PM';

  return {
    intervention: Boolean(currentScheduleBlock.allowInterventions),
    assessment: Boolean(currentScheduleBlock.allowAssessmentMakeups && !periodIsWedInt),
    tutoring: Boolean(currentScheduleBlock.allowTutoring && !periodIsWedInt),
    altSetting: Boolean(currentScheduleBlock.allowAltSetting),
    nonIntervention: Boolean(currentScheduleBlock.allowNonInterventions || periodIsWedInt),
  };
}

/**
 * Event Handler: Responds to user selection change in the signup type dropdown.
 */
export const typeChangeHandler = (event?: Event) => {
  const target = event?.target as HTMLSelectElement | undefined;
  const selectedType = (target?.value ?? dom.valueOf('#type-select')) as SignupType;
  store.setState({ ui_currentType: selectedType });
};

/**
 * DOM View: Enables or disables individual type options in the type select element.
 */
export const toggleInterventions = (allow: boolean) => {
  dom.setDisabled('#type-select option[value="Intervention"]', !allow);
};

export const toggleAssessmentMakeups = (allow: boolean) => {
  dom.setDisabled('#type-select option[value="Assessment"]', !allow);
};

export const toggleAltSetting = (allow: boolean) => {
  dom.setDisabled('#type-select option[value="Alt setting"]', !allow);
};

export const toggleTutoring = (allow: boolean, _message?: string) => {
  dom.setDisabled('#type-select option[value="Tutoring"]', !allow);
};

export const toggleNonInterventions = (allow: boolean, _message?: string) => {
  dom.setDisabled('#type-select option[value="Non-intervention"]', !allow);
};

/**
 * DOM View: Updates option disabled states based on computed availability.
 */
export const updateTypeAvailabilityUi = (availability: TypeAvailability) => {
  toggleInterventions(availability.intervention);
  toggleAssessmentMakeups(availability.assessment);
  toggleTutoring(availability.tutoring);
  toggleAltSetting(availability.altSetting);
  toggleNonInterventions(availability.nonIntervention);
};

/**
 * Static Link Helpers: Shows or hides links if configured.
 */
export const toggleInterventionsLink = () => {
  const show = (dom.getAttribute('.int-link', 'href') || '').length > 58;
  dom.setVisible('.int-link', show);
};

export const toggleTutoringLink = () => {
  const show = (dom.getAttribute('.tut-link', 'href') || '').length > 58;
  dom.setVisible('.tut-link', show);
};

/**
 * Observer / Subscriber: Coordinates UI synchronization with state changes.
 */
export const setupTypeInputObserver = () => {
  // Syncs #type-select dropdown with current store type
  store.subscribe(
    (state: SignupState) => {
      const selectElem = dom.qs('#type-select') as HTMLSelectElement | null;
      if (selectElem && state.ui_currentType && selectElem.value !== state.ui_currentType) {
        dom.setValue('#type-select', state.ui_currentType);
      }
    },
    ['ui_currentType']
  );

  // Updates option permissions whenever the active schedule block changes
  store.subscribe(
    (state: SignupState) => {
      const availability = getTypeAvailability(state.ui_currentScheduleBlock);
      updateTypeAvailabilityUi(availability);
    },
    ['ui_currentScheduleBlock']
  );
};
