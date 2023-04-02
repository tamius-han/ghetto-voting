<template>
  <div>

    <h2>{{ $t('languageSelect.selectLanguage') }}</h2>
    <language-switcher></language-switcher>


    <h2>{{ $t('home.openVotings') }}</h2>

    <div>
      {{ $t('home.oauthWarning.body') }}
    </div>

    <ContestListComponent :contestList="contests"></ContestListComponent>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import ContestListComponent from '@/components/ContestList.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';

@Options({
  components: {
    HelloWorld,
    ContestListComponent,
    LanguageSwitcher
  },
})
export default class HomeComponent extends Vue {

  contests = [
    {id: 1, name: "Figurice do 50mm", description: "Kategorija za figurice na podstavku velikosti do 50mm. Največja skupna velikost figurice je 100mm x 100mm x 100mm."},
    {id: 2, name: "Figurice do 200mm", description: "Kategorija za figurice na podstavku velikosti do 200mm. Največja skupna velikost figurice je 300mm x 300mm x 300mm."}
  ];

}
</script>
