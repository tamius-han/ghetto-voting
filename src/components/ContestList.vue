<template>
  <div class="list-container">
    <div
      v-for="contest of contestList"
      class="contest-card"
      :key="contest.id"
      @click="$emit('contestSelected', contest)"
    >
      <div class="flex flex-row">
        <div class="flex flex-col">
          <div class="contest-header">
            <div class="contest-title">
              <h3>{{ contest.name }}</h3>
            </div>
          </div>
          <div class="contest-description">
            {{ contest.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Options, Vue } from 'vue-class-component';

@Options({
  components: {
  },
  props: [
    'contestList'
  ],
  emits: [
    'contestSelected'
  ]
})
export default class ContestListComponent extends Vue {

}
</script>

<style lang="scss" scoped>
.list-container {
  padding: 1rem;
}
.contest-card {
  &:not(:first-child) {
    margin-top: 1rem;
  }
  &:not(:last-child) {
    margin-bottom: 1rem;
  }

  padding: 1rem;

  border: 1px solid #fa6;
  background: rgb(5,1,29);
background: linear-gradient(0deg, rgba(5,1,29,1) 0%, rgba(3,3,48,1) 62%, rgba(17,13,73,1) 100%);
}

</style>
