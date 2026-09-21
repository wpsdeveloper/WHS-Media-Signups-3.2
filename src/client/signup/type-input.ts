import * as dom from '../common/dom';
import { SignupState, store } from './signup-store';

/**
 *  Responds to a change in the Type field
 * */
export const typeChangeHandler = (event: MouseEvent) => {
  if (!event) return;
  const target = event.target as HTMLSelectElement;
  const selectedType = target.value as SignupType;
  store.setState({ currentType: selectedType });
};

/**
 * Helper Utilities: DOM UI resets and state indicators
 */
export const resetAllTypes = () => {
  dom.setDisabled(`input[name='signup-type'], input[name='purpose']`, false);
  dom.setVisible('span.type-warning', false);
};

export const toggleInterventions = (show: boolean, message?: string) => {
  dom.setDisabled('input[value="intervention"]', !show);
  // if (!show) {
  //   // dom.setChecked('input[value="Intervention"]', false);
  //   dom.setVisible("label[for='intervention'] span.type-warning", true);
  //   dom.setText(
  //     "label[for='intervention'] span.type-warning",
  //     message || 'Not available',
  //   );
  // }
};

export const toggleAssessmentMakeups = (show: boolean, message?: string) => {
  dom.setDisabled('input[value="assessment"]', !show);
  // if (!show) {
  //   // dom.setChecked('input[value="assessment', false);
  //   dom.setVisible("label[for='assessment'] span.type-warning", true);
  //   dom.setText(
  //     "label[for='assessment'] span.type-warning",
  //     message || 'Not available',
  //   );
  // }
};

export const toggleAltSetting = (show: boolean, message?: string) => {
  dom.setDisabled('input[value="alt-setting"]', !show);
  // if (!show) {
  //   // dom.setChecked('input#alt-setting', false);
  //   dom.setVisible("label[for='alt-setting'] span.type-warning", true);
  //   dom.setText(
  //     "label[for='alt-setting'] span.type-warning",
  //     message || 'Not available',
  //   );
  // }
};

export const toggleTutoring = (show: boolean, message?: string) => {
  dom.setDisabled('input[value="Tutoring"]', !show);
  // if (!show) {
  //   // dom.setChecked('input#tutoring', false);
  //   dom.setVisible("label[for='tutoring'] span.type-warning", true);
  //   dom.setText(
  //     "label[for='tutoring'] span.type-warning",
  //     message || 'Not available',
  //   );
  // }
};

export const toggleWednesdayInterventions = (
  show: boolean,
  message?: string,
) => {
  dom.setDisabled('input#non-intervention', !show);
  // if (!show) {
  //   // dom.setChecked('input#non-intervention', false);
  //   dom.setVisible("label[for='non-intervention'] span.type-warning", true);
  //   dom.setText(
  //     "label[for='non-intervention'] span.type-warning",
  //     message || 'Not available',
  //   );
  // }
};

export const toggleNonInterventions = (show: boolean, message?: string) => {
  dom.setDisabled("input#non-intervention, input[name='purpose']", !show);
  // if (!show) {
  //   dom.setChecked("input#non-intervention, input[name='purpose'", false);
  //   dom.setVisible("label[for='purpose'] span.type-warning", true);
  //   dom.setText(
  //     "label[for='purpose'] span.type-warning",
  //     message || 'Not available',
  //   );
  // }
};

export const toggleInterventionsLink = () => {
  const show = (dom.getAttribute('.int-link', 'href') || '').length > 58;
  dom.setVisible('.int-link', show);
};

export const toggleTutoringLink = () => {
  const show = (dom.getAttribute('.tut-link', 'href') || '').length > 58;
  dom.setVisible('.tut-link', show);
};

/**
 * Subscriber: Keeps input selections synchronized with state.currentType.
 */
export const setupTypeInputObserver = () => {
  // sets ui to already existing data
  store.subscribe(
    (state: SignupState) => {
      if (state.currentType) {
        const radio = dom.qs(
          `input[name='signup-type'][value='${state.currentType}']`,
        ) as HTMLInputElement;
        if (radio) {
          dom.setChecked(radio, true);
        }
      }
    },
    ['currentType'],
  );

  // toggles available type choices based on special rules
  store.subscribe(
    (state: SignupState) => {
      resetAllTypes();  
      const currentScheduleBlock = state.currentScheduleBlock;
        if (!currentScheduleBlock ) return;
      
        // enables Wed PN Int is the period was set to it already. 
        // This is for the update existing signup procedure
        const periodIsWedInt = (currentScheduleBlock.period === "Wed. PM");
        if (periodIsWedInt) toggleWednesdayInterventions(periodIsWedInt);
        
        // for the IF statements below ANY text value counts as "not allowed".
        // if not allowed, disables the check, unchecks, and adds a label warning
        toggleInterventions(currentScheduleBlock.allowInterventions);
        toggleAssessmentMakeups(currentScheduleBlock.allowAssessmentMakeups && !periodIsWedInt);
        toggleAltSetting(currentScheduleBlock.allowAltSetting);
        toggleTutoring(currentScheduleBlock.allowTutoring && !periodIsWedInt);
        toggleNonInterventions(currentScheduleBlock.allowNonInterventions || periodIsWedInt);
    },['currentType']);
};
