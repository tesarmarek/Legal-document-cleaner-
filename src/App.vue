<template>
  <div id="app">
    <HtmlCleaner />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HtmlCleaner from './components/HtmlCleaner.vue';

export default defineComponent({
  name: 'App',
  components: {
    HtmlCleaner
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
