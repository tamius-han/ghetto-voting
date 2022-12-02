<template>
  <div class="page">
    <div class="container">
    <h1>Prijave na tekmovanje</h1>
      <div>
        <b>Trenutne prijave:</b>
      </div>
      <div v-if="contestants.length">
        <div v-for="contestant, index of contestants" :key="contestant">
          <div>
            {{index + 1}} <b>{{contestant.title}}</b> - {{contestant.name}}
          </div>
        </div>
      </div>
      <div v-else>
        Trenutno ni prijav. Bodi sprememba, ki si jo želiš in se prijavi.
      </div>

      <div class="mt-4">
        <b>Nova prijava</b>
        <div class="field my-2">
          <div>Ime kostuma:</div>
          <div class="w-100">
            <input v-model="newContestant.title" />
          </div>
        </div>
        <div class="field my-2">
          <div>Nastopajoči:</div>
          <div class="w-100">
            <input v-model="newContestant.name" @keypress.enter="addNewContestant()"/>
          </div>
        </div>
        <div v-if="registerContestantError" class="error">uwu upsi vupsi, jebek bebek. Nekej je šlo narobe. A strežnik lavfa?</div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import http from '@/http-common';


@Options({
  components: {
  },
})
export default class RegisterComponent extends Vue {
  contestants: any[] = [];
  newContestant = {
    name: '',
    title: '',
  };
  registerContestantError = false;

  async addNewContestant() {
    this.registerContestantError = false;
    try {
      await http.post(
        '/register-contestant',
        this.newContestant
      )
    } catch (e) {
      this.registerContestantError = true;
      console.log('oopsie whoopsie, fucky wucky. Is server running?')
    }
  }
}
</script>
