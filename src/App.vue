<template>
  <div id="nav" class="d-flex flex-row w-100">
    <div class="flex-grow-1">
      Glasovanje:<br/>
      <b>IME GLASOVANJA TLE</b>
    </div>
    <div @click="menuVisible = true">
      meni in tebi

      <div v-if="menuVisible" id="menu">
        <div class="d-flex flex-row w-full">
        <div class="flex-grow-1"><h1>{{ $t('title')}}</h1></div>
          <button @click.stop="menuVisible = false">{{ $t('buttons.close')}}</button>
        </div>


        <h3>{{ $t('navigation.segmentTitles.openVotings') }}</h3>

        <h3>{{ $t('navigation.segmentTitles.crossroads')}}</h3>
        <div class="d-flex flex-column">
          <router-link to="/" @click.stop="menuVisible = false">
            {{ $t('navigation.home') }}
          </router-link>
          <router-link to="/history" @click.stop="menuVisible = false">
            {{ $t('navigation.history') }}
          </router-link>

          <router-link to="/admin" @click.stop="menuVisible = false">
            {{ $t('navigation.admin') }}
          </router-link>
          <router-link to="/jury" @click.stop="menuVisible = false">
            {{ $t('navigation.jury') }}
          </router-link>
          <router-link to="/prijava" @click.stop="menuVisible = false" >
            {{ $t('navigation.register') }}
          </router-link>
        </div>

        <h3>{{ $t('navigation.segmentTitles.extras')}}</h3>
        <button>{{ $t('navigation.about') }}</button>
        <button>{{ $t('navigation.privacy')}}</button>

        <h4>Pa mogoče pridte v četrtkih kej v medvode.</h4>
        <p></p>
        <button></button>
      </div>
    </div>
  </div>
  <div class="flex-grow-1 d-flex flex-column">
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({})
export default class App extends Vue {
  menuVisible = false;
}
</script>

<style lang="scss">
@import './../node_modules/bootstrap/scss/bootstrap';

// fonts
@font-face {
  font-family: 'Josefin Sans';
  src: url('./assets/fonts/josefinsans.ttf');
}
@font-face {
  font-family: 'Josefin Sans';
  font-style: italic;
  src: url('./assets/fonts/josefinsans-italic.ttf');
}
// all else

body {
  color: #000;
  min-height: 100vh;
}

body, #app {
  min-height: 100vh;
  background-color: #000;
  color: #ccc;

  b {
    color: #fff;
  }
}

#app {
  font-family: 'Josefin Sans', Helvetica, Arial, sans-serif;
  // -webkit-font-smoothing: antialiased;
  // -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  // color: #2c3e50;

  display: flex;
  flex-direction: column;
  height: 100%;
}

#nav {
  padding: 1rem;
  background-color: #000;

  display: flex;
  flex-direction: row;

  a {
    color: #fa6;
    text-decoration: none;
    display: block;
    margin: 1rem;

    &:not(:first-child) {
      margin-top: 0;
    }
    border: 1px solid #fa6;
    padding: 1rem;

    &:hover {
      color: rgb(250, 192, 144);
    }

    &.router-link-active {
      color: #000;
      border: 1px solid transparent !important;
      background: rgb(255,170,102);
      background: linear-gradient(120deg, rgba(255,170,102,1) 0%, rgba(228,137,64,1) 52%, rgba(170,92,30,1) 100%);
    }
  }
}

.root {
  height: 100%;
}



#menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  padding: 1rem;
  backdrop-filter: blur(1rem) brightness(50%) saturate(50%);
  background-color: transparent;
}
</style>
