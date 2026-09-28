/**
 * @file app-config.ts
 * @description Provides application configuration retrieval and dynamic script link updating.
 */

import { IS_DEBUG, getMockAppConfig } from './debug';
import * as dom from './dom';

/**
 * Retrieves the application configuration object, using mock configuration in debug mode.
 * 
 * @returns A promise resolving to the AppConfig object.
 * @throws Error if server data cannot be retrieved and IS_DEBUG is false.
 */
export async function getAppConfig(): Promise<AppConfig> {
  if (IS_DEBUG) {
    return await getMockAppConfig();
  }
  const appConfig = window.APP_CONFIG;
  if (!appConfig) throw new Error("Error retrieveing server data: ");
  return appConfig;
}

/**
 * Updates DOM script links using the active script URL from application configuration.
 */
export const updateScriptLinks = async () => {
  const appConfig = await getAppConfig();
  const scriptUrl = appConfig.scriptUrl;
  if (!scriptUrl || scriptUrl === '#') return;

  dom.qsa('.script-link').forEach(link => {
    const href= link.getAttribute("href");
    if (href && !href.startsWith(scriptUrl)) {
      link.setAttribute("href", `${scriptUrl}${href}`);
    }
  });
}
