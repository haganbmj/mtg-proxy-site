<template>
    <div class="columns col-9 col-sm-12 col-mx-auto" v-if="approvalContent !== undefined">
        <span class="h6 p-centered"><i>{{ approvalContent.header }}</i></span>
        <blockquote>
            <p>{{ approvalContent.quote }}</p>
            <cite>- {{ approvalContent.attribution }}</cite>
        </blockquote>
    </div>
</template>

<script>
export default {
    props: {
        cards: {
            type: Array,
            required: true,
        },
    },
    computed: {
        approvalContent() {
            if (this.cards.length === 0) {
                return undefined;
            }

            if (this.cards.find(card => card.name === 'griselbrand')) {
                return {
                    header: `Your list contains Griselbrand. How disappointing.`,
                    quote: `"What is the point of being on this Earth if you are going to be like everyone else?"`,
                    attribution: `Arnold Schwarzenegger (on Griselbrand)`,
                };
            } else {
                return {
                    header: `Your list doesn't contain Griselbrand! Good job.`,
                    quote: `"Life may be full of pain, but that’s not an excuse to give up."`,
                    attribution: `Arnold Schwarzenegger`,
                };
            }
        },
    },
}
</script>
