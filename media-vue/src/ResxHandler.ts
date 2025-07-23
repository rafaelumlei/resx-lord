import { getVSCodeAPI } from './vscode';
import type { ResxEntry } from '../../src/shared';

export class ResxHandler {
	private vscode = getVSCodeAPI();

	constructor() {
		// react to extension message's
		window.addEventListener('message', (event) => this.handleMessage(event));
	}

	private handleMessage(event: MessageEvent) {
		// const message = event.data;
		// switch (message.type) {
		// 	case 'init':
		// 		// this.fileContent = message.content;
		// 		// this.filePath = message.filePath;
		// 		// this.parseResxContent(message.content);
		// 		break;
		// }
	}

	public getEntries(): ResxEntry[] {
		const languages = this.getLanguages();
		const entries: ResxEntry[] = [];
		const prefixes = ['app', 'ui', 'error', 'success', 'warning', 'entity', 'action', 'menu', 'label', 'button'];
		const words = ['user', 'account', 'profile', 'dashboard', 'settings', 'notification', 'message', 'file', 'document', 'project'];

		for (let i = 0; i < 10000; i++) {
			const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
			const word = words[Math.floor(Math.random() * words.length)];
			const suffix = Math.floor(Math.random() * 100);

			// make sure keys are uniq
			const key = `${prefix}.${i}.${word}${suffix}`;
			const entry = {
				key,
				oldKey: key,
				values: {} as { [lang: string]: string }
			};

			// Generate random values for each language
			languages.forEach(lang => {
				entry.values[lang] = `${lang.toUpperCase()} ${word} ${suffix}`;
			});

			entries.push(entry);
		}

		return entries;
	}

	public getLanguages(): string[] {
		return ['', 'en', 'fr'];
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
