<template>
  <div id="help-modal" class="modal active" v-show="visible">
    <a href="#" class="modal-overlay" aria-label="Close" @click="close()" />
    <div class="modal-container">
      <div class="modal-header">
        <a href="#" class="btn btn-clear float-right" aria-label="Close" @click="close()" />
        <div class="modal-title h4">
          Help, Tips & Tricks, FAQ
        </div>
      </div>
      <div class="modal-body">
        <div class="content">
          <h5>Basic Usage</h5>
          <p>Paste a list of cards into the input box and hit <i>Submit</i>. Most deck builder export formats should be supported, but if you find something that doesn't work let me know on either of the Twitter or Github links at the top of the desktop site.</p>
          <p>Once your list is loaded, you can adjust set selections using the dropdowns below each card.</p>
          <p>Either click the <i>Print</i> button on the page or use your browser's Print menus to complete the process.</p>

          <h5>Print Formatting</h5>
          <p><b>Paper Size:</b> Use your browser's print dialog to configure options such as the paper size and printer destination. Saving as a PDF is listed as a printer selection in all modern browsers.</p>
          <p><b>Margins:</b> I recommend <b>not</b> adjusting the margins on the page, but wish you the best of luck if you opt to.</p>

          <h5>Known Issues</h5>
          <p><b>Show Promo/Digital:</b> Yeah yeah, I keep finding more stuff that doesn't fit Scryfall's data format, so there might be some promos that are lingering around that aren't properly flagged.</p>
          <p><b>Tokens/Emblems/Etc:</b> Currently there's no focus on supporting these, so they likely won't appear. The token printing versions are a mess (especially with double faced tokens) that I haven't wanted to wade through yet.</p>
          <p><b>Non-English:</b> There is no intended support for non-English cards, but there might be a couple that have slipped through. Scryfall's foreign card imagery is very limited for older cards, but eventually maybe I'll get the appetite to tackle it for the newer stuff.</p>

          <h5>Misc</h5>
          <p>This site is modeled as a substitute for MTGPress since that site has been unusable for a while. As such it's using the cropped down images, so expect thin borders when using it. I personally prefer this, but some people find find it more tedious to cut out.</p>

          <h5>Build Details</h5>
          <ul>
            <li>Repository: <a href="https://github.com/haganbmj/mtg-proxy-site" target="_blank">github.com/haganbmj/mtg-proxy-site</a></li>
            <li>Build SHA: <a :href="'https://github.com/haganbmj/mtg-proxy-site/commit/' + getBuildSha()" target="_blank">{{ getBuildSha() }}</a></li>
            <li>Timestamp: {{ getBuildTimestamp() }}</li>
          </ul>
        </div>
      </div>
      <div class="modal-footer">
        <a href="#" class="btn btn-link" aria-label="Close" @click="close()">Close</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    data() {
        return {
            visible: false,
        }
    },
    emits: [
        'show',
        'close',
    ],
    methods: {
        show() {
            this.visible = true;
            this.$emit('show');
        },
        close() {
            this.visible = false;
            this.$emit('close');
        },
        getBuildTimestamp() {
            return import.meta.env.VITE_BUILD_TIMESTAMP;
        },
        getBuildSha() {
            return import.meta.env.VITE_BUILD_SHA || 'local';
        },
    },
}
</script>
