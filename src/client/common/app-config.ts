import { IS_DEBUG, getMockAppConfig } from './debug';
import * as dom from './dom';

export async function getAppConfig(): Promise<AppConfig> {
  if (IS_DEBUG) {
    return await getMockAppConfig();
  }
  console.log('window.APP_CONFIG', window.APP_CONFIG);
  return await window.APP_CONFIG;
}

export const updateScriptLinks = async () => {
  const appConfig = await getAppConfig();
  const scriptUrl = appConfig.scriptUrl;
  if (!scriptUrl) return;

  dom.qsa('.script-link').forEach(link => {
    const href= link.getAttribute("href");
    link.setAttribute("href", `${scriptUrl}${href}`);
  });
}