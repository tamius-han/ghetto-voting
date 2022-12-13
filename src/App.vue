<template>
  <!-- <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </div> -->
  <router-view/>
</template>

<style lang="scss">
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
}

#nav {
  padding: 30px;
  background-color: #000;

  a {
    font-weight: bold;
    // color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
