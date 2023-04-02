
<template>
  <div>
    <div>{{ $t('languageSelect.selectLanguage') }}</div>
    <select v-model="$root.$i18n.locale">
      <option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="lang.key">{{ lang.label }}</option>
    </select>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import {languageOptions} from '@/i18n/messages';

export default class LanguageSwitcher extends Vue {
  langs = languageOptions;
}
</script>

<style>

</style>
