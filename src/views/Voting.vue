<template>
  <div class="h-100">
    <div class="header">Žirija n stuff</div>
    <div class="scroll-header d-flex flex-row">
      <div>
        Podeljenih glasov:<br/>
        <b></b>
      </div>

    </div>

    <div class="vote-container d-flex flex-column flex-md-row flex-md-wrap justify-content-center align-items-center">
      <div v-if="!contestants">Nalaganje ...</div>
      <div v-else-if="contestants && contestants.length === 0">
        Malo prezgodej za glasovanje, eh?
      </div>
      <template v-else>
        <div
          v-for="contestant of contestants"
          :key="contestant.id"
          class="contestant-option position-relative mb-2 mt-2 mx-md-2"
        >
          <div class="image-container position-relative">
            <img v-if="contestant.image" :src="imageBaseUrl + contestant.image" />
            <template v-else>
              <img src="../assets/images/centaur.webp">
              <div class="position-absolute d-flex justify-content-center align-items-center h-100 w-100 top-0 left-0">
                <div class="no-image-overlay text-center">
                  <b>Ni slike</b><br/>
                  Verjetno zato, ker se kostum še ni prikazal na oder.<br/>
                  <small>Ali pa kentaver Rajko demonstrira.</small>
                </div>
              </div>
          </template>
          </div>

          <!-- bar with contestant info -->
          <div class="contestant-info-row d-flex flex-row position-absolute bottom-0 left-0 w-100">
            <div class="flex-grow-1 flex-shrink-1 d-flex flex-column">
              <div class="title">{{contestant.title}}</div>
              <div class="name">{{contestant.name}}</div>
            </div>
            <div class="flex-grow-0 flex-shrink-0">
              GLASUJ
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

@Options({
  components: {
    HelloWorld,
  },
})
export default class VotingComponent extends Vue {
  contestants: any[] = [];
  imageBaseUrl?: string;

  async created() {
    await this.getId();
    this.imageBaseUrl = `${http.defaults.baseURL}contestant/image/`;
    await this.listContestants();
  }

  private async getId() {
    const localStorageId = localStorage.getItem('clientId');
    if (localStorageId) {
      http.defaults.headers.common['Authorization'] = localStorageId;
      return localStorageId;
    }

    const res = await http.get(`/voter-id`);
    http.defaults.headers.common['Authorization'] = res.data.id;
    localStorage.setItem('clientId', res.data.id);
    return res.data.id;
  }

  private async listContestants() {
    const res = await http.get('/contestants');

    this.contestants = [];
    for (const c in res.data) {
      this.contestants.push(res.data[c]);
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

.no-image-overlay, .contestant-info-row {
  background-color: rgba(0,0,0,0.60);
  backdrop-filter: blur(0.25rem);
}

.no-image-overlay {
  padding: 2rem;
}

.contestant-info-row {
  padding: 0.5rem 1rem;

  .title {
    color: #fff;
    font-weight: 300;
    font-size: 1.5rem;
  }
}
</style>
