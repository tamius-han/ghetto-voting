<template>
  <div class="page-bg"></div>
  <div class="page-admin">

    <div v-if="isAuthorized">
      <h1 class="text-center">
        Grûmšovi knofi in statistike
        <span
          style="font-size: 0.5em; font-weight: 250; display: block; margin-top: -1.75em;"
        ><br/>Ponosni sponzor: Železna Legija</span>
      </h1>

      <div class="d-flex flex-row admin-panel-row">
        <div class="panel">
          <h3>Nadzor glasovanja</h3>

          <div>
            Glasovanje je <span>ODPRTO</span><span>ZAPRTO</span><br/>
            Začetek glasovanja: todo<br/>
            Čas od zadnjega glasu:
          </div>

          <div class="d-flex flex-row">
            <div class="button">Počisti tekmovalce</div>
            <div class="button">Začni novo glasovanje</div>
            <div class="button">Nadaljuj glasovanje</div>
            <div class="button">Ustavi glasovanje</div>
          </div>
          <div></div>
        </div>

        <div class="panel">
          <h3>Nastavitve točkovanja</h3>
          <div class="field">
            <div class="label">Število žirantov:</div> <input /><br/>
          </div>
          <div class="d-flex flex-row">

          </div>
        </div>
      </div>

      <div class="">
        <h1 class="text-center" style="font-size: 5rem; font-weight: 250">REZULTATI GLASOVANJA</h1>

        <div class="d-flex flex-row top3-row">
          <template v-for="(contestant, index) of results.combined" :key="index">
            <template v-if="(index < 3)">
              <div class="top3">
                <div class="image-container position-relative">
                  <img class="contestant-image" :src="imageBaseUrl + contestant.id + '/image'" loading="lazy" alt="&nbsp;"/>
                </div>
                <div
                  class="contestant-info-row d-flex flex-row position-absolute bottom-0 left-0 w-100"
                >
                  <div class="flex-grow-1 flex-shrink-1 d-flex flex-column">
                    <div class="title">{{contestant.title}}</div>
                    <div class="name">{{contestant.name}}</div>
                    <div class="score">sum: {{contestant.combinedScore}}; glasov: {{contestant.votes}}; žirija: {{(contestant.juryVotes)}}</div>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>

      </div>
      <div>
        <h2>Skupni seštevki v celoti</h2>
      </div>

      <div class="d-flex flex-row result-panels" style="width: 100%">

        <!-- Combined votes panel -->
        <div class="panel">
          <h3>Skupni seštevek</h3>

          <div>
            <div
              v-for="(contestant, index) of results.combined"
              :key="contestant.id"
            >
              <b>{{(index + 1)}}.: {{contestant.title}}</b> by <i>{{contestant.name}}</i><br/>
              <small>Točk: {{contestant.combinedScore}}; glasov: {{contestant.votes}}; ocena žirije: {{contestant.juryVotes}}</small>
            </div>
          </div>
        </div>

        <!-- Public votes panel -->
        <div class="panel">
          <h3>Glas publike</h3>

          <div>
            <div
              v-for="(contestant, index) of results.public"
              :key="contestant.id"
            >
              <b>{{(index + 1)}}.: {{contestant.title}}</b> by <i>{{contestant.name}}</i><br/>
              <small>Uvrstitev na {{(index + 1)}}. mesto po izboru publike prinese {{intermediateScoresArray[index]}} točk v skupnem seštevku.</small><br/>
              <small>Glasov: {{contestant.votes}}; ocena žirije: {{contestant.juryVotes}}.</small>
            </div>
          </div>
        </div>

        <!-- Jury votes panel -->
        <div class="panel">
          <h3>Glas žirije</h3>

          <div>
            <div
              v-for="(contestant, index) of results.public"
              :key="contestant.id"
            >
              <b>{{(index + 1)}}.: {{contestant.title}}</b> by <i>{{contestant.name}}</i><br/>
              <small>Uvrstitev na {{(index + 1)}}. mesto po izboru žirije prinese {{(intermediateScoresArray[index] ?? 0) + juryPrecedence}} točk v skupnem seštevku.</small><br/>
              <small>Glasov: {{contestant.votes}}; ocena žirije: {{contestant.juryVotes}}.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import http from '@/http-common';

@Options({

})
export default class AdminComponent extends Vue {
  imageBaseUrl = '';
  isAuthorized = true;

  results: {
    rawData: any[],
    public?: any[],
    jury?: any[],
    combined?: any[]
  } = {
    rawData: [],
    public: [],
    jury: [],
    combined: [],
  };

  intermediateScoresArray = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];
  chuckNorrisVotes = [];
  juryPrecedence = 0;    // jury's intermediateScoresArray is by this much bigger than

  async created() {
    this.imageBaseUrl = `${http.defaults.baseURL}contestants/`;
    this.results.rawData = (await http.get('/results'))?.data ?? [];
    this.processVotes();
  }

  processVotes() {
    // sort by votes
    const sortedPublic = JSON.parse(JSON.stringify(this.results.rawData)).sort((a: any,b: any) => {
      return b.votes - a.votes;
    });
    const sortedJury = JSON.parse(JSON.stringify(this.results.rawData)).sort((a: any,b: any) => {
      return b.juryVotes - a.juryVotes;
    })


    for (let i = 0; i < sortedPublic.length; i++) {
      const score = this.intermediateScoresArray[i] ?? 0;

      // handle ties
      if (i > 0&& sortedPublic[i].votes === sortedPublic[i-1].votes ) {
        sortedPublic[i].intermediateScore = sortedPublic[i-1].intermediateScore;
      } else {
        sortedPublic[i].intermediateScore = score;
      }

      if (i > 0 && sortedJury[i].juryVotes === sortedJury[i-1].juryVotes) {
        sortedJury[i].intermediateScore = sortedJury[i-1].intermediateScore;
      } else {
        sortedJury[i].intermediateScore = score;
      }
    }

    // save copy of temporary jury/public-specific votes
    this.results.public = JSON.parse(JSON.stringify(sortedPublic));
    this.results.jury = JSON.parse(JSON.stringify(sortedJury));

    const sortById = (a: any, b: any) => {
      return a.id < b.id;
    }

    // sort by ID
    sortedPublic.sort(sortById);
    sortedJury.sort(sortById);

    const combinedResult = [];
    for (let i = 0; i < sortedPublic.length; i++) {
      combinedResult.push({
        ...sortedPublic[i],
        combinedScore:
          (sortedPublic[i].intermediateScore ?? 0)
          + (sortedJury[i].intermediateScore ? sortedJury[i].intermediateScore + this.juryPrecedence: 0)
          + (this.chuckNorrisVotes.find((x: any) => x.id === sortedPublic[i].id) ?? 0)
      })
    }

    combinedResult.sort((a: any, b: any) => {
      return b.combinedScore - a.combinedScore;
    });

    this.results.combined = combinedResult;
  }
}
</script>

<style lang="scss" scoped>
@import '../../node_modules/bootstrap/scss/bootstrap';


$firstPlaceGold: rgb(233, 179, 91);
$secondPlaceSilver: rgb(187, 186, 190);
$thirdPlaceBronze: rgb(172, 117, 66);

.page-bg {
  top: 0;
  left: 0;
  position: fixed;
  // z-index: -1;
  height: 100vh;
  width: 100vw;
  background: url('../assets/images/admin-bg.webp');
  background-size: cover;
  background-position: 55% center;
}

.page-admin {
  font-size: 12px;
  h1 {
    font-size: 2.5em;
  }
  h3 {
    font-size: 1.5em;
  }

  @media (min-width: 2560px) {
    font-size: 16px;
    h1 {
    font-size: 2.5em;
  }
  h3 {
    font-size: 1.5em;
  }

  }

  position: relative;
  z-index: 1;
}

.admin-panel-row {
  justify-content: flex-end;
}

.result-panels {
  justify-content: center;
}

.panel {
  margin: 1rem;
  padding: 1rem;
  background-color: rgba(0,0,0,0.69);
  backdrop-filter: blur(5px) saturate(0.5);
}

.ml-4 {
  margin-left: 2rem;
}

.top3-row {
  margin-top: 5rem;
  width: 100%;
  align-items: flex-end;
  justify-content: center;

  .top3 {
    position: relative;
    aspect-ratio: 2/3;
    margin: 2rem;

    .image-container {
      width: 100%;
      height: 100%;
      margin: 0;
    }

    .contestant-info-row {
      background-color: rgba(0,0,0,0.69);
      backdrop-filter: blur(5px) saturate(0.5) brightness(0.5);
    }


    .score {
      font-size: 0.5rem;
      color: rgb(102, 85, 62);
    }

    &::after {
      position: absolute;
      z-index: 10;
      top: 0;
      left: 0;
      display: block;
      border-radius: 50%;
      text-align: center;
      transform: translate(-50%, -50%);
    }

    &:nth-of-type(99n-98) {
      border: 3px solid $firstPlaceGold;
      height: 36rem;
      order: 2;
      margin-left: 5rem;
      margin-right: 5rem;

      &::after {
        content: "1.";
        background-color: $firstPlaceGold;
        color: #fff;
        font-size: 6.9rem;
        width: 8.8rem;
        height: 8.8rem;
      }

      .contestant-info-row {
        .title {
          color: $firstPlaceGold;
          font-weight: 300;
          font-size: 2rem;
        }
        .name {
          color: rgba($firstPlaceGold, 0.5);
          font-size: 1.25rem;
        }
      }
    }

    &:nth-of-type(99n-97) {
      height: 24rem;
      order: 1;
      border: 2px solid $secondPlaceSilver;

      .title {
        color: $secondPlaceSilver;
        font-weight: 300;
        font-size: 1.5rem;
      }
      .name {
        color: rgba($secondPlaceSilver, 0.5);
        font-size: 1.1rem;
      }

      &::after {
        content: "2.";
        background-color: $secondPlaceSilver;
        color: #fff;
        font-size: 2.75rem;
        width: 4rem;
        height: 4rem;
      }
    }

    &:nth-of-type(99n-96) {
      height: 18rem;
      order: 3;
      border: 1px solid $thirdPlaceBronze;

      .title {
        color: $thirdPlaceBronze;
        font-weight: 300;
        font-size: 1rem;
      }
      .name {
        color: rgba($thirdPlaceBronze, 0.5);
        font-size: 0.8rem;
      }

      &::after {
        content: "3.";
        background-color: $thirdPlaceBronze;
        color: #fff;
        font-size: 1.75rem;
        width: 2.5rem;
        height: 2.5rem;
      }
    }

  }
}

.contestant-row {
  align-items: center;
}

.image-container {
  width: 6.9rem;
  aspect-ratio: 2/3;
  margin: 1rem 2rem;
  margin-left: 0rem;
}

.contestant-image-placeholder {
  &:before {
    position: absolute;
    width: 100%;
    height: 100%;
    content: ' ';
    // background: url('../assets/images/centaur.webp');
    background-position: center;
    background-size: cover;
  }
  &:after {
    content: 'BREZ SLIKE';
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
    font-size: 0.69rem;
  }
}

.image-upload-line {
  margin-left: 2rem;
}

.contestant-name-display {
  font-size: 1.5rem;
}

.button {
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  background-color: #000;
  color: #fa6;
  cursor: pointer;

  &.red {
    background-color: rgb(123, 12, 28);
    color: rgb(254, 193, 143);

    &:hover {
      background-color: rgb(239, 11, 45);
      color: #000;
    }
  }

  &:hover {
    color: #000;
    background-color: #fa6;
  }
}

h1 {
  color: #fff;
}
h3 {
  color: #fa6;
}
</style>

