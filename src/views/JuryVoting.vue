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
            <img class="contestant-image" :src="(imageBaseUrl + contestant.id + '/image?gci' + contestant.imageUpdate)" loading="lazy" alt="&nbsp;"/>
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
                :class="{
                  'error': juryVotes[index][juryIndex] && isNaN(+(juryVotes[index][juryIndex].replace(',', '.')))
                }"
              >
                <div class="label">{{juryMember}}</div>
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
  passwordPhase = 0;

  jurySize = 3;
  juryMembers = ['A', 'B', 'C'];

  juryVotes: any[][] = [];

  contestants: any[] = [];
  imageBaseUrl?: string;

  async created() {
    this.imageBaseUrl = `${http.defaults.baseURL}contestants/`;
    await this.getContestants();
    await this.getJuryVotes();
  }

  private async getContestants() {
    const res = await http.get('/contestants');

    this.contestants = [];
    for (const c in res.data) {
      this.contestants.push(res.data[c]);
      this.juryVotes.push([]);
    }
  }

  private async getJuryVotes() {
    const res = await http.get('/jury-votes');
    if (res.data.votes && res.data.votes.length === this.juryVotes.length) {
      for (let i = 0; i < res.data.votes.length; i++ ) {
        for (let j = 0; j < res.data.votes[i].length; j++) {
          this.juryVotes[i][j] = `${res.data.votes[i][j]}`;
        }
      }
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
    const voteCollection = JSON.parse(JSON.stringify(this.juryVotes));
    for (const contestant of voteCollection) {
      for (let i = this.jurySize; i < contestant.length; i++) {
        contestant[i] = undefined;
      }
      for (let i = 0; i < contestant.length; i++) {
        if (contestant[i]) {
          contestant[i] = +(contestant[i].replace(',', '.'));

          if (isNaN(contestant[i])) {
            console.warn('ena stvar tukaj ni številka. sussy.');
            console.warn('ne bomo posredovali glasu')
            return;
          }
        }
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

.jury-vote-field {
  width: 100%;
  input {
    width: 100%;
  }
}

.page-jury {
  position: relative;
  z-index: 1;
}

.error {
  color: #000;
  background-color: rgb(211, 24, 24);

  input {
    color: #f00;
  }

  .label:after {
    content: ' — SEM NOTRI RABIŠ VNESIT ŠTEVILKO'
  }
}

.image-container {
  flex-grow: 0;
  flex-shrink: 0;
}

.contestant-description-votes {
  flex-grow: 1;
  flex-shrink: 1;
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


