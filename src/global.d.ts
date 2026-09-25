declare global {
  declare module '*?raw' {
    const content: string;
    export default content;
  }

  declare module '*.html' {
    const content: string;
    export default content;
  }

  interface Window {
    bootstrap: typeof import('bootstrap');
    APP_CONFIG: AppConfig,
  }

  // Extend Google Apps Script's official type namespace
  namespace google.script {
    const run: TypedScriptRun;
  }
}

interface ServerFunctions {
  // Example: server function taking a string and returning a boolean
  saveUserData(data: string): boolean;
  
  // Example: server function taking no args and returning a list
  getInventoryList(): string[];

  setCheckin(type: CheckinBox['type'], id: CheckinBox['rowId'], value: string): boolean;
  getAppConfig(): import('./client/common/app-config').AppConfig;
  getInitialAttendanceData(): string;
  getInitialSignupData(): string;
  getInitialAdminData(): string;

  getSignupByRow(id: string): string;
  submitForm(formData: string): void;
  getStudentAudit(studentId: string): Signup[];
  searchStudents(query: string): Student[];
}

// Define the shape of your server-side API
interface ServerFunctions {
  doSomething(param: string): void;
  getData(id: number): void; // Chained handlers manage the actual return type asynchronously
}

// Extend google.script.run interface
interface WithHandlers<T> {
  withSuccessHandler(callback: (res: any) => void): T;
  withFailureHandler(callback: (err: Error) => void): T;
  withUserObject(object: unknown): T;
}

type TypedScriptRun = ServerFunctions & WithHandlers<TypedScriptRun>;

export {};
