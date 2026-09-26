import * as dom from "../common/dom";
import { parseDateInput, isSameDate } from "../common/dates";
import { AttendanceState, store } from "./attendance-store";
import { updatePeriodOptions } from "../common/period-select";
import { AttendanceDataRowViewModel, AttendanceDataRow as DataRow } from "./attendance-data-row";
import { getRoomBadge } from "./glass-rooms-status";
import { appConfig } from "../common/sampledata";

export const initObservers = () => {
  // Updates the view panels when the datarows change
  store.subscribe((state: AttendanceState) => {
    setPanelView(state.ui_currentView);
  }, ["ui_dataRows", "ui_currentView"]);
}

export const setPanelView = (view: AttendanceState['ui_currentView']) => {
  const panelClassNames: Record<AttendanceState['ui_currentView'], string> = {
    'attendance': '.attendance-info',
    'details': '.details-info',
    'list': '.list-info-null',
  }
  const headerClassNames: Record<AttendanceState['ui_currentView'], string> = {
    'attendance': '.attendance-panel-link',
    'details': '.details-panel-link',
    'list': '.list-panel-link',
  }
  const newPanel: string = panelClassNames[view];
  const newHeader: string = headerClassNames[view];
  const sliderVisible = view !== 'list';
  
  dom.setVisible(".slider-wrapper", sliderVisible);
  dom.setVisible('.panel', false);
  dom.setVisible(newPanel, true)
  
  // updates the header
  dom.qsa(".panel-link").forEach(panel => panel.classList.remove('active'));
  dom.qs(newHeader)?.classList.add('active');
}

export const panelViewListener = (view: string) => {
  store.setState({ ui_currentView: view as AttendanceState['ui_currentView'] });
}
