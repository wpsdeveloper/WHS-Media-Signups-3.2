import type * as Bootstrap from 'bootstrap';

declare global {
  interface Window {
    bootstrap: typeof Bootstrap;
  }
  const google: {
    script: {
      run: TypedScriptRun;
    };
  };
}

interface ServerFunctions {
  // Example: server function taking a string and returning a boolean
  saveUserData(data: string): boolean;
  
  // Example: server function taking no args and returning a list
  getInventoryList(): string[];

  setCheckin(type: CheckinBox['type'], id: CheckinBox['rowId'], value: string): boolean;
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
