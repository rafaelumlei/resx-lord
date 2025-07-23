import * as vscode from 'vscode';
import { ResxService } from './ResxService';
import { ResxEntry } from './shared';

export class ResxEditorProvider implements vscode.CustomReadonlyEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new ResxEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(
			ResxEditorProvider.viewType,
			provider,
			{
				webviewOptions: {
					retainContextWhenHidden: true,
				}
			});
		return providerRegistration;
	}

	private static readonly viewType = 'resx-lord.resxEditor';
	private resxService?: ResxService = undefined;
	private uri?: vscode.Uri;

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

	async openCustomDocument(
		uri: vscode.Uri,
		openContext: vscode.CustomDocumentOpenContext,
		token: vscode.CancellationToken
	): Promise<vscode.CustomDocument> {
		this.uri = uri;
		// Create and return a simple document for now
		return { uri, dispose: () => { } };
	}

	async resolveCustomEditor(
		document: vscode.CustomDocument,
		webviewPanel: vscode.WebviewPanel,
		token: vscode.CancellationToken
	): Promise<void> {
		this.resxService = new ResxService();
		const content = this.resxService.loadFiles(document.uri.fsPath);
		// re init the files
		// this.resxService.loremIpsum();
		webviewPanel.webview.options = { enableScripts: true };
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, content);

		webviewPanel.webview.onDidReceiveMessage(async (message) => {
			if (!this.uri || !this.resxService) {return;}

			const data: ResxEntry = message?.data ? JSON.parse(message.data) : null;

			if (!data) {return data;}

			switch (message.type) {
				case 'added':
					this.resxService.addResource(data);
					return;
				case 'updated':
					const [k, v] = Object.entries(data.values)[0];
					this.resxService.updateValue(data.key, k, v);
					return;
				case 'keyUpdated':
					this.resxService.updateKey(data.oldKey!, data.key);
					return;
				case 'deleted':
					this.resxService.deleteKey(data.key);
					return;
			}
		});
	}

	private getNonce() {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < 32; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}

	private getHtmlForWebview(webview: vscode.Webview, content: any): string {
		// Local path to script and css for the vue webview
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'media', 'resxEditor.js')
		);
		const styleUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'media', 'style.css')
		);

		const nonce = this.getNonce();

		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src ${webview.cspSource} https://cdn.jsdelivr.net; font-src ${webview.cspSource} https://cdn.jsdelivr.net;">
				<link href="${styleUri}" rel="stylesheet" />
				<link href="https://cdn.jsdelivr.net/npm/@vscode/codicons@latest/dist/codicon.css" rel="stylesheet" />
				<title>RESX Editor</title>
			</head>
			<body>
				<div id="app" data-resources="${encodeURIComponent(JSON.stringify(content))}"></div>
				<script nonce="${nonce}" type="module" src="${scriptUri}"></script>
			</body>
			</html>
		`;
	}
}
