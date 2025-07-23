<template>
  <div class="app">
  <ResxGrid :resources="resources" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ResxGrid from './components/ResxGrid.vue';

export default defineComponent({
  name: 'App',
  components: {
    ResxGrid
  },
  props: {
    resources: {
      type: Array,
      required: true
    }
  }
});
</script>

<style>
/* Global styles */
body {
  margin: 0;
  font-family: var(--vscode-font-family);
  color: var(--vscode-foreground);
  background-color: var(--vscode-editor-background);
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.codicon {
  font-size: 16px;
  color: var(--vscode-icon-foreground);
}
</style>
