<template>
  <div class="page-bg"></div>

  <div class="page-jury">

    <div v-if="passwordPhase < 2" class="bottom-button-panel">
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
    </div>

    <template v-if="(passwordPhase === 2)">

      <div class="bottom-button-panel">
        <h1>Glasovanje žirije</h1>

        <div>
          Člani žirije: <input v-model="jurySize" /> <div class="button" @click="updateJurySize()">Potrdi</div>
        </div>
        <div class="">
          <p>Imena članov</p>
          <div v-for="(m, index) of juryMembers" :key="index">
            <input v-model="juryMembers[index]" />
          </div>
        </div>

        <div>
          <br/>
          <br/>
          <br/>
        </div>
        <h3>Seznam tekmovalcev:</h3>
      </div>

      <div>
        <div
          v-for="(contestant, index) of contestants"
          :key="contestant.id"
          class="contestant-option d-flex flex-row"
        >
          <div class="backdrop"></div>
          <div class="content d-flex flex-row">
            <div class="image-container position-relative">
              <ContestantZoomableImage :contestant="contestant"></ContestantZoomableImage>
            </div>
            <div class="contestant-description-votes d-flex flex-column">
              <h1>{{(index + 1)}}. {{contestant.title}}</h1>
              <h3>{{contestant.name}}</h3>

              <div>
                <hr />
                <b>Glasovi žirije:</b>
                <br />

                <div class="d-flex flex-row space-between jury-vote-buttons">
                  <div
                    v-for="(juryMember, juryIndex) of juryMembers"
                    :key="juryMember"
                    class="jury-vote-field"
                    :class="{
                      'error': juryVotes[index][juryIndex] && typeof juryVotes[index][juryIndex] === 'string' && isNaN(+(juryVotes[index][juryIndex].replace(',', '.')))
                    }"
                  >
                    <JuryVotePopup
                      :rating="+juryVotes[index][juryIndex]"
                      :jurior="juryMember"
                      @onRated="updateJuryVote(index, juryIndex, $event)"
                    ></JuryVotePopup>
                    <!-- <div class="label">{{juryMember}}</div> -->
                    <!-- <input v-model="juryVotes[index][juryIndex]" @blur="updateJuryVotes()" @keydown.enter="updateJuryVotes()" /> -->
                  </div>
                </div>
              </div>
            </div>

          </div>
            <!-- bar with contestant info -->

        </div>
      </div>


      <div class="bottom-button-panel">
        <div class="button" @click="conflictDetection()">Potrdi glasove</div>
      </div>

      <div
        v-if="tieList.length > 0 || currentTie > 0"
        class="tie-resolution-bg"
      >
        <div class="tie-resolution-window">


          <div class="window-content">
            <template v-if="currentTie === -1">
              <div class="bottom-button-panel">
                <div class="window-header">Oi, šmorn in kravate!</div>
                <h1>Nekateri tekmovalci imajo izenačene ocene, cajt je za podaljške</h1>
                <p>To bo lahko kasneje problem. Prosim razvrstite vse izenačene tekmovalce.</p>
                <ul>
                  <li>
                    Ocenite tekmovalce od 1 do 10
                  </li>
                  <li>
                    To doda tekmovalcu 0.01 - 0.1 dodatnih točk
                  </li>
                  <li>
                    Dodatne točke ne morejo tekmovalcu dati višjega ali nižjega mesta, kot je bilo doseženo med normalnim glasovanjem.<br/>
                    t.j. če imaš na drugem mestu 3 ljudi, potem nobena ocena ne bo potisnila tekmovalca na 1. mesto.<br/>
                    tisti, ki so od izenačenih slabše uvrščeni, bodo tudi ostali slabše uvrščeni
                  </li>
                  <div>
                  </div>
                </ul>
              <div class="button" @click="currentTie = 0">Začni</div>

              </div>
            </template>
            <template v-else-if="currentTie < tieList.length">
              <div class="bottom-button-panel">
                <h1>Kravata {{ currentTie + 1 }} od {{ tieList.length }}</h1>
                <sup><sup><sup>kremžite se ssn</sup></sup></sup>
              </div>

              <!-- vsebnik seznama tekmovalcev -->
              <div>

                <!-- kartica tekmovalca -->
                <div
                  v-for="(contestant, index) of tieList[currentTie].contestants"
                  :key="contestant.id"
                  class="contestant-option d-flex flex-row"
                >
                  <div class="backdrop"></div>
                  <div class="content d-flex flex-row">
                    <div class="image-container position-relative">
                      <ContestantZoomableImage :contestant="contestant"></ContestantZoomableImage>
                    </div>
                    <div class="contestant-description-votes d-flex flex-column">
                      <h1>{{(index + 1)}}. {{contestant.title}}</h1>
                      <h3>{{contestant.name}}</h3>
                      <div class="flex flex-row">
                        <div class="d-flex flex-row button-row">
                          <div
                            v-for="n in 10"
                            :key="n"
                            class="rate-button"
                            :class="{'selected': n === contestant.rating}"
                            @click="resolveTie(index, contestant.id, n)"
                          >
                            {{n}}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                <div class="bottom-button-panel">
                  <p>Pritisni gumb za potrditev razvrstve. <b>Ko je gumb pritisnjen, popravki niso več mogoči.</b></p>
                  <div v-if="isCurrentTieResolved" class="button" @click="nextTie()">Razvozljaj kravato</div>
                  <div v-else>Gumb se bo pokazal, ko bodo tekmovalci ustrezno razvrščeni.</div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="bottom-button-panel">
                <h1>THE NEEDFUL HAS BEEN DONE</h1>
                <p>Vaše delo je opravljeno.</p>
                <p>Hvala za sodelovanje, pohvala za dobro opravljeno delo, za glasbene želje se pa priporočite DJ-ju 😂😂😂</p>
                <p><sub><strike>sir do not redeem</strike></sub></p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import JuryVotePopup from '@/components/JuryVotePopup.vue';
import http from '@/http-common';
import ContestantZoomableImage from '@/components/ContestantZoomableImage.vue';

@Options({
  components: {
    JuryVotePopup,
    ContestantZoomableImage
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

  tieList: any[] = [];
  currentTie = -1;
  isCurrentTieResolved = false;

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

    // initial page load: ensure correct size of jury
    if (res.data.votes) {
      this.jurySize = res.data.votes[0].length;

      if (this.juryMembers.length > this.jurySize) {
        this.juryMembers.splice(this.jurySize);
      } else {
        for (let i = this.juryMembers.length; i < this.jurySize; i++) {
          this.juryMembers.push('<vstavi ime>');
        }
      }

      for (let i = 0; i < res.data.votes.length; i++ ) {
        for (let j = 0; j < res.data.votes[i].length; j++) {
          this.juryVotes[i][j] = `${res.data.votes[i][j]}`;
        }
      }

      this.$forceUpdate();
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

    console.log('juryMembers:', this.juryMembers);

    // we clear any jury votes
    for (let i = 0; i < this.juryVotes.length; i++) {
      this.juryVotes[i] = new Array(this.juryMembers.length);
    }
    this.updateJuryVotes();

    this.$forceUpdate()
  }

  updateJuryVote(contestant: number, jurior: number, rating: number) {
    console.log('current jury votes:', this.juryVotes);
    this.juryVotes[contestant][jurior] = rating;
    this.updateJuryVotes();
  }

  updateJuryVotes() {
    console.log('juiry on start updateJuryVotes:', JSON.parse(JSON.stringify(this.juryVotes)));

    // ensure that we only send jury votes that exist
    const voteCollection = JSON.parse(JSON.stringify(this.juryVotes));
    for (const contestant of voteCollection) {
      // nope — we're repurposing contestants[jurySize] as tie resolve
      // for (let i = this.jurySize + 1; i < contestant.length; i++) {
      //   contestant[i] = undefined;
      // }
      for (let i = 0; i < contestant.length; i++) {
        // convert strings to numbers where necessary
        if (contestant[i]) {
          if (typeof contestant[i] === 'string') {
            contestant[i] = +(contestant[i].replace(',', '.'));

            if (isNaN(contestant[i])) {
              console.warn('ena stvar tukaj ni številka. sussy.');
              console.warn('ne bomo posredovali glasu')
              return;
            }
          }
        } else {
          contestant[i] = +contestant[i]
        }
      }
    }

    return http.post('/jury-votes', {votes: voteCollection});
  }


  async conflictDetection() {
    // ensure votes get updated, even though theoretically not necessary
    await this.updateJuryVotes();

    // get semi-computed results from the server
    const rawData =  (await http.get('/results'))?.data ?? [];

    const sortedJury = JSON.parse(JSON.stringify(rawData)).sort((a: any, b: any) => {return b.juryVotes - a.juryVotes});
    console.log('sorted jury votes:', sortedJury)

    const conflicts = [];

    for (let i = 0; i < sortedJury.length - 1; i++) {
      if (sortedJury[i].juryVotes === sortedJury[i+1].juryVotes) {  // if tied:
        if (                                                        // add new conflict when
          !conflicts.length                                                     // no conflicts exist; OR
          || conflicts[conflicts.length - 1].votes !== sortedJury[i].juryVotes  // last conflict was for a different total score
        ) {
          conflicts.push({
            votes: sortedJury[i].juryVotes,
            contestants: [sortedJury[i], sortedJury[i+1]]
          });
        } else {                                                   // if last conflict was for same total jury score:
          conflicts[conflicts.length - 1].contestants.push(sortedJury[i+1])  // add this contestant to the contestant pile
        }
      }
    }

    // This means all conflicts are processed
    this.tieList = conflicts;
    if (this.tieList.length) {
      this.currentTie = -1;
    } else {
      this.currentTie = 1;
    }
    console.log('ties:', conflicts)
  }

  resolveTie(tieListIndex: number, contestantId: number, rating: number) {
    this.tieList[this.currentTie].contestants[tieListIndex].rating = rating;
    const juryVotesIndex = this.contestants.findIndex(x => x.id === contestantId);
    this.juryVotes[juryVotesIndex][this.jurySize] = rating / 100;

    console.log('juiry votes on tie resolved:', JSON.parse(JSON.stringify(this.juryVotes)));

    this.verifyTieResolution();
  }

  verifyTieResolution() {
    let currentRating;
    let validRanking = true;
    for (let i = 0; i < this.tieList[this.currentTie].contestants.length - 1; i++) {
      currentRating = this.tieList[this.currentTie].contestants[i].rating;

      for (let j = i + 1; j < this.tieList[this.currentTie].contestants.length; j++) {
        if (currentRating === this.tieList[this.currentTie].contestants[j].rating) {
          validRanking = false;
        }
      }
    }

    this.isCurrentTieResolved = validRanking;
  }

  nextTie() {
    this.verifyTieResolution();

    if (this.isCurrentTieResolved) {
      this.currentTie++;
      this.updateJuryVotes();
    }
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

// .jury-vote-field {
//   width: 100%;
//   input {
//     width: 100%;
//   }
// }

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
  box-sizing:border-box;

  height: unset;
  width: calc(100% - 4rem);
  margin: 3rem 2rem;
  // padding: 0rem 1rem;

  border: 4px solid #000;

  position: relative;

  .backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: -1;
  }

  .backdrop {
    backdrop-filter: blur(5px) brightness(0.24) saturate(0.5);
  }

  .content {
    width: 100%;
  }

  .contestant-description-votes {
    padding: 1rem;
  }

  .image-container {
    width: 21rem;
    margin-right: 1rem;
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

.tie-resolution-bg {
  display: block;
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(16px);

  overflow: auto;

  .window-title-bar {
    background: #000;
    padding: 0.25rem 1rem;
  }

  .popup-window {
    margin: 5%;
    background-color: rgba(0,0,0,0.5);
    height: 90%;
    width: 90%;
  }

}


.button-row {
  justify-content: center;
  align-items: center;
}

.rate-button {
  background-color: rgba(0,0,0,0.5);
  margin: 0.125rem;
  width: 9%;
  aspect-ratio: 1;
  text-align: center;

  border: 1px solid rgba(#fa6, 0.5);

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 2.5rem;
  font-weight: 300;

  &.selected {
    background-color: #fa6;
    color: #000
  }
}

.button {
  border: 1px solid #fa6;
  color: #fa6;
  background-color: rgba(255, 171, 102, 0.25);
  padding: 1rem 2.5rem;

  &.error {
    color: #f00;
    border: 1px solid #f00;
    background-color: rgba(255, 0, 0, 0.25);
  }
}

.bottom-button-panel {
  margin-top: 3.50rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(5px) brightness(0.24) saturate(0.5);
  width: 100%;

  display: flex;
  flex-direction: column;
  padding: 2.5rem;
  text-align: center;
  align-items: center;
  justify-content: center;
}

.space-between {
  justify-content: space-between;
}
.jury-vote-buttons {
  margin-top: 1rem;
  margin-bottom: 4.20rem;
}
</style>


