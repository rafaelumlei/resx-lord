<template>
	<div class="resx-grid">
		<div id="grid-container">
			<table>
				<thead>
					<tr>
						<th>Resource key</th>
						<th v-for="lang in languages" :key="lang">{{ lang ? lang.toUpperCase() : 'Default' }}</th>
						<th></th>
					</tr>
					<tr>
						<td><input type="text" placeholder="Search/add..." v-model="searchModel.key"
								@keyup.enter="addEntry" @input="onSearchInput" /></td>
						<td v-for="lang in languages" :key="lang">
							<input type="text" :placeholder="`Search ${lang ? lang : 'Default'}...`"
								v-model="searchModel.values[lang]" @input="onSearchInput" @keyup.enter="addEntry" />
						</td>
						<td>
							<button class="icon-button" title="Add row" v-if="addEnabled" @click="addEntry">
								<span class="codicon codicon-add"></span>
							</button>
							<button class="icon-button" title="Clear all" v-if="clearEnabled" @click="clearSearch">
								<span class="codicon codicon-clear-all"></span>
							</button>
						</td>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(entry, index) in filteredEntries" :key="index">
						<td>
							<input type="text" v-model="entry.key" @change="updatekey(entry)" />
						</td>
						<td v-for="lang in languages" :key="lang">
							<input type="text" v-model="entry.values[lang]"
								@change="updateEntry(entry.key, lang, entry.values[lang])" />
						</td>
						<td class="actions">
							<button class="icon-button" title="Delete" @click="deleteEntry(entry.key)">
								<span class="codicon codicon-trash"></span>
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, toRefs } from 'vue';
import type { ResxEntry } from '../../../src/shared';
import { ResxHandler } from '../ResxHandler';
import debounce from '../utils/debounce';

export default defineComponent({
	name: 'ResxGrid',
	props: {
		resources: {
			type: Array as () => any[],
			default: () => []
		}
	},
	setup(props) {

		const VIEW_SIZE = 50;
		const resxService = new ResxHandler();
		const entries = ref<ResxEntry[]>(
			props.resources.length ? 
			props.resources.map(r => ({...r, oldKey: r.key })) : 
			resxService.getEntries()
		);
		const languages = ref<string[]>(resxService.getLanguages());
		const filteredEntries = ref<ResxEntry[]>([]);
		const searchModel = ref<ResxEntry>({ key: '', values: {} });
		const viewIdCounter = ref<number>(Date.now());
		const addEnabled = computed(() => {
			const values = Object.values(searchModel.value.values);
			return searchModel.value.key && values.length == languages.value.length && values.every(v => v);
		});
		const clearEnabled = computed(() => {
			return searchModel.value.key || Object.values(searchModel.value.values).some(v => v);
		});

		// TODO: nice to have - implement scroll (i.e. load more)
		filteredEntries.value = entries.value.slice(0, 300);

		// Add entry from search box
		const addEntry = () => {
			if (!addEnabled) return;

			// Check if key already exists
			const exists = entries.value.some(e => e.key === searchModel.value.key);
			if (!exists) {
				const newEntry = { ...searchModel.value };
				resxService.addEntry(newEntry);
				entries.value.push({...newEntry });
				clearSearch();
			}
		};

		const applyFilter = () => {
			const model = searchModel.value;
			const includes = (v: string, contraint: string) => !contraint || (v ?? '').toLowerCase().includes(contraint.toLowerCase());
			const filtered = [];

			for (let index = 0; index < entries.value.length && filtered.length < VIEW_SIZE; index++) {
				const e = entries.value[index];
				if (includes(e.key, model.key) && Object.entries(e.values).every(([k, v]) => includes(v, model.values[k]))) {
					filtered.push(e);
				}
			}

			filteredEntries.value = filtered;
		};

		const onSearchInput = debounce(() => applyFilter(), 300);

		const clearSearch = () => {
			searchModel.value = { key: '', values: {} };
			applyFilter();
		};

		// Update entry value
		const updateEntry = (key: string, langCode: string, value: string) => {
			resxService.updateEntry(key, langCode, value);
			applyFilter();
		};

		const updatekey = (entry: ResxEntry) => {
			if (!entry.oldKey) return;

			resxService.updateKey(entry.oldKey, entry.key);

			// entry.oldKey = entry.key;

			applyFilter();
		};

		// Delete entry
		const deleteEntry = (key: string) => {
			resxService.deleteEntry(key);
			entries.value = entries.value.filter(e => e.key !== key);
			applyFilter();
		};

		return {
			viewIdCounter,
			entries,
			languages,
			searchModel,
			filteredEntries,
			addEnabled,
			clearEnabled,
			addEntry,
			updateEntry,
			updatekey,
			deleteEntry,
			clearSearch,
			onSearchInput
		};
	}
});
</script>

<style scoped>
#grid-container {
	flex: 1;
	overflow: auto;
	height: calc(100vh - 60px);
}

table {
	border-collapse: collapse;
	width: max-content;
	min-width: 100%;
}

th,
td {
	border: 1px solid var(--vscode-editorWidget-border);
	padding: 8px;
	white-space: nowrap;
}

th {
	background: var(--vscode-editorWidget-background);
	position: sticky;
	top: 0;
	z-index: 1;
	opacity: 1;
}

input {
	width: 100%;
	box-sizing: border-box;
	background: var(--vscode-input-background);
	color: var(--vscode-input-foreground);
	border: 1px solid var(--vscode-input-border);
	padding: 4px;
}

.icon-button {
	all: unset;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 4px;
}

.actions .icon-button {
	margin-right: 4px;
}
</style>
