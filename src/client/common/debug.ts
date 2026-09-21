export const IS_DEBUG: boolean = import.meta.env.DEV;

export const getMockData = async(type: 'signup' | 'attendance' | 'admin' | 'audit'): Promise<string> => {
  if (!import.meta.env.DEV) return "";
  
  const mockPath = `../sampledata.ts`;
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
