<template>
  <header class="navbar bg-gray">
    <section class="navbar-section">
      <a href="https://griselbrand.com">
        <img class="navbar-icon" alt="Site Icon" src="https://griselbrand.com/android-chrome-192x192.png">
      </a>
      <a href="https://griselbrand.com" class="btn btn-link">Griselbrand</a>
    </section>

    <section class="navbar-section">
      <a title="Change Theme" class="btn btn-action btn-primary s-circle" @click="changeTheme()"><span class="icon-brightness-contrast" /></a>
      <LocalePicker class="ml-1" />
      <span class="px-2 hide-sm" />
      <a href="https://twitter.com/haganbmj" target="_blank" class="btn ml-1 hide-sm">Twitter</a>
      <a href="https://github.com/haganbmj/mtg-proxy-site" target="_blank" class="btn btn-primary ml-1 hide-sm">GitHub</a>
    </section>
  </header>
  <div id="content" class="container">
    <ProxyPage />
  </div>
</template>

<script>
import LocalePicker from './components/LocalePicker.vue';
import ProxyPage from './views/ProxyPage.vue'

export default {
  name: 'App',
  components: {
    LocalePicker,
    ProxyPage,
  },
  data() {
    return {
        darkTheme: false,
    }
  },
  watch: {
    darkTheme(newValue) {
        localStorage.darkTheme = this.darkTheme;
    },
  },
  mounted() {
    // Detect theme on first visit, then persist it for subsequent use.
    if (localStorage.darkTheme === undefined) {
        const browserPreference = window.matchMedia("(prefers-color-scheme: dark)");
        if (browserPreference.matches) {
            this.darkTheme = true;
        }
    } else {
        this.darkTheme = localStorage.darkTheme === 'true';
    }
    this.updateTheme();
  },
  methods: {
    changeTheme() {
        this.darkTheme = !this.darkTheme;
        this.updateTheme();
    },
    updateTheme() {
        const elem = document.querySelector('html');
        if (!this.darkTheme && elem.classList.contains('dark-theme')) {
            elem.classList.remove('dark-theme');
        } else {
            elem.classList.add('dark-theme');
        }
    },
  },
}
</script>

<style lang="scss">
.navbar {
    padding: .4rem;
}

.navbar-icon {
    height: 36px;
    width: auto;
}

#content {
  margin: 0 auto;
  margin-top: 0.8rem;
  margin-bottom: 4rem;
  max-width: 1200px;
}

</style>
