import { IS_DEBUG, getMockAppConfig } from './debug';
import * as dom from './dom';

export async function getAppConfig(): Promise<AppConfig> {
  const appConfig = window.APP_CONFIG;
  if (!appConfig) throw new Error("Error retrieveing server data: ");
  return IS_DEBUG ? await getMockAppConfig(): appConfig;
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