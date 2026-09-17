import { DEBUG } from './debug';

let appConfig: AppConfig | null = null;

export const initAppConfig = async (): Promise<void> => {
  if (!appConfig) {
    //assume debugging if page is served locally
    return new Promise(async () => {
      if (DEBUG) {
        appConfig = {
          view: 'signup', 
          wedInt: true,
          s2Date: '2026-01-25',
          isEditor: true,
          isAdmin: true,
          isStaff: true,
          email: 'wpsdeveloper@walpole.k12.ma.us',
        };
      } else {
        appConfig = await getAppConfigFromServer();
      }
    });
  }
}

export function getAppConfig(): AppConfig {
  if (!appConfig) throw new Error("getConfig() cannot be called before initAppConfig() is completed");
  return appConfig;
}

async function getAppConfigFromServer(): Promise<AppConfig> {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      .getAppConfig();
  })
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