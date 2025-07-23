// Helper for VS Code API
let vscode: {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
};

export function getVSCodeAPI() {
  if (!vscode) {
	try {
		vscode = acquireVsCodeApi() ?? {
			postMessage: (message) => console.log(message),
			getState: () => {},
			setState: (state) => console.log(state),
		};
	} catch (e) {
		// while running the vue app stand alone
		console.error(e);
		vscode = {
			postMessage: (message) => console.log(message),
			getState: () => {},
			setState: (state) => console.log(state),
		};
	}
  }
  return vscode;
}
