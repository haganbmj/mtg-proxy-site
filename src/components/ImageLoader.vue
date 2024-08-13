<template>
  <div class="card-loading loading loading-lg" :class="{ 'hidden': loaded }" />
  <img v-bind="$attrs" :src="internalSrc">
  <img v-if="!loaded" :src="src" @load="onLoaded" class="hidden">
</template>

<script>
export default {
    name: 'ImageLoader',
    props: {
        src: {
            type: String,
            required: true,
        },
        placeholder: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            loaded: false,
        }
    },
    computed: {
        internalSrc() {
            return this.loaded ? this.src : this.placeholder;
        },
    },
    watch: {
        src: function() {
            this.loaded = false;
        },
    },
    methods: {
        onLoaded() {
            this.loaded = true;
        },
    },
}
</script>

<style scoped>
.card-loading.loading {
    position: absolute;
    width: 100%;
    top: 30%;
    margin: 0 auto;
}

img {
    position: relative;
    top: 0;
}

.hidden {
    display: none;
}
</style>
