/**
 * @file debug.ts
 * @description Provides environment debug flags and mock data loading utilities for standalone development mode.
 */

/**
 * Flag indicating whether the application is running in development/debug mode.
 */
export const IS_DEBUG: boolean = import.meta.env.DEV;
const mockPath = `./sampledata.ts`;

/**
 * Retrieves mock data for the specified data type for development purposes.
 * @param type The type of data to retrieve ('signup', 'attendance', 'admin', or 'audit').
 * @returns A promise that resolves to the mock data string.
 */
export const getMockData = async(type: 'signup' | 'attendance' | 'admin' | 'audit'): Promise<string> => {
  if (!import.meta.env.DEV) return "";
  
  const sampleDataImport = await import(/* @vite-ignore */ mockPath);
  let sampleData: string;

  switch (type) {
    case 'admin':
      sampleData = sampleDataImport.adminData;
      break;
    case 'attendance':
      sampleData = sampleDataImport.attendanceData;
      break;
    case 'audit':
      sampleData = sampleDataImport.auditData;
      break;
    case 'signup':
    default:
      sampleData = sampleDataImport.signupData;
  }

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  return sampleData;
}

/**
 * Retrieves the mock application configuration.
 * @returns A promise that resolves to the mock AppConfig.
 */
export const getMockAppConfig = async(): Promise<AppConfig> => {
  const sampleDataImport = await import(/* @vite-ignore */ mockPath);
  return sampleDataImport.appConfig;
}
