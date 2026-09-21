const url: string = window.location.href;
export const DEBUG: boolean = (url.indexOf('localhost') >= 0 || url.indexOf('127.0.0.1') >= 0);

export const getMockData = async(type: 'signup' | 'attendance' | 'admin'): Promise<string> => {
  const sampleDataImport = await import('../../sampledata');
  let sampleData: string;

  switch (type) {
    case 'admin':
      sampleData = sampleDataImport.adminData;
      break;
    case 'attendance':
      sampleData = sampleDataImport.attendanceData;
      break;
    case 'signup':
    default:
      sampleData = sampleDataImport.signupData;
  }

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  return sampleData;
}
