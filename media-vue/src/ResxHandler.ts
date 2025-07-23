import { getVSCodeAPI } from './vscode';
import type { ResxEntry } from '../../src/shared';

export class ResxHandler {
	private vscode = getVSCodeAPI();

	constructor() {
		// react to extension message's
		// window.addEventListener('message', (event) => this.handleMessage(event));
	}

	public addEntry(entry: ResxEntry) {
		this.vscode.postMessage({
			type: 'added',
			data: JSON.stringify(entry)
		});
	}

	public updateEntry(key: string, lang: string, value: string) {
		this.vscode.postMessage({
			type: 'updated',
			data: JSON.stringify({
				key,
				values: {
					[lang]: value
				}
			} as ResxEntry)
		});
	}

	public updateKey(oldKey: string, newKey: string) {
		this.vscode.postMessage({
			type: 'keyUpdated',
			data: JSON.stringify({
				key: newKey,
				oldKey,
			} as ResxEntry)
		});
	}	

	public deleteEntry(key: string) {
		this.vscode.postMessage({
			type: 'deleted',
			data: JSON.stringify({
				key
			} as ResxEntry)
		});
	}
}
