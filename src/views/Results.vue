<template>
  <div>
    <h1>REZULTATI GLASOVANJA</h1>
  </div>

  very ghetto, many bodge
  <div>

  </div>
  <div>
    <h2>Lestvica: publika</h2>
    <div
      v-for="(result, index) of resultsByPublic"
      :key="result"
    >
      <d>{{index + 1}}. mesto:</d> {{result.title}} by <i>{{result.name}}</i>
      <br/>
      <small>{{result.votes}} glasov</small>
    </div>
  </div>

</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import http from '@/http-common';

@Options({
  components: {
    HelloWorld,
  },
})
export default class ResultsComponent extends Vue {
  imageBaseUrl = '';
  results: any[] = [];

  topThree: any[] = [];

  resultsByPublic: any[] = [];
  resultsByJury: any[] = [];

  async created() {
    this.imageBaseUrl = `${http.defaults.baseURL}contestant/image/`;
    const res = await http.get('/results');

    this.results = JSON.parse(JSON.stringify(res.data)).sort((a: any,b: any) => {
      return b.totalVotes ?? 0 - a.totalVotes ?? 0;
    });
    for (let i = 0; i < this.results.length && i < 3; i++) {
      this.topThree.push(this.results[i]);
    }

    this.resultsByPublic = JSON.parse(JSON.stringify(res.data)).sort((a: any,b: any) => {
      return b.votes - a.votes;
    });
    console.log('got results:', this.results);

    this.resultsByJury = JSON.parse(JSON.stringify(res.data)).sort((a: any,b: any) => {
      return b.juryVotes - a.juryVotes;
    });
  }
}
</script>

<style lang="scss">
.result-image {
  display: block;
  width: 12rem;
  aspect-ratio: 2/3 !important;
  object-fit: cover;
}
</style>
