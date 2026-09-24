import { IS_DEBUG } from './debug';
import * as dom from './dom';

export function getAppConfig(): AppConfig {
  if (IS_DEBUG) {
    return {
      view: 'signup', 
      wedInt: true,
      s2Date: '2026-01-25',
      isEditor: true,
      isAdmin: true,
      isStaff: true,
      email: 'wpsdeveloper@walpole.k12.ma.us',
      scriptUrl: '#',
    };
  }
  console.log('window.APP_CONFIG', window.APP_CONFIG);
  return window.APP_CONFIG;
}

export interface AppConfig {
  view: 'signup' | 'attendance' | 'admin',
  wedInt: boolean,
  s2Date: string,
  isEditor: boolean,
  isAdmin: boolean,
  isStaff: boolean,
  email: string,
  scriptUrl: string,
}

export const updateScriptLinks = () => {
  const scriptUrl = getAppConfig().scriptUrl;
  if (!scriptUrl) return;

  dom.qsa('.script-link').forEach(link => {
    const href= link.getAttribute("href");
    link.setAttribute("href", `${scriptUrl}${href}`);
  });
}