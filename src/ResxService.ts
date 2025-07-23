import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { ResxEntry } from './shared';
import * as fs from 'fs';
import path from 'path';

type ResourceFile = { lang: string, path: string };
type ResxData = { value: string, '@_name': string, '@_xml:space': string };
type ResxFileContent = { root: { data: ResxData[] } };
type ResxFile = { path: string, content: ResxFileContent };

export class ResxService {

	private parser: XMLParser;
	private builder: XMLBuilder;
	private filesByLang: Map<string, ResxFile> = new Map();

	constructor() {
		this.parser = new XMLParser({
			commentPropName: '__comment__',
			ignoreAttributes: false,
			parseTagValue: false,
			processEntities: false,
		});
		this.builder = new XMLBuilder({
			commentPropName: '__comment__',
			format: true,
			indentBy: '  ',
			ignoreAttributes: false,
			suppressEmptyNode: true,
			processEntities: false,
		});
	}

	private findResourceFiles(pathStr: string) : ResourceFile[] {
		const { base, dir } = path.parse(pathStr);
		const name = base.split('.')[0] + '.';
		const files = fs.readdirSync(dir)
			.map(f => path.parse(f))
			.filter(p => p.base?.startsWith(name))
			.map(p => {
				const nameParts = p.base.split('.');
				return { lang: nameParts[1] === 'resx' ? '' : nameParts[1], path: path.join(dir, p.base) } as ResourceFile;
			});
		return files;
	}

	public loadFiles(pathStr: string): ResxEntry[] {
		const files = this.findResourceFiles(pathStr);
		// key to entry
		const resources = new Map<string, ResxEntry>();
		const entries: ResxEntry[] = [];
		
		files.forEach(f => {
			const file = this.parser.parse(fs.readFileSync(f.path)) as ResxFileContent;
			this.filesByLang.set(f.lang, { path: f.path, content: file });

			// fast-xml-parser doesn't create an array if there's only one entry
			file.root.data = !file.root.data ? [] : (file.root.data.length ? file.root.data : [file.root.data] as unknown as ResxData[]);

			file.root.data.map(d => {
				const key = d['@_name'];
				
				if (!resources.has(key)) {
					const entry = <ResxEntry>{ key, values: {} };
					resources.set(key, entry);
					entries.push(entry);
				}
				resources.get(key)!.values[f.lang] = d.value;
			});
		});

		return entries;
	}

	// re inits resx files for testing
	public loremIpsum() {
		const loremIpsumWords = [
			"lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
			"sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
			"magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation",
			"ullamco", "laboris", "nisi", "'ut'", "aliquip", "ex", "ea", "commodo", "consequat",
			"duis", "aute", "irure", "dolor", "in", "reprehenderit", "voluptate", "velit",
			"esse", "cillum", "dolore", "eu", "\"fugiat\"", "nulla", "pariatur", "excepteur",
			"sint", "occaecat", "cupidatat", "non", "proident", "sunt", "in", "culpa",
			"qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
		];

		const keys: string[] = [];

		for (let f of this.filesByLang.values()) {
			f.content.root.data.forEach((d, i) => {
				const length = 3 +  Math.floor(Math.random() * 10);
				const words = Array.from(
					{ length: length }, (_, i) => 
						loremIpsumWords[Math.floor(Math.random() * loremIpsumWords.length)]
				);

				if (!keys?.[i]) { // all files must have the same keys, we only gen them for the first
					keys.push(words.join('.').replaceAll('\'', '').replaceAll('"', ''));
				}

				d['@_name'] = keys[i];
				d.value = words.join(' ');
			});

			this.saveFile(f);
		}
	}

	public updateKey(oldKey: string, newKey: string) {
		this.filesByLang.forEach((f: ResxFile) => {
			f.content.root.data.find(d => d['@_name'] === oldKey)!['@_name'] = newKey;
			this.saveFile(f);
		});
	}

	public updateValue(key: string, lang: string, value: string) {
		const file = this.filesByLang.get(lang)!;
		const entry = file.content.root.data.find(d => d['@_name'] === key);
		
		if (entry) {
			entry.value = value;
		} else {
			file.content.root.data.push(this.xmlEntryFactory(key, value));
		}

		this.saveFile(file);
	}

	public deleteKey(key:string) {
		this.filesByLang.forEach((f: ResxFile) => {
			const index = f.content.root.data.findIndex(d => d['@_name'] === key);
			f.content.root.data.splice(index, 1);
			this.saveFile(f);
		});
	}

	public addResource(resource: ResxEntry) {
		this.filesByLang.forEach((file, lang) => {
			file.content.root.data.push(
				this.xmlEntryFactory(resource.key, resource.values[lang])
			);
			this.saveFile(file);
		});
	}

	private xmlEntryFactory(key: string, value: string): { value: string; '@_name': string; '@_xml:space': string; } {
		return {
			"value": value,
			"@_name": key,
			"@_xml:space": "preserve"
		};
	}

	private saveFile(file: ResxFile) {
		// unfortunate hacks, fast-xml-parser doesn't support these customizations
		const content = this.builder.build(file.content)
			.trim() // remove extra line
			.replace(/(<[^>]+?)\/>/g, '$1 />') // add space before />
			.replace('msdata:IsDataSet', 'msdata:IsDataSet="true"'); // fix bug where true was ommited

		fs.writeFileSync(file.path, content);
	}
}