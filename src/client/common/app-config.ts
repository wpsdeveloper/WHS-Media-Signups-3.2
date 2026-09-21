import { IS_DEBUG } from './debug';

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
    };
  }
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
}