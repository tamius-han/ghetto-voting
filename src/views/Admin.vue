<template>
  <!-- <div class="page-bg"></div> -->
  <div class="page-admin flex-grow-1">
    <div v-if="passwordPhase === 0">
      <h2>No vodka, no passage.</h2>
      <p>Give vodka, you passage.</p>
      <input v-model="password" @input="checkPassword()" />
    </div>
    <div v-if="passwordPhase === 1">
      <h2>No vodka, no passage.</h2>
      <p>Narobe, trolov pod mostovi se ne futra. Mrš.</p>
      <input v-model="password" @input="checkPassword()" />
    </div>
    <div v-if="passwordPhase === 2">
      <h2>No vodka, no passage.</h2>
      <p>
        That's the spirit! Unfortunately for you, you aren't allowed to feed the drunk
        troll under the bridge — even if you are a cultured individual.
      </p>
      <input v-model="password" @input="checkPassword()" />
    </div>

    <div v-if="passwordPhase === 3">
      <h1 class="text-center">
        Grûmšovi knofi in statistike
        <span
          style="font-size: 0.5em; font-weight: 250; display: block; margin-top: -1.75em"
          ><br />Ponosni sponzor: Železna Legija</span
        >
      </h1>

      <div class="d-flex flex-row admin-panel-row">
        <div class="panel">
          <h3>Glasovanja</h3>
          <div>
            <div>Trenutno, nedavno, prihodnje</div>
            <div>Celotna zgodovina</div>
          </div>

          <div>
            <div v-for="voting of displayedVotings" :key="voting.id">
              <template v-if="voting._editing">
                <div>
                  <div class="d-flex flex-row">
                    <div class="contest-names-desc">
                      <div><b>Podatki o tekmovanju</b></div>
                      <div
                        v-for="(language, key) of voting.data"
                        :key="key"
                        class="names"
                      >
                        <div class="field">
                          <div class="label">Jezik</div>
                          <div class="input">{{ key }}</div>
                        </div>
                        <div class="field">
                          <div class="label">Naslov</div>
                          <div class="input">
                            <input v-model="voting.data[key].name" />
                          </div>
                        </div>
                        <div class="field">
                          <div class="label">Opis</div>
                          <div class="input">
                            <input v-model="voting.data[key].description" />
                          </div>
                        </div>
                        <div class="field">
                          <div class="label">Dogodek</div>
                          <div class="input">
                            <input v-model="voting.data[key].event" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <b>Datum glasovanja</b>
                      <div class="field">
                        <div class="label">Datum glasovanja (za prikaz)</div>
                        <div class="input"><input v-model="voting.voteDate" /></div>
                      </div>
                    </div>
                    <div>
                      <div><b>Prijave</b></div>
                      <div class="label">Omogoči javne prijave</div>
                      <div class="input">
                        <select v-model="voting.publicRegistrationsOpen">
                          <option :value="true">Prijave dovoljene</option>
                          <option :value="false">Prijave zaprte</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <div><b>Glasovajne</b></div>
                      <div class="field">
                        <div class="label">Omogoči javno glasovanje</div>
                        <div class="input">
                          <select v-model="voting.publicVotingOpen">
                            <option value="true">Glasovanje odprto</option>
                            <option value="false">Glasovanje zaprto</option>
                          </select>
                        </div>
                      </div>
                      <div class="field">
                        <div class="label">Samodejno odpri glasovanje ob:</div>
                        <div class="input"><input v-model="voting.openVotingAt" /></div>
                      </div>
                      <div class="field">
                        <div class="label">Samodejno zapri glasovanje ob:</div>
                        <div class="input"><input v-model="voting.closeVotingAt" /></div>
                      </div>
                      <div class="field">
                        <div class="label">Žirantje (email, ločeni z vejico)</div>
                        <div class="input"><input v-model="voting.juryEmails" /></div>
                      </div>
                      <div class="field">
                        <div class="label">Žirantje (disord ID, ločeni z vejico)</div>
                        <div class="input"><input v-model="voting.juryDiscordIds" /></div>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex flex-row">
                    <button>Shrani spremembe</button>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="d-flex flex-row">
                  <div>
                    <div class="voting-header">[{{ voting.id }}] {{ voting.name }}</div>
                    <div class="voting-description">{{ voting.description }}</div>
                  </div>
                  <div class="voting-data d-flex flex-row">
                    <!-- podatki o žiriji -->
                    <div>Žirija: todo</div>

                    <!-- podatki o prijavah -->
                    <div>
                      <div>
                        <b>Prijave</b>
                      </div>
                      <div>(status)</div>
                      <div>zapri/odpri knof</div>
                      <div>auto-close if applicable</div>
                    </div>

                    <!-- podatki o stanju tekmovanja -->
                    <div>
                      <div>
                        <b>Glasovanje</b>
                      </div>
                      <div>(status)</div>
                      <div>zapri/odpri knof</div>
                      <div>auto-close if applicable</div>
                    </div>

                    <!-- dodatne zahteve -->
                    <div>
                      <div>
                        <b>Dodatne zahteve</b>
                      </div>
                      <div>(oauth required?)</div>
                      <div>require/unrequire</div>
                    </div>

                    <!-- statistike glasovanja -->
                    <div>
                      <div><b>Statistike</b></div>
                      <div>Volilnih upravičencev:</div>
                      <div>Veljavnih glasov:</div>
                      <div>Čas od zadnjega oddanega glasu:</div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="panel">
          <h3>Nadzor glasovanja</h3>

          <div>
            Podatki se osvežijo vsakih 15 sekund ... ish.<br />
            <div class="refresh-line">
              <div
                class=""
                :class="{ reset: activeRefresh, 'refresh-line-bar': !activeRefresh }"
              ></div>
            </div>
            <template v-if="lastPublicVoteAgo">
              Čas od zadnjega glasu: {{ lastPublicVoteAgo }}<br />
              Volilnih upravičencev: {{ voteStatistics.voters }}<br />
              Oddanih glasovnic: {{ voteStatistics.submittedVotes }}<br />
            </template>
            Stanje glasovanja: <span v-if="votingStarted" style="color: #3fa">odprto</span
            ><span v-else style="font-weight: 700; color: #f00">ZAPRTO</span><br />
            &nbsp;
          </div>

          <div class="d-flex flex-row">
            <div class="button" @click="resetContestants()">Počisti tekmovalce</div>
            <div class="button" @click="resetVoting()">Resetiraj glasovanje</div>
          </div>

          <div class="d-flex flex-row">
            <div class="button" @click="startVoting">Začni glasovanje</div>
            <div class="button red" @click="stopVoting">Ustavi glasovanje</div>
          </div>

          <div></div>
          <a @click="showLoadTesting = !showLoadTesting"
            >Skrij/pokaži možnosti testiranja obremenitve</a
          >
          <template v-if="showLoadTesting">
            <div><br /><br />Prekomerno obremeni backend:</div>
            <p>
              Hkratnih glasovanj na batch: <input v-model="loadSimulatorConf.batchSize" />
            </p>
            <p>
              Hkratnih batch-ev: <input v-model="loadSimulatorConf.concurrentBatches" />
            </p>
            <p>Skupaj batchev: <input v-model="loadSimulatorConf.totalBatches" /></p>
            <p>
              Hkratnih zahtevkov:
              {{ loadSimulatorConf.batchSize * loadSimulatorConf.concurrentBatches }};
              vseh simuliranih glasov:
              {{ loadSimulatorConf.batchSize * loadSimulatorConf.totalBatches }}
            </p>
            <div class="d-flex flex-row">
              <div class="button red" @click="runLoadTest()">Stress test</div>
              <div class="button" @click="stopLoadTest()">Stop load test</div>
            </div>
          </template>
        </div>

        <div class="panel">
          <h3>Nastavitve točkovanja</h3>
          <p>Število žirantov se nastavi na strani za žirijo.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import HelloWorld       from "@/components/HelloWorld.vue"; // @ is an alias to /src
import VoteStatusFlags  from "../../common/enums/vote-status-flags.enum";
import http             from "@/http-common";
import axios            from "axios";

@Options({})
export default class AdminComponent extends Vue {
  imageBaseUrl = "";
  passwordPhase = 0;
  password = "";
  stressTestInProgress = false;
  VoteStatusFlags = VoteStatusFlags;

  results: {
    rawData: any[];
    public?: any[];
    jury?: any[];
    combined?: any[];
  } = {
    rawData: [],
    public: [],
    jury: [],
    combined: [],
  };

  displayedVotings = [
    {
      id: 1,
      data: {
        sl: {
          name: "Demo",
          description: "Demo glasovanje",
          event: "Kud je amulet?",
        },
        en: {
          name: "Demo",
          description: "Demo voting",
          event: "Where amulet?",
        },
      },
      publicRegistrationsOpen: false,
      requireOauth: true,
      publicVoteOpen: true,
      createdAt: new Date(),
      voteDate: "",
      closeRegistrationAt: null,
      openVotingAt: new Date(),
      closeVotingAt: new Date(),
      _editing: true,
    },
  ];

  intermediateScoresArray = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];
  chuckNorrisVotes = [];
  juryPrecedence = 0; // jury's intermediateScoresArray is by this much bigger than
  lastPublicVoteAgo?: string = "";
  voteStatistics = {
    voters: "0",
    submittedVotes: "0",
  };
  activeRefresh = false;

  loadSimulatorConf = {
    inProgress: false,
    batchSize: 8,
    concurrentBatches: 4,
    totalBatches: 64,
  };

  showLoadTesting = false;

  votingStarted = false;

  created() {
    this.reloadContestants();
    this.password = localStorage.getItem("pass-admin") ?? "";
    this.checkPassword();

    setInterval(() => this.reloadContestants(), 15000);
    setInterval(() => this.refreshVoteStatus(), 5000);
  }

  checkPassword() {
    if (this.password === "vodka") {
      this.passwordPhase = 1;
    }
    if (
      this.password
        .toLocaleLowerCase()
        .trim()
        .startsWith("do i look like an innkeeper to you")
    ) {
      this.passwordPhase = 2;
    }
    if (this.password === "jakikaki") {
      this.passwordPhase = 3;
    }

    localStorage.setItem("pass-admin", this.password);
  }

  private async refreshVoteStatus() {
    // if this ever goes through cloudflare, this should trick it into caching
    // request made within a period of 3 seconds
    const res = await http.get(`/vote-start?ts=${(+new Date() / 3000).toFixed()}`);
    this.votingStarted = res.data.votingStarted;
  }

  async reloadContestants() {
    this.activeRefresh = true;
    try {
      const lastPublicVoteTs = (await http.get("/last-public-vote"))?.data
        ?.lastPublicVoteTime;
      if (lastPublicVoteTs) {
        const diff = +new Date() - +lastPublicVoteTs;

        if (diff > 600000) {
          this.lastPublicVoteAgo = "last public vote was waay ago (more than 10m)";
        } else {
          const min = Math.floor(diff / 60000);
          const sec = ((diff - +min * 60000) / 1000).toFixed();

          this.lastPublicVoteAgo = +min > 0 ? `${min}m ${sec}s` : `${sec}s`;
        }
      } else {
        this.lastPublicVoteAgo = "";
      }
    } catch (e) {
      console.warn("could not get last public vote time.");
      this.lastPublicVoteAgo = "Mamo problem, tega podatka ne ratamo dobit ?";
    }
    try {
      this.voteStatistics = (await http.get("/ballot-count"))?.data;
    } catch (e) {
      console.warn("could not get last public ballot count");
      this.voteStatistics = {
        voters: "uh, problem?",
        submittedVotes: "tud problem",
      };
    }

    this.imageBaseUrl = `${http.defaults.baseURL}contestants/`;
    this.results.rawData = (await http.get("/results"))?.data ?? [];
    this.processVotes();

    this.$nextTick(() => {
      this.$forceUpdate();
      this.$nextTick(() => {
        this.activeRefresh = false;
        this.$forceUpdate();
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  processVotes() {
    // sort by votes
    const sortedPublic = JSON.parse(JSON.stringify(this.results.rawData)).sort(
      (a: any, b: any) => {
        return b.votes - a.votes;
      }
    );
    const sortedJury = JSON.parse(JSON.stringify(this.results.rawData)).sort(
      (a: any, b: any) => {
        return b.juryVotes - a.juryVotes;
      }
    );

    for (let i = 0; i < sortedPublic.length; i++) {
      const score = this.intermediateScoresArray[i] ?? 0;

      // handle ties
      if (i > 0 && sortedPublic[i].votes === sortedPublic[i - 1].votes) {
        sortedPublic[i].intermediateScore = sortedPublic[i - 1].intermediateScore;
      } else {
        sortedPublic[i].intermediateScore = score;
      }

      if (i > 0 && sortedJury[i].juryVotes === sortedJury[i - 1].juryVotes) {
        sortedJury[i].intermediateScore = sortedJury[i - 1].intermediateScore;
      } else {
        sortedJury[i].intermediateScore = score;
      }
    }

    // save copy of temporary jury/public-specific votes
    this.results.public = JSON.parse(JSON.stringify(sortedPublic));
    this.results.jury = JSON.parse(JSON.stringify(sortedJury));

    const sortById = (a: any, b: any) => {
      return a.id < b.id;
    };

    // sort by ID
    sortedPublic.sort(sortById);
    sortedJury.sort(sortById);

    const combinedResult = [];
    for (let i = 0; i < sortedPublic.length; i++) {
      combinedResult.push({
        ...sortedPublic[i],
        combinedScore:
          (sortedPublic[i].intermediateScore ?? 0) +
          // 1.01: we add jury score as-is, and then also make it function as a tie-breaker
          (sortedJury[i].intermediateScore ? sortedJury[i].intermediateScore * 1.01 : 0),
        combinedScoreMakeup: {
          public: sortedPublic[i].intermediateScore ?? 0,
          jury: sortedJury[i].intermediateScore
            ? sortedJury[i].intermediateScore + this.juryPrecedence
            : 0,
        },
      });
    }

    combinedResult.sort((a: any, b: any) => {
      return b.combinedScore - a.combinedScore;
    });

    this.results.combined = combinedResult;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async resetVoting() {
    await http.post("/reset/voting", {}, { headers: { authorization: "jakikaki" } });
    this.reloadContestants();
  }

  async startVoting() {
    await http.post("/start/voting", {}, { headers: { authorization: "jakikaki" } });
  }

  async stopVoting() {
    await http.post("/stop/voting", {}, { headers: { authorization: "jakikaki" } });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async resetContestants() {
    await http.post("/reset/contestants", {}, { headers: { authorization: "jakikaki" } });
    this.reloadContestants();
  }

  // does a stress test on the backend.
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  runLoadTest() {
    console.log("ATTEMPTING TO RUN LOAD TEST! —————————————————————");
    this.loadSimulatorConf.inProgress = true;
    const apiBase = "http://api-vote.amulet.tamius.net";
    const appBase = "http://vote.amulet.tamius.net";
    const baseHeaders = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    };

    const loadPageFn = async () => {
      if (!this.loadSimulatorConf.inProgress) {
        console.info(
          `[loadPageFn] stress test has been stopped. Will not perform vote simulation.`
        );
        return;
      }
      try {
        await Promise.all([
          axios.get(`${appBase}/`),
          axios.get(`http://vote.amulet.tamius.net/css/app.30cb89e9.css`),
          axios.get(`http://vote.amulet.tamius.net/css/chunk-vendors.df627968.css`),
          axios.get(`http://vote.amulet.tamius.net/js/app.b94470cc.js`),
          axios.get(`http://vote.amulet.tamius.net/js/chunk-vendors.e82a8fa1.js`),
          axios.get(`http://vote.amulet.tamius.net/fonts/josefinsans.c83bb729.ttf`),
        ]);
      } catch (e) {
        console.warn("Failed to load voting page:", e);
        return;
      }

      try {
        await axios.get(`${apiBase}/vote-start`, { headers: baseHeaders });
        const { id } = (
          await axios.get(`${apiBase}/voter-id?ts=${+Date.now()}${Math.random()}`, {
            headers: baseHeaders,
          })
        ).data;
        await axios.get(`${apiBase}/vote-config`, { headers: baseHeaders });
        await axios.get(`${apiBase}/my-votes`, {
          headers: { ...baseHeaders, Authorization: id },
        });

        await axios.get(`${apiBase}/contestants`, { headers: baseHeaders });

        try {
          const images = [];
          for (let i = 0; i < 7; i++) {
            images.push(
              axios.get(`${apiBase}/contestants/${i}/image`, { headers: baseHeaders })
            );
          }
          await Promise.all(images);
        } catch (e) {
          console.warn("Failed to load images.");
        }

        const pickedCandidates: number[] = [];
        const votes = [];

        while (pickedCandidates.length < 3) {
          const randomCandidate = Math.floor(Math.random() * 7);
          if (pickedCandidates.includes(randomCandidate)) continue;

          pickedCandidates.push(randomCandidate);
          votes.push({
            candidateId: randomCandidate,
            points: pickedCandidates.length,
          });
        }

        try {
          await axios.post(
            `${apiBase}/vote`,
            { votes: votes },
            { headers: { Authorization: id } }
          );

          // verify votes were cast correctly
          const res = await axios.get(`${apiBase}/my-votes`, {
            headers: { ...baseHeaders, Authorization: id },
          });
          for (const vote of votes) {
            if (!res.data.votes.find((x: any) => x.candidateId === vote.candidateId)) {
              console.error(
                "There was a problem with voting. Our votes:",
                votes,
                "our votes as returned by backend:",
                res.data
              );
              break;
            }
          }
        } catch (e) {
          console.warn("Failed to cast vote!");
        }
      } catch (e) {
        console.warn("failed to initiate vote config.");
        return;
      }
    };

    const createBatch = async (batchSize: number) => {
      if (!this.loadSimulatorConf.inProgress) {
        console.info(
          `[createBatch] stress test has been stopped. Will not perform vote simulation.`
        );
        return;
      }
      console.info("Creating new batch of size", batchSize);
      const promises = [];
      for (let i = 0; i < batchSize; i++) {
        promises.push(loadPageFn());
      }
      await Promise.all(promises);
    };

    const runParallelBatches = async (
      batchSize: number,
      parallelBatches: number,
      totalBatches: number
    ) => {
      let processedBatches = 0;
      while (processedBatches < totalBatches) {
        if (!this.loadSimulatorConf.inProgress) {
          console.info(
            `[loadPageFn] stress test has been stopped. Will not perform vote simulation.`
          );
          return;
        }
        const promises = [];
        for (let i = 0; i < parallelBatches; i++) {
          promises.push(await createBatch(batchSize));
        }
        await Promise.all(promises);
        processedBatches += parallelBatches;
        console.info("Processed", processedBatches, "out of", totalBatches);
      }
    };

    runParallelBatches(
      this.loadSimulatorConf.batchSize,
      this.loadSimulatorConf.concurrentBatches,
      this.loadSimulatorConf.totalBatches
    );
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  stopLoadTest() {
    console.warn("Starting to halt active load tests (if any)");
    this.loadSimulatorConf.inProgress = false;
  }
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/bootstrap/scss/bootstrap";

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
  background: url("../assets/images/admin-bg.webp");
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
  // z-index: 1;

  height: 100%;

  background: url("../assets/images/admin-bg.webp");
  background-size: cover;
  background-position: 55% center;
}

.refresh-line {
  width: 100%;
  height: 0.25rem;

  .refresh-line-bar {
    width: 1px;
    height: 100%;
    background-color: #fa6;

    transition: width 15s linear;
  }
  .reset {
    height: 100%;
    background-color: #fa6;
    width: 99%;
  }
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
  background-color: rgba(0, 0, 0, 0.69);
  backdrop-filter: blur(5px) saturate(0.5);
}

.tie {
  &.segment {
    background-color: rgba(49, 39, 114, 0.69);
  }
  &.master {
    background-color: #fa6;
    color: #000;
  }
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

    box-shadow: 1rem 1rem 2rem rgba(0, 0, 0, 0.69);

    .image-container {
      width: 100%;
      height: 100%;
      margin: 0;
    }

    .contestant-info-row {
      background-color: rgba(0, 0, 0, 0.69);
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
    content: " ";
    // background: url('../assets/images/centaur.webp');
    background-position: center;
    background-size: cover;
  }
  &:after {
    content: "BREZ SLIKE";
    display: block;
    position: absolute;
    white-space: pre;
    top: 50%;
    width: 100%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.69);
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
