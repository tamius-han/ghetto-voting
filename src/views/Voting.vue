<template>
  <div class="h-100 relative">
    <div v-if="!hideRemainingVotesHeader && contestants && contestants.length > 0" class="remaining-votes-header d-flex flex-row sticky-top w-100">
      <div class="d-flex flex-column justify-content-center align-items-center w-100 p-2">
        <div class="smaller">
          <template v-if="currentAvailableVotesLeft.length">NEPODELJENI GLASOVI:</template>
          <template v-else>VAŠI GLASOVI SO BILI ZABELEŽENI.</template>
        </div>
        <template v-if="currentAvailableVotesLeft.length">
          <div class="d-flex flex-row flex-wrap">
            <div
              v-for="votePoint of currentAvailableVotesLeft"
              :key="votePoint.points"
              class="m-1 px-2 py-1 vote-option-card"
            >
              {{votePoint.points}} točk <template v-if="votePoint.instances > 1">({{votePoint.instances}})</template>
            </div>
          </div>
          <div class="smallest">DA BO VAŠ GLAS ŠTEL V GLASOVANJU, MORATE PODELITI VSE GLASOVE</div>
        </template>
        <template v-else>
          <div class="smallest d-flex flex-row">
            <div class="grow-1">
              DO KONCA GLASOVANJA SI ŠE LAHKO PREMISLITE TER SPREMENITE SVOJ GLAS.
            </div>
            <button
              class="dummy-button cursor-pointer grow-0 shrink-0"
              @click="hideRemainingVotesHeader = true"
            >
              V redu
            </button>
          </div>

        </template>
      </div>

    </div>

    <div class="vote-container d-flex flex-column flex-md-row flex-md-wrap justify-content-center align-items-center">
      <div v-if="(!contestants || backendError)">
        <div class="loading-bg">
          <div style="text-align: center; padding: 0.5rem 1rem; backdrop-filter: blur(5px) saturate(0.5) brightness(0.75); font-size: 0.75em">
            <h3>Jst nisem take vrste ork</h3>
            <template v-if="backendError">
              <p>Zgodila se je ena izmed teh stvari:</p>
              <p>1. Backend še ni postavljen<br/>
              2. Backend je padu dol<br/>
              3. Backend je prezaseden</p>
              <p>Če lahko čez 15-30s probaš še enkrat naložiti to stran, bi blo fajn.</p>
            </template>
            <template v-else>Podatki se nalagajo ... počasi.</template>
          </div>
        </div>
      </div>
      <div v-else-if="!votingStarted && !votingEnded">
          <div style="text-align: center">
            {{ votingStarted }} {{ votingEnded }}
            <br/><br/>
            <p><img style="max-width: 100%" src="../assets/images/not-yet.webp" /><br/></p>
            <p>Glasovanje še ni odprto za javnost.</p>
            <p></p>
            <p>Ko bo tekmovanje odprto, bi se morala stran posodobiti.</p>
            <p><small>Če se ne, potem prosimo pomagajte in osvežite stran na roke. Prosm hvala, ker nism take sorte ork.</small></p>
          </div>
      </div>
      <div v-else-if="!votingStarted && votingEnded">
        <div style="text-align: center">
            <br/><br/>
            <p><img style="max-width: 100%" src="../assets/images/late.webp" /><br/></p>
            <p>Glasovanje je zaključeno.</p>
          </div>
      </div>
      <div v-else-if="contestants && contestants.length === 0">
        <h2>Malo prezgodej za glasovanje, eh?</h2>
        <p>Če vidiš to sporočilo, potem tekmovalcev še ni.</p>
        <p>Organizatorji dogodka bodo verjetno najavili, kje in kdaj.</p>
      </div>
      <template v-else>
        <div
          v-for="(contestant, index) of contestants"
          :key="contestant.id"
          class="contestant-option position-relative mb-2 mt-2 mx-md-2"
          @click.stop="setActiveContestant(index)"
        >
          <div class="image-container position-relative">
            <img class="contestant-image" :src="(imageBaseUrl + contestant.id + '/image?gci=' + contestant.imageUpdate)" loading="lazy" alt="&nbsp;"/>
          </div>

          <div
            v-if="activeContestantVoteMenu === index"
            class="position-absolute w-100 h-100 top-0 p-2 vote-menu d-flex flex-column justify-content-center align-items-center"
            :class="{
              'has-vote': !!contestant.myPoints
            }"
            @click.stop="setActiveContestant(-1)"
          >

            <!-- naslov -->
            <div class="title">
              {{contestant.title}}
            </div>
            <div class="name">
              {{contestant.name}}
            </div>
            <div class="hr-line"></div>

            <!-- glasovanje -->
            <div
              v-for="voteOption of availableVotes"
              :key="voteOption"
              class="vote-option row"
              :class="{
                'revocation': contestant.myPoints === voteOption.points,
                'reassign-vote': !contestant.myPoints && !currentAvailableVotesLeft.find(x => x.points === voteOption.points),
                'change-points': myVotes.find(x => x.candidateId === contestant.id && x.points !== voteOption.points)
              }"
              @click.stop="voteFor(index, voteOption.points)"
            >
              <div class="col-3 d-flex flex-column justify-content-center align-items-center">
                <div class="point-value">{{voteOption.points}}</div>
                <div class="smallest">TOČK</div>
              </div>
              <div
                class="col-9 vote d-flex flex-row justify-content-center align-items-center"
              >
                <div class="vote-normal">PODELI GLAS</div>
                <div class="vote-special">
                  <div class="reassignment">SPREMENI GLAS</div>
                  <div class="point-change">SPREMENI TOČKE</div>
                </div>
                <div class="revoke-vote">UMAKNI GLAS</div>
              </div>
            </div>

          </div>

          <!-- bar with contestant info -->
          <div
            v-if="activeContestantVoteMenu !== index"
            class="contestant-info-row d-flex flex-row position-absolute bottom-0 left-0 w-100"
          >
            <div class="flex-grow-1 flex-shrink-1 d-flex flex-column">
              <div class="title">{{contestant.title}}</div>
              <div class="name">{{contestant.name}}</div>
            </div>
            <div class="flex-grow-0 flex-shrink-0 d-flex justify-content-center align-items-center">
              <div
                v-if="!contestant.myPoints"
                class="m-2 p-3 vote-button cursor-pointer"
              >
                GLASUJ
              </div>
              <div
                v-else
                class="m-2 p-3 vote-button cursor-pointer voted"
              >
                <template v-if="availableVotes.length > 2">
                  {{contestant.myPoints}} TOČK
                </template>
                <template v-else>
                  UMAKNI GLAS
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import http from '@/http-common';
import { Vote } from 'common/types/vote-record.interface';

@Options({
  components: {
    HelloWorld,
  },
})
export default class VotingComponent extends Vue {
  contestants?: any[] | undefined | null = null;
  imageBaseUrl?: string;
  totalVotes: any[] = [];
  availableVotes: any[] = [];
  currentAvailableVotesLeft: any[] = [];
  myVotes: Vote[] = [];
  activeContestantVoteMenu?: number = -1;
  votingStarted?: boolean = false;
  votingEnded?: boolean = false;

  backendError = false;
  hideRemainingVotesHeader= false;

  voteCheckInterval: any;

  created() {
    this.setupVoting();
  }

  private async setupVoting() {
    this.backendError = false;
    try {
      await this.getId();
      this.imageBaseUrl = `${http.defaults.baseURL}contestants/`;
      await this.listContestants();  // must be loaded _before_ user's current votes load
      await this.getVoteConfig();
      await this.getMyVotes();


      window.addEventListener('focus', () => {
        this.refreshVoteStatus();
        if (this.voteCheckInterval) {
          clearInterval(this.voteCheckInterval);
        }
        this.voteCheckInterval = setInterval(this.refreshVoteStatus, 15000 + Math.random() * 6.9);
      });
      window.addEventListener('blur', () => {
        clearInterval(this.voteCheckInterval);
      });

      this.voteCheckInterval = setInterval(this.refreshVoteStatus, 15000 + Math.random() * 6.9);
    } catch (e) {
      this.backendError = true;
      throw e;
    }
  }

  private async refreshVoteStatus() {
    // if this ever goes through cloudflare, this should trick it into caching
    // request made within a period of 3 seconds
    const res = await http.get(`/vote-start?ts=${(+new Date() / 3000).toFixed()}`);
    this.votingStarted = res.data.votingStarted;
    this.votingEnded = res.data.votingEnded;
  }

  private async getId() {
    const startTimeObjStr = localStorage.getItem('voteStartTime');
    let resetId = true;

    if (startTimeObjStr) {
      const voteStart = JSON.parse(startTimeObjStr).startTime;

      const res = await http.get('/vote-start');

      this.votingStarted = res.data.votingStarted;
      this.votingEnded = res.data.votingEnded;

      if (voteStart === res.data.voteStart) {
        resetId = false;
      }
    }


    const localStorageId = localStorage.getItem('clientId');

    if (localStorageId && !resetId) {
      http.defaults.headers.common['Authorization'] = localStorageId;
      return localStorageId;
    }

    if (resetId) {
      const res = await http.get(`/voter-id`);
      http.defaults.headers.common['Authorization'] = res.data.id;
      localStorage.setItem('clientId', res.data.id);
      localStorage.setItem('voteStartTime', JSON.stringify({startTime: res.data.voteStart}))
      return res.data.id;
    }
  }

  private async getVoteConfig() {
    const res = await http.get('/vote-config');
    console.log('ote config:', res.data);
    this.currentAvailableVotesLeft = res.data.availableScores;
    this.availableVotes = JSON.parse(JSON.stringify(this.currentAvailableVotesLeft));
  }
  private async getMyVotes() {
    const res = await http.get('/my-votes');
    console.log('my votes:', res.data);
    this.myVotes = res.data.votes;

    for (const contestant of this.contestants || []) {
      contestant.myPoints = this.myVotes.find(x => x.candidateId === contestant.id)?.points ?? undefined;
    }
    for (const vote of this.myVotes) {
      this.decreaseAvailableVotes(vote.points);
    }

    // if user has 0 available votes on page load, we DO NOT show the banner.
    // however, we keep showing the banner if vote count freshly went to 0 due
    // to user interaction.
    if (this.currentAvailableVotesLeft.length === 0) {
      this.hideRemainingVotesHeader = true;
    }
  }

  private async listContestants() {
    const res = await http.get('/contestants');

    this.contestants = [];
    for (const c in res.data) {
      this.contestants.push(res.data[c]);
    }
  }

  private async decreaseAvailableVotes(points: number) {
    const si = this.currentAvailableVotesLeft.findIndex(x => x.points === points);
    this.currentAvailableVotesLeft[si].instances--;

    // remove spent scores
    if (this.currentAvailableVotesLeft[si].instances === 0) {
      this.currentAvailableVotesLeft.splice(si, 1);
    }
  }

  setActiveContestant(index: number | undefined): void {
    console.log('setting active contestant:', index)
    if (this.activeContestantVoteMenu === index) {
      this.activeContestantVoteMenu = -1;
    } else {
      this.activeContestantVoteMenu = index;
    }
  }

  async voteFor(contestantIndex: number, points: number, recursing = false): Promise<void> {
    this.backendError = false;
    if (!this.contestants) {
      return;
    }

    // find if we already voted for this user
    if (this.contestants![contestantIndex].myPoints) {
      const v = this.currentAvailableVotesLeft.find(x => x.points === this.contestants![contestantIndex].myPoints);
      if (v) {
        v.instances++;
      } else {
        this.currentAvailableVotesLeft.push({points: this.contestants![contestantIndex].myPoints, instances: 1});
      }

      const isRevoke = this.contestants![contestantIndex].myPoints === points;

      // revoke from myVotes
      this.myVotes = this.myVotes.filter(x => x.candidateId !== this.contestants![contestantIndex].id);
      this.contestants![contestantIndex].myPoints = undefined;

      // if we're revoking rather than changing the vote, we're done here
      if (isRevoke) {
        try {
          await http.post('vote', {votes: this.myVotes});
          return;
        } catch (e) {
          await this.setupVoting();
          if (!recursing) {
            this.voteFor(contestantIndex, points, true);
            console.log('second attempt — voted for', contestantIndex, 'gave them', points, 'points');
          } else {
            console.warn('we are recursing too deep, quitting!');
            this.backendError = true;
          }
        }
      }
    }

    // this means we need to re-assign votes
    if (! this.currentAvailableVotesLeft.find(x => x.points === points)) {
      console.log('no available votes with this pint value > clearing existing votes');
      // remove existing votes for this score
      this.myVotes = this.myVotes.filter(x => x.points !== points);
      this.contestants = this.contestants!.map(x => ({
        ...x,
        myPoints: x.myPoints === points ? 0 : x.myPoints
      }));

      // Restore available votes
      this.currentAvailableVotesLeft.push(
        JSON.parse(JSON.stringify(this.availableVotes.find(x => x.points === points)))
      );
    }

    this.decreaseAvailableVotes(points);

    this.myVotes.push({candidateId: this.contestants![contestantIndex].id, points: points});
    this.contestants![contestantIndex].myPoints = points;

    // update backend. Validating whether user voted at appropriate should be done on the backend.
    try {
      await http.post('/vote', {votes: this.myVotes});
      console.log('voted for', contestantIndex, 'gave them', points, 'points');

      // ensure the banner always turns visible after any successful vote
      this.hideRemainingVotesHeader = false;
    } catch (e) {
      console.error('proble with voting. voting probably restarted. Reseting our ID and recasting vote');
      console.error('error:', e);

      await this.setupVoting();

      try {
        if (!recursing) {
          this.voteFor(contestantIndex, points, true);
          console.log('second attempt — voted for', contestantIndex, 'gave them', points, 'points');
        } else {
          console.warn('we are recursing too deep, quitting!');
          this.backendError = true;
        }
      } catch (e) {
        console.error('Problem with voting persists.');
        console.error('error:', e);
      }
    }
  }
}
</script>

<style lang="scss">
@import '../../node_modules/bootstrap/scss/bootstrap';

.contestant-option {
  position: relative;
  display: block;
  height: 42rem;
  width: 28rem;
}

.image-container {
  width: 100%;
  height: 100%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
}

@include media-breakpoint-down(md) {
  // assume everyone's gonna hold their phone portrait
  .contestant-option {
    width: 100vw;
    height: 150vw;
  }
}

.no-image-overlay,
.contestant-info-row,
.remaining-votes-header,
.vote-menu {
  background-color: rgba(0,0,0,0.60);
  backdrop-filter: blur(0.25rem);
}

.no-image-overlay {
  padding: 2rem;
}

.grow-1 {
  flex-grow: 1
}
.grow-0 {
  flex-grow: 0;
}
.shrink-0 {
  flex-shrink: 0;
}

.dummy-button {
  padding: 0.5rem 1rem;
  background-color: rgba(255, 152, 69, 0.90);
  text-transform: uppercase;
  border: 0px;
  font-size: 0.75rem;
}

.contestant-image {
  &:before {
    position: absolute;
    width: 100%;
    height: 100%;
    content: ' ';
    background: url('../assets/images/centaur.webp');
    background-position: center;
    background-size: cover;
  }
  &:after {
    content: 'uwu upsi wupsi, j... bebek.\ani slike :(';
    display: block;
    position: absolute;
    white-space: pre;
    top: 50%;
    width: 100%;
    transform: translateY(-50%);
    background-color: rgba(0,0,0,0.69);
    color: #fff;
    text-align: center;
    padding: 1rem;
    font-size: 1.5rem;
    font-weight: 300;
  }
}

.contestant-info-row {
  padding: 0.5rem 1rem;

  .title {
    color: #fff;
    font-weight: 300;
    font-size: 1.5rem;
  }
  .name {
    color: rgba(255, 255, 255, 0.69);
  }
}

.vote-menu {

  .title {
    color: #fff;
    font-weight: 300;
    font-size: 2rem;
  }
  .name {
    color: rgba(255, 255, 255, 0.69);
    font-size: 1.25rem;
  }

  .hr-line {
    width: 75%;
    border-bottom: 1px solid white;
    height: 1px;
    margin-bottom: 1rem;
  }

  &.has-vote {
    .vote-option.revocation {
      background-color: rgba(rgba(255,152,69,0.69), 0.69);
      color: #fff;
    }
  }

  .vote-option {
    width: 75%;
    margin: 0.125rem;

    background-color: rgba(white, 0.1);



    .point-value {
      font-size: 2rem;
      font-weight: 300;
      margin-bottom: -0.2em;
    }

    &:not(.revocation):not(.reassign-vote):not(.change-points) {
      .vote-special {
        display: none;
      }
      .revoke-vote {
        display: none;
      }
    }
    &.revocation {
      .vote-normal {
        display: none;
      }
      .vote-special {
        display: none;
      }
    }
    &.reassign-vote,
    &.change-points {
      .vote-normal {
        display: none;
      }
      .revoke-vote {
        display: none;
      }
    }
    &.change-points {
      .reassignment {
        display: none;
      }
    }
    &.reassign-vote {
      .point-change {
        display: none;
      }
    }
  }
}

.vote-option-card {
  backdrop-filter: blur(0.25rem);
  background-color: rgba(199, 103, 34, 0.437)
}

.vote-button {
  border: 1px solid rgba(255,152,69,0.69);
  color: rgba(255,152,69,0.69);

  &.voted {
    background-color: rgba(255, 152, 69, 0.90);
    color: #000;
  }
}

.small {
  font-size: 0.75rem;
}
.smallest {
  font-size: 0.5rem;
}

.loading-bg {
  top: 0;
  left: 0;
  position: fixed;
  // z-index: -1;
  height: 100vh;
  width: 100vw;
  background: url('../assets/images/lazy.webp');
  background-size: cover;
  background-position: right center;

  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
}
</style>
