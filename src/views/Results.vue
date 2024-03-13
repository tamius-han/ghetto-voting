<template>
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

      <div class="">
        <h1
          class="text-center"
          style="
            font-size: 5rem;
            font-weight: 250;
            text-shadow: 0 0.02em 0.25rem black, 0 0.02em 0.25rem black,
              0 0.02em 0.25rem black;
          "
        >
          REZULTATI GLASOVANJA
        </h1>

        <div class="d-flex flex-row top3-row">
          <template v-for="(contestant, index) of results.combined" :key="index">
            <template v-if="index < 3">
              <div class="top3">
                <div class="image-container position-relative">
                  <img
                    class="contestant-image"
                    :src="
                      imageBaseUrl +
                      contestant.id +
                      '/image?gci=' +
                      contestant.imageUpdate
                    "
                    loading="lazy"
                    alt="&nbsp;"
                  />
                </div>
                <div
                  class="contestant-info-row d-flex flex-row position-absolute bottom-0 left-0 w-100"
                >
                  <div class="flex-grow-1 flex-shrink-1 d-flex flex-column">
                    <div class="title">{{ contestant.title }}</div>
                    <div class="name">{{ contestant.name }}</div>
                    <div class="score">
                      sum: {{ contestant.combinedScore }}; glasov: {{ contestant.votes }};
                      žirija: {{ contestant.juryVotes }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
      <div class="text-center">
        <div class="panel">
          <h2>Skupni seštevki v celoti</h2>
          <p>
            Če so rezulati obarvani <span class="tie master">oranžno</span>, potem so
            tekmovalci v skupnem seštevku izenačeni po točkah.
          </p>
          <p>
            Če so rezulati obarvani <span class="tie segment">modro</span>, potem so
            tekmovalci izenačeni v podkategorijah. To ni problem — je pa treba vedeti, da
            izenačeni kandidati dobijo enako točk iz uvrstitve.
          </p>
        </div>
      </div>

      <div class="d-flex flex-row result-panels" style="width: 100%">
        <!-- Combined votes panel -->
        <div class="panel">
          <h3>Skupni seštevek</h3>

          <div v-if="results.combined">
            <div
              v-for="(contestant, index) of results.combined"
              :key="contestant.id"
              :class="{
                'tie master':
                  (results?.combined[index - 1] &&
                    results.combined[index - 1].combinedScore ===
                      contestant.combinedScore) ||
                  (results?.combined[index + 1] &&
                    results.combined[index + 1].combinedScore ===
                      contestant.combinedScore),
              }"
            >
              {{}}
              <b>{{ index + 1 }}.: {{ contestant.title }}</b> by
              <i>{{ contestant.name }}</i
              ><br />
              <small>
                Točk: {{ contestant.combinedScore }}
                <i
                  ><sub
                    >(ljudstvo: {{ contestant.combinedScoreMakeup.public }}, žirija:
                    {{ contestant.combinedScoreMakeup.jury }}, Chuck:
                    {{ contestant.combinedScoreMakeup.chuck }})</sub
                  ></i
                ><br />
                <i
                  ><sub
                    >glasov: {{ contestant.votes }}; ocena žirije:
                    {{ contestant.juryVotes }}</sub
                  ></i
                >
              </small>
            </div>
          </div>
        </div>

        <!-- Public votes panel -->
        <div class="panel">
          <h3>Glas publike</h3>

          <div v-if="results.public">
            <div
              v-for="(contestant, index) of results.public"
              :key="contestant.id"
              :class="{
                'tie segment':
                  (results?.public[index - 1] &&
                    results.public[index - 1].votes === contestant.votes) ||
                  (results?.public[index + 1] &&
                    results.public[index + 1].votes === contestant.votes),
              }"
            >
              <b>{{ index + 1 }}.: {{ contestant.title }}</b> by
              <i>{{ contestant.name }}</i
              ><br />
              <small
                >Z uvrstitvijo na to mesto je tekmovalec dosegel
                <b>{{ contestant.intermediateScore }}</b> točk.</small
              ><br />
              <small
                >Glasov: {{ contestant.votes }}
                <i
                  ><sub> ocena žirije: {{ contestant.juryVotes }}</sub></i
                ></small
              >
            </div>
          </div>
        </div>

        <!-- Jury votes panel -->
        <div class="panel">
          <h3>Glas žirije</h3>

          <div v-if="results.jury">
            <div
              v-for="(contestant, index) of results.jury"
              :key="contestant.id"
              :class="{
                'tie segment':
                  (results?.jury[index - 1] &&
                    results.jury[index - 1].juryVotes === contestant.juryVotes) ||
                  (results?.jury[index + 1] &&
                    results.jury[index + 1].juryVotes === contestant.juryVotes),
              }"
            >
              <b>{{ index + 1 }}.: {{ contestant.title }}</b> by
              <i>{{ contestant.name }}</i
              ><br />
              <small
                >Z uvrstitvijo na to mesto je tekmovalec dosegel
                <b>{{ contestant.intermediateScore }}</b> točk.</small
              ><br />
              <small
                >Ocena žirije: {{ contestant.juryVotes }}
                <i
                  ><sub>Publika: {{ contestant.votes }}</sub></i
                ></small
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import VoteStatusFlags from "../../common/enums/vote-status-flags.enum";
import http from "@/http-common";
import axios from "axios";

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

  intermediateScoresArray = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
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
