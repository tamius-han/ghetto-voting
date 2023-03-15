<template>
  <div
    class="activator-button d-flex flex-col flex-column"
    style="padding: 0.25rem"
    @click="isOpen = true"
  >
    <div>
      <small>Ocenjevalec</small>
    </div>
    <div><h2 style="color: #fff; font-weight: 200">{{ jurior }}</h2></div>
    <div style="color: #fa6">{{ rating || "Ni ocene" }}</div>
  </div>
  <div v-if="isOpen" class="popup-bg">
    <div class="popup-window">
      <div class="window-title-bar d-flex flex-row">
        <div class="flex-grow-1 flex-shrink-1">
          {{ jurior }} — stisni oceno
        </div>
        <div class="flex-grow-0 flex-shrink-0" @click="isOpen = false">Prekliči</div>
      </div>
      <div class="window-content">
        <h1>Stisni oceno</h1>
        <div class="d-flex flex-row button-row">
          <div
            v-for="n in 10"
            :key="n"
            class="rate-button"
            :class="{'selected': n === +rating}"
            @click="rate(n)"
          >
            {{n}}
          </div>
        </div>

        <div class="d-flex flex-row button-row">
          <div
            v-for="n in 9"
            :key="n"
            class="rate-button"
            :class="{'selected': (n + 0.5) === +rating}"
            @click="rate(n + 0.5)"
          >
            {{n + 0.5}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Options, Vue } from 'vue-class-component';

@Options({
  props: [
    'jurior',
    'rating'
  ],
  emits: [
    'onRated'
  ]
})
export default class JuryVotePopup extends Vue {
  isOpen = false;


  rate(rating) {
    this.isOpen = false;
    this.$emit('onRated', rating);
  }
}
</script>
<style lang="scss" scoped>

.popup-bg {
  display: block;
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(16px);

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

  &.selected {
    background-color: #fa6;
    color: #000
  }
}

.activator-button {
  background-color: rgba(0,0,0,0.5);
  width: 12rem;
  height: 16rem;
  text-align: center;
  justify-items: center;
  align-items: center;
  justify-content: center;
}
</style>
