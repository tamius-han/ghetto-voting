<template>
  <div class="page-bg"></div>
  <div class="page h-100" style="margin-bottom: 6.9rem">
    <div class="container relative">
    <h1>Prijave na tekmovanje</h1>
      <div>
        <h3>Trenutne prijave:</h3>
        <p>(prijavnica za nove je na dnu strani. cykaj se dol, blyat)</p>
      </div>
      <div v-if="contestants.length">
        <div v-for="contestant, index of contestants" :key="contestant" class="d-flex flex-row contestant-row">
          <div v-if="!forceImageReload" class="image-container position-relative">
            <img class="contestant-image-placeholder" :src="imageBaseUrl + contestant.id + '/image'" loading="lazy" alt="&nbsp;"/>
          </div>
          <div>
          <div class="contestant-name-display">
            {{index + 1}} <b>{{contestant.title}}</b> - {{contestant.name}}
          </div>
          <div class="d-flex flex-row align-items-center">
            <div class="button" @click="editContestant(index)">Uredi</div>
            <div class="image-upload-line"> Slika:             <input type="file" accept="image/*" @change="uploadImage(contestant.id, $event?.target?.files)" /> </div>
            <div class="button red" @click="startDelete(index)">Pucaj iz seznama</div>
          </div>
          <div v-if="editingIndex === index">
            <div class="field my-2">
              <div>Ime kostuma:</div>
              <div class="w-100">
                <input v-model="newContestant.title" />
              </div>
            </div>
            <div class="field my-2">
              <div>Nastopajoči:</div>
              <div class="w-100">
                <input v-model="newContestant.name" @keypress.enter="(editingIndex === undefined) ? addNewContestant() : updateContestant()"/>
              </div>
            </div>
            <div class="d-flex flex-row">
              <div class="button" @click="updateContestant()">Potrdi spremembe</div>
              <div class="button" @click="cancelAddEdit()">
                Prekliči
              </div>
            </div>

            <div v-if="validationError" class="error">Nepopolna prijava, pls fix</div>
            <div v-if="registerContestantError" class="error">uwu upsi vupsi, jebek bebek. Nekej je šlo narobe. A strežnik lavfa?</div>
          </div>
          <div v-if="deletingIndex === index">
            <b>A si čist čist zih da hočeš brisat?</b>
            <div class="flex flex-row">
              <div class="button red" @click="deleteContestant(index)">Da, res</div>
              <div class="button red" @click="startDelete()">Ne, naredu sm upsi</div>
            </div>
          </div>
        </div>
        </div>
      </div>
      <div v-else>
        Trenutno ni prijav. Bodi sprememba, ki si jo želiš in se prijavi.
      </div>

      <div class="mt-4">
        <h3 v-if="(editingIndex === undefined)">Nova prijava</h3>
        <h3 v-else>Uredi tekmovalca</h3>
        <div v-if="!submitting">
          <div class="field my-2">
            <div>Ime kostuma:</div>
            <div class="w-100">
              <input v-model="newContestant.title" />
            </div>
          </div>
          <div class="field my-2">
            <div>Nastopajoči:</div>
            <div class="w-100">
              <input v-model="newContestant.name" @keypress.enter="(editingIndex === undefined) ? addNewContestant() : updateContestant()"/>
            </div>
          </div>
          <div class="d-flex flex-row">
          <div v-if="(editingIndex === undefined)" class="button" @click="addNewContestant()">
            Dodaj
          </div>
          <div v-else class="button" @click="updateContestant()"></div>

          <div class="button" @click="cancelAddEdit()">
            Prekliči
          </div>
        </div>

          <div v-if="validationError" class="error">Nepopolna prijava, pls fix</div>
          <div v-if="registerContestantError" class="error">uwu upsi vupsi, jebek bebek. Nekej je šlo narobe. A strežnik lavfa?</div>
        </div>
        <div v-else>
          Dodajanje novega tekmovalca.
        </div>
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


  editingIndex: number | undefined = undefined;
  deletingIndex: number | undefined = undefined;

  validationError = false;
  registerContestantError = false;
  submitting = false;
  forceImageReload = false;

  imageBaseUrl?: string;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  created() {
    this.imageBaseUrl = `${http.defaults.baseURL}contestants/`;
    this.getContestants();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async getContestants() {
    const res = await http.get('/contestants');
    console.log('contestants res:', res);


    this.contestants = [];
    for (const c in res.data) {
      this.contestants.push(res.data[c]);
    }

  }

  async addNewContestant(): Promise<any> {
    this.validationError = !this.newContestant.name.length || !this.newContestant.title.length;
    if (this.validationError) {
      return;
    }

    this.registerContestantError = false;
    try {
      this.submitting = true;
      await http.post(
        '/contestants/register',
        this.newContestant
      )

      this.cancelAddEdit();
    } catch (e) {
      this.submitting = false;
      this.registerContestantError = true;
      console.log('oopsie whoopsie, fucky wucky. Is server running?')
    }

    this.getContestants();
  }

  cancelAddEdit() {
    this.editingIndex = undefined;
    this.submitting = false;
    this.newContestant.name = '';
    this.newContestant.title = '';
    this.$forceUpdate();
  }

  editContestant(index: number) {
    this.editingIndex = index;
    this.newContestant.name = this.contestants[index].name;
    this.newContestant.title = this.contestants[index].title;
  }

  async updateContestant(): Promise<any> {
    if (this.editingIndex === undefined) {
      return;
    }

    this.validationError = !this.newContestant.name.length || !this.newContestant.title.length;
    if (this.validationError) {
      return;
    }

    this.registerContestantError = false;

    try {
      this.submitting = true;

      await http.post(
        `/contestants/${this.contestants[this.editingIndex]}`,
        {
          ...this.contestants[this.editingIndex],
          ...this.newContestant
        }
      )

      this.cancelAddEdit();
    } catch (e) {
      this.submitting = false;
      this.registerContestantError = true;
      console.log('oopsie whoopsie, fucky wucky. Is server running?')
    }

    this.getContestants();
  }

  async uploadImage(contestantId: number, files?: any) {
    if (!files) {
      return;
    }
    console.log('trying to upload image:', files);

    const formData = new FormData();
    formData.append("file", files[0]);

    console.log('form data:', formData);

    await http.post(
      `/contestants/${contestantId}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    // reload image ... needs 500ms timeout cos reasons I guess
    setTimeout(() => {
      this.$nextTick(() => {
        this.forceImageReload = true;

        this.$nextTick(()=> {
          this.forceImageReload = false;
        });
      })
    }, 500);
  }

  startDelete(ci: number) {
    this.deletingIndex = ci;
    this.$forceUpdate();
  }

  async deleteContestant(contestantId: number) {
    try {
      await http.delete(
        `/contestants/${contestantId}`
      );
    } catch (e) {
      console.log('oopsie whoopsie');
    }
    this.deletingIndex = undefined;
    this.cancelAddEdit();
  }
}
</script>

<style lang="scss" scoped>
@import '../../node_modules/bootstrap/scss/bootstrap';

.page-bg {
  top: 0;
  left: 0;
  position: fixed;
  // z-index: -1;
  height: 100vh;
  width: 100vw;
  background: url('../assets/images/prijava-bg.webp');
  background-size: cover;
  background-position: center;
}

.container {
  position: relative;
  z-index: 1;

  background-color: rgba(0,0,0,0.69);
  backdrop-filter: blur(5px) saturate(0.5);
}

.ml-4 {
  margin-left: 2rem;
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
