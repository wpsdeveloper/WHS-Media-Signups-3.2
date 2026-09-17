import * as dom from "../common/dom"
import { SignupState, store } from "../common/store";

/**
*  Responds to a change in the Type field 
* */
export const typeChangeHandler = (event: MouseEvent) => {
  if (!event) return;
  const target = event.target as HTMLInputElement;
  const selectedType = target.value;
  store().setState({ currentType: selectedType });
};

/**
 * Helper Utilities: DOM UI resets and state indicators
*/
export const resetAllTypes = () => {
  dom.setDisabled(`input[name='signup-type'], input[name='purpose']`, false);
  dom.setVisible('span.type-warning', false);
}

export const disableInterventions = () => {
  dom.setDisabled("input#intervention", true);
  dom.setChecked("input#intervention", false);
  dom.setVisible("label[for='intervention'] span.type-warning", true);
  dom.setText("label[for='intervention'] span.type-warning", "Not available");
}

export const disableAssessmentMakeups = () => {
  dom.setDisabled("input#assessment", true);
  dom.setChecked("input#assessment", false);
  dom.setVisible("label[for='assessment'] span.type-warning", true);
  dom.setText("label[for='assessment'] span.type-warning", "Not available");
}

export const disableAltSetting = () => {
  dom.setDisabled("input#alt-setting", true);
  dom.setChecked("input#alt-setting", false);
  dom.setVisible("label[for='alt-setting'] span.type-warning", true);
  dom.setText("label[for='alt-setting'] span.type-warning", "Not available");
}

export const disableTutoring = () => {
  dom.setDisabled("input#tutoring", true);
  dom.setChecked("input#tutoring", false);
  dom.setVisible("label[for='tutoring'] span.type-warning", true);
  dom.setText("label[for='tutoring'] span.type-warning", "Not available");
}

export const disableWednesdayInterventions = () => {
  dom.setDisabled("input#non-intervention", true);
  dom.setChecked("input#non-intervention", false);
  dom.setVisible("label[for='non-intervention'] span.type-warning", true);
  dom.setText("label[for='non-intervention'] span.type-warning", "Not available");
}

export const disableNonInterventions = () => {
  dom.setDisabled("input#non-intervention", true);
  dom.setChecked("input#non-intervention", false);
  dom.setDisabled("input[name='purpose']", true);
  dom.setChecked("input[name='purpose']", false);
  dom.setVisible("label[for='purpose'] span.type-warning", true);
  dom.setText("label[for='purpose'] span.type-warning", "Not available");
}

export const toggleInterventionsLink = () => {
  const isVisible = (dom.getAttribute('.int-link', 'href') || '').length > 58;
  dom.setVisible('.int-link', isVisible);
}

export const toggleTutoringLink = () => {
  const isVisible = (dom.getAttribute('.tut-link', 'href') || '').length > 58;
  dom.setVisible('.tut-link', isVisible);
}

/**
 * Subscriber: Keeps input selections synchronized with state.currentType.
 */
export const setupTypeInputObserver = () => {
  store().subscribe((state: SignupState) => {
    if (state.currentType) {
      const radio = dom.qs(`input[name='signup-type'][value='${state.currentType}']`) as HTMLInputElement;
      if (radio) {
        dom.setChecked(radio, true);
      }
    }
  }, ['currentType']);
};


 

