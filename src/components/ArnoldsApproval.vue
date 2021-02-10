<template>
    <div class="columns col-9 col-sm-12 col-mx-auto">
        <template v-if="approval">
            <span class="h6 p-centered"><i>Your list doesn't contain Griselbrand! Good job.</i></span>
            <blockquote>
                <p>Life may be full of pain, but that’s not an excuse to give up.</p>
                <cite>- Arnold Schwarzenegger</cite>
            </blockquote>
        </template>
        <template v-else-if="approval === false">
            <i class="h6 p-centered">Your list contains Griselbrand. How disappointing.</i>
            <blockquote>
                <p>"What is the point of being on this Earth if you are going to be like everyone else?"</p>
                <cite>- Arnold Schwarzenegger (on Griselbrand)</cite>
            </blockquote>
        </template>
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
        approval() {
            if (this.cards.length === 0) {
                return undefined;
            }

            const griselbrand = this.cards.find(card => {
                return card.name === 'griselbrand';
            });

            return griselbrand ? false : true;
        },
    },
}
</script>
