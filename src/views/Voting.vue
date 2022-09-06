<template>
  <div>
    <div class="header">Žirija n stuff</div>
    <div class="scroll-header d-flex flex-row">
      <div>
        Podeljenih glasov:<br/>
        <b></b>
      </div>

    </div>

    <div class="vote-container">
      <div v-if="!contestants">Nalaganje ...</div>
      <div v-else-if="contestants && contestants.length === 0">
        Malo prezgodej za glasovanje, eh?
      </div>
      <template v-else>
        <div
          v-for="contestant of contestants"
          :key="contestant.id"
          class="contestant-option"
        >
          <div class="contestant-info-row d-flex flex-row">
            <div class="flex-grow-1 flex-shrink-1 d-flex flex-column">
              <div class="title">{{contestant.title}}</div>
              <div class="name">{{contestant.name}}</div>
            </div>
            <div class="flex-grow-0 flex-shrink-0">

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

@Options({
  components: {
    HelloWorld,
  },
})
export default class Home extends Vue {
  contestants: any[];
}
</script>
