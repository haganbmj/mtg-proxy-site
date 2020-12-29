<template>
  <header class="navbar bg-gray">
      <section class="navbar-section">
          <!-- <a href="/"><img class="navbar-icon" src="../android-chrome-192x192.png"></a> -->
          <a href="/" class="btn btn-link">MTG Proxy Print</a>
      </section>
      <!-- <section class="navbar-center"></section> -->
      <section class="navbar-section hide-sm">
          <a href="https://twitter.com/haganbmj" target="_blank" class="btn ml-1">Twitter</a>
          <a href="https://github.com/haganbmj/mtg-proxy-site" target="_blank" class="btn btn-primary ml-1">GitHub</a>
      </section>
  </header>
  <div id="content" class="container">
    <ProxyPage/>
  </div>
</template>

<script>
import ProxyPage from './views/ProxyPage.vue'

export default {
  name: 'App',
  components: {
    ProxyPage
  }
}
</script>

<style>
.navbar {
    padding: .4rem;
}

.navbar-icon {
    height: 36px;
    width: auto;
}

#content {
  margin: 0 auto;
  margin-top: 0.4rem;
  max-width: 1200px;
}

</style>
