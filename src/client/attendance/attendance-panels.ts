import * as dom from "../common/dom";
import { AttendanceState, store } from "./attendance-store";

export type PanelView = AttendanceState["ui_currentView"];

interface PanelConfig {
  headerSelector: string;
  panelSelector?: string;
  sliderVisible: boolean;
}

const PANEL_CONFIGS: Record<PanelView, PanelConfig> = {
  attendance: {
    headerSelector: ".attendance-panel-link",
    panelSelector: ".attendance-info",
    sliderVisible: true,
  },
  details: {
    headerSelector: ".details-panel-link",
    panelSelector: ".details-info",
    sliderVisible: true,
  },
  list: {
    headerSelector: ".list-panel-link",
    sliderVisible: false,
  },
};

/**
 * Subscriber: Updates panel visibility and tab highlights when the active view changes.
 */
export const initObservers = () => {
  store.subscribe((state: AttendanceState) => {
    setPanelView(state.ui_currentView);
  }, ["ui_currentView"]);
};

/**
 * Updates DOM to show either attendance info, details info, or collapsed list view.
 */
export const setPanelView = (view: PanelView) => {
  const config = PANEL_CONFIGS[view] ?? PANEL_CONFIGS.attendance;

  dom.setVisible(".slider-wrapper", config.sliderVisible);
  dom.setVisible(".panel", false);

  if (config.panelSelector) {
    dom.setVisible(config.panelSelector, true);
  }

  dom.qsa(".panel-link").forEach((link) => link.classList.remove("active"));
  dom.qs(config.headerSelector)?.classList.add("active");
};

/**
 * Dispatches active panel view changes to store.
 */
export const panelViewListener = (view: PanelView) => {
  store.setState({ ui_currentView: view });
};
