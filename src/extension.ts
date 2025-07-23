import * as vscode from 'vscode';
import { ResxEditorProvider } from './resxEditorProvider';

export async function activate(context: vscode.ExtensionContext) {
	const resxEditorProvider = ResxEditorProvider.register(context);
	context.subscriptions.push(resxEditorProvider);
}

export function deactivate() { }
