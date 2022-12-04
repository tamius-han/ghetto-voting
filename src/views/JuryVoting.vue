<template>
  <div class="page-bg"></div>

  <div class="page-jury">
    <h1>Glasovanje žirije</h1>

    <div v-if="(passwordPhase === 0)">

      <div>
        Reči 'prijatelj' in vsopi.
      </div>
      <div>
        <input v-model="password"  @input="checkPassword()" />
      </div>
    </div>
    <div v-if="(passwordPhase === 1)">
      <div>
        ola vilinska zgaga, spizdi
      </div>
      <div>
        <input v-model="password" @input="checkPassword()"/>
      </div>
    </div>

    <template v-if="(passwordPhase === 2)">
      <div>
        Člani žirije: <input v-model="jurySize" /> <div class="button" @click="updateJurySize()">Potrdi</div>
      </div>
      <div class="">
        <p>Imena članov</p>
        <div v-for="(m, index) of juryMembers" :key="index">
          <input v-model="juryMembers[index]" />
        </div>
      </div>

      <h3>Seznam tekmovalcev:</h3>
      <div>
        <div
          v-for="(contestant, index) of contestants"
          :key="contestant.id"
          class="contestant-option d-flex flex-row"
        >
          <div class="image-container position-relative">
            <img class="contestant-image" :src="imageBaseUrl + contestant.id + '/image'" loading="lazy" alt="&nbsp;"/>
          </div>
          <div class="contestant-description-votes d-flex flex-column">
            <h1>{{(index + 1)}}. {{contestant.title}}</h1>
            <h3>{{contestant.name}}</h3>

            <div>
              <hr />
              <b>Glasovi žirije:</b>

              <div
                v-for="(juryMember, juryIndex) of juryMembers"
                :key="juryMember"
                class="jury-vote-field"
              >
                <div>{{juryMember}} .. {{juryVotes[index][juryIndex]}}</div>
                <input v-model="juryVotes[index][juryIndex]" @blur="updateJuryVotes()" @keydown.enter="updateJuryVotes()" />
              </div>
            </div>
          </div>


            <!-- bar with contestant info -->

        </div>
      </div>
    </template>
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
export default class JuryVotingComponent extends Vue {
  password = '';
  passwordPhase = 2;

  jurySize = 3;
  juryMembers = ['A', 'B', 'C'];

  juryVotes: any[][] = [];

  contestants: any[] = [];
  imageBaseUrl?: string;

  created() {
    this.imageBaseUrl = `${http.defaults.baseURL}contestants/`;
    this.getContestants();
  }

  private async getContestants() {
    const res = await http.get('/contestants');

    this.contestants = [];
    for (const c in res.data) {
      this.contestants.push(res.data[c]);
      this.juryVotes.push([]);
    }
  }

  checkPassword() {
    if (this.password === 'mellon') {
      this.passwordPhase = 1;
    } else if (this.password === 'jakikaki') {  // yes. many honor system. very best orc security
      this.passwordPhase = 2;
    }
  }

  updateJurySize() {
    console.log('članov žirije:', this.jurySize);

    if (this.juryMembers.length === this.jurySize) {
      return;
    }
    if (this.juryMembers.length > this.jurySize) {
      this.juryMembers.splice(this.jurySize);
    } else {
      for (let i = this.juryMembers.length; i < this.jurySize; i++) {
        this.juryMembers.push('<vstavi ime>');
      }
    }

    console.log('juryMembers:', this.juryMembers)
    this.$forceUpdate()
  }

  updateJuryVotes() {
    // ensure that we only send jury votes that exist
    console.log('jury votes:', this.juryVotes);

    const voteCollection = JSON.parse(JSON.stringify(this.juryVotes));
    for (const contestant of voteCollection) {
      for (let i = this.jurySize; i < contestant.length; i++) {
        contestant[i] = undefined;
      }
    }

    http.post('/jury-votes', {votes: voteCollection});
  }
}
</script>

<style scoped lang="scss">
@import '../../node_modules/bootstrap/scss/bootstrap';

.page-bg {
  top: 0;
  left: 0;
  position: fixed;
  // z-index: -1;
  height: 100vh;
  width: 100vw;
  background: url('../assets/images/jury-bg.webp');
  background-size: cover;
  background-position: 55% center;
}

.page-jury {
  position: relative;
  z-index: 1;
}

.contestant-option {
  height: 32rem;
  width: 69rem;
  margin: 2rem;
  padding: 1rem;
  backdrop-filter: blur(5px) brightness(0.24) saturate(0.5);

  .image-container {
    width: 21rem;
    margin-right: 4rem;
  }

  h1 {
    font-weight: 250;
    font-size: 3.50rem;
  }
  h3 {
    font-size: 1.5rem;
    font-weight: 300;
    opacity: 0.75;
  }

}
</style>


