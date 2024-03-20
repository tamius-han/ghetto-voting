<template>
  <div class="h-100 relative">

    <div class="no-scroll justify-content-center align-items-center">
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
      <div v-else-if="contestants && contestants.length === 0">
        <h2>Malo prezgodej za glasovanje, eh?</h2>
        <p>Če vidiš to sporočilo, potem tekmovalcev še ni.</p>
        <p>Organizatorji dogodka bodo verjetno najavili, kje in kdaj.</p>
      </div>
      <template v-else>

        <!-- VRSTA 1: TRENUTNI TEKMOVALEC | REŽIJA -->
        <div class="d-flex flex-row current-info">
          <div class="contestant-stage">
            <div class="cs">
              <div class="thumbnail-image">
                <img v-if="! (currentIndex < 0)" :src="imageBaseUrl + (currentIndex) + '/image'" loading="lazy" alt="&nbsp;"/>
              </div>
              <div class="info">
                <h3>TRENUTNO NA ODRU</h3>
                <template v-if="currentIndex < 0">
                  <div class="main">
                    <h2>Nihče.</h2>
                  </div>
                  <div class="stats">
                    <h3>{{currentIndex + 1}}/{{contestants?.length}} — še {{contestants?.length - currentIndex - 1}}</h3>
                  </div>
                </template>
                <template v-else-if="currentIndex >= contestants?.length">
                  <h2>Fertik smo.</h2>
                </template>
                <template v-else>
                  <div class="main">
                    <h2><small>Nastopajoči:<br/></small> {{contestants[currentIndex].name}}</h2>
                    <h1><small>Ime kostuma:<br/></small> {{contestants[currentIndex].title}}</h1>
                  </div>
                  <div class="stats">
                    <h3><small>Števec:<br/></small>{{currentIndex + 1}}/{{contestants?.length}} — še {{contestants?.length - currentIndex - 1}}</h3>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div class="backstage-notes">
            <h3>Sporočila režije</h3>
            <div contenteditable class="msg" style="border: 1px dotted #fa6">

            </div>
            <div class="button-row">
              <button @click="setIndex(currentIndex - 1)">Nazaj</button>
              <button @click="setIndex(currentIndex + 1)">Naprej</button>
            </div>
          </div>
        </div>

        <div class="prev-next-contestants">
          <div class="prev-contestant">
            <h4>Prej:</h4>
            <template v-if="currentIndex > 0">
              <div class="cs contestant-mini">
                <div class="thumbnail-image">
                  <img v-if="! (currentIndex < 0)" :src="imageBaseUrl + (currentIndex - 1) + '/image'" loading="lazy" alt="&nbsp;"/>
                </div>
                <div class="info">
                  <h2><small>Nastopajoči:<br/></small> {{contestants[currentIndex - 1].name}}</h2>
                  <h1><small>Ime kostuma:<br/></small> {{contestants[currentIndex - 1].title}}</h1>
                </div>
              </div>
            </template>
          </div>
          <div class="next-contestants">
            <h4>Sledi:</h4>
            <template v-if="contestants[currentIndex + 1]">
              <div class="cs-list">
                <div class="cs contestant-mini">
                  <div class="thumbnail-image">
                    <img :src="imageBaseUrl + (currentIndex + 1) + '/image'" loading="lazy" alt="&nbsp;"/>
                  </div>
                  <div class="info">
                    <h2><small>Nastopajoči:<br/></small> {{contestants[currentIndex + 1].name}}</h2>
                    <h1><small>Ime kostuma:<br/></small> {{contestants[currentIndex + 1].title}}</h1>
                  </div>
                </div>

                <div v-if="contestants[currentIndex + 2]" class="cs contestant-mini">
                  <div class="thumbnail-image">
                    <img :src="imageBaseUrl + (currentIndex + 2) + '/image'" loading="lazy" alt="&nbsp;"/>
                  </div>
                  <div class="info">
                    <h2><small>Nastopajoči:<br/></small> {{contestants[currentIndex + 2].name}}</h2>
                    <h1><small>Ime kostuma:<br/></small> {{contestants[currentIndex + 2].title}}</h1>
                  </div>
                </div>
                <template v-else>
                  <div class="contestant-mini">
                    <div class="thumbnail-image">
                    </div>
                    <div>
                      <h2>Kmalu bomo fertik</h2>
                    </div>
                  </div>
                </template>
              </div>
            </template>
            <template v-else>
              <div class="cs contestant-mini">
                <div class="thumbnail-image">
                </div>
                <div>
                  <h3>Ejga, fertik bomo.</h3>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import HelloWorld       from '@/components/HelloWorld.vue'; // @ is an alias to /src
import http             from '@/http-common';
import { Vote }         from 'common/types/vote-record.interface';

@Options({
  components: {
    HelloWorld,
  },
})
export default class VotingComponent extends Vue {
  contestants?: any[] | undefined | null = null;
  currentIndex?: number = -1;
  imageBaseUrl?: string;
  activeContestantVoteMenu?: number = -1;

  backendError = false;

  created() {
    this.setupVoting();

    window.addEventListener("keyup", (event) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case 'MediaTrackNext':
          this.setIndex((this.currentIndex ?? 0) + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'MediaTrackPrevious':
          this.setIndex((this.currentIndex ?? 0) - 1);
          break;
      }
    });
  }

  private async setupVoting() {
    this.backendError = false;
    try {
      this.imageBaseUrl = `${http.defaults.baseURL}contestants/`;
      await this.listContestants();  // must be loaded _before_ user's current votes load
    } catch (e) {
      this.backendError = true;
      throw e;
    }
  }

  private async listContestants() {
    const res = await http.get('/contestants');

    this.contestants = [];
    for (const c in res.data) {
      this.contestants.push(res.data[c]);
    }
  }

  setIndex(index: number): void {
    this.currentIndex = Math.max(Math.min(this.contestants?.length ?? 0, index), -1);
  }

}
</script>

<style lang="scss">
@import '../../node_modules/bootstrap/scss/bootstrap';

.h-100 {
  height: 100dvh;
  overflow: hidden;
}

.no-scroll {
  height: 100dvh;
  overflow: hidden;
  display: block;
}

.contestant-stage {
  h3 {
    color: #fa6;

    small {
      font-size: 1rem;
    }
  }
  h2, h1 {
    color: #fff;

    small {
      font-size: 1.25rem;
    }
  }
  h1, h2, h3 {
    small {
      opacity: 0.69;
      text-transform: uppercase;
    }
  }

  h1 {
    font-size: 3rem;
  }

  .cs .info {
    display: flex;
    flex-direction: column;

    .main {
      flex-grow: 1;
    }
  }
}

.backstage-notes {
  display: flex;
  flex-direction: column;

  .msg {
    margin: 2rem 0rem;
    flex-grow: 1;
    padding: 0.5rem 1rem;
    font-size: 1.5rem;
  }
}


.current-info {
  height: 65dvh;
  width: 100%;
  padding: 2rem;

  border-bottom: 1px dotted #fa6;

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .contestant-stage {
    width: 69%;
  }
  .backstage-notes {
    width: 28%;
  }

  .button-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    button {
      background: #fa6;
      color: #000;
      padding: 1rem 2rem;
      border: 0px;
    }
  }
}
.prev-next-contestants {
  height: 25rem;
  width: 100%;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;

  background-color: rgba(rgb(168, 162, 228), 0.05);


  > * {
    padding: 2rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .prev-contestant {
    width: 30%;
    opacity: 0.69;

    h4 {
      color: rgb(163, 156, 235);
    }
    h1, h2 {
      color: rgb(169, 166, 207);

      small {
        color: rgb(163, 156, 235);
      }
    }

  }
  .next-contestants {
    width: 60%;

    background-color: rgba(rgb(243, 199, 163), 0.05);

    display: flex;
    flex-direction: column;

    .cs-list {
      flex-grow: 1;
      flex-shrink: 1;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: flex-end;

      > * {
        width: 50%;
        padding: 0 2rem;
      }
    }

    h4 {
      color: #fa6;
    }
    h1, h2 {
      color: rgb(226, 204, 186);
      small {
        color: #fa6;
      }
    }
  }

  h4 {
    font-size: 1.25rem;
    text-transform: uppercase;
  }

  h2, h1 {
    small {
      font-size: 0.88rem;
      text-transform: uppercase;
      opacity: 0.69;
    }
  }
  h1 {
    font-size: 2.25rem;
  }
  h2 {
    font-size: 1.75rem;
  }
}

.cs {
  display: flex;
  flex-direction: row;
  height: 100%;

  .thumbnail-image {
    height: 100%;
    aspect-ratio: 2/3;

    display: flex;
    justify-content: center;
    align-items: center;

    img {
      height: 100%;
      width: 100%;

      object-fit: contain;
    }
  }

  .info {
    margin: 2rem;
  }

  &.contestant-mini {
    .thumbnail-image {
      height: 28dvh;
    }
    .info {
      margin: 0rem 1.5rem;
    }
  }
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
