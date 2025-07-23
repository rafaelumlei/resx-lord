/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Declare the VS Code API acquisition
declare function acquireVsCodeApi(): {
  postMessage(message: any): void;
  setState(state: any): void;
  getState(): any;
};
