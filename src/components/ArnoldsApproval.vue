<template>
  <div class="columns col-9 col-sm-12 col-mx-auto" v-if="approvalContent !== undefined">
    <div class="h6 p-centered">
      <i>{{ approvalContent.header }}</i>
    </div>
    <blockquote class="col-12">
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

            const totalQuantities = this.cards.reduce((acc, cv) => {
                acc[cv.name] = (acc[cv.name] || 0) + cv.quantity;
                return acc;
            }, {});

            if (this.cards.length > 500) {
                return {
                    header: `Damn. That's a lot of cards.`,
                    quote: `"It's Turbo Man. My son wants one too."`,
                    attribution: `Howard Langston (Jingle All The Way)`,
                };
            } else if (this.cards.find(card => card.name === 'griselbrand')) {
                return {
                    header: `Your list contains Griselbrand. How disappointing.`,
                    quote: `"What is the point of being on this Earth if you are going to be like everyone else?"`,
                    attribution: `Douglas Quaid (Total Recall)`,
                };
            } else if (totalQuantities['strip mine'] !== undefined && totalQuantities['strip mine'] < 4) {
                return {
                    header: `Fewer than 4 Strip Mines? What madness is this?`,
                    quote: `"What is best in life? To crush your enemies, see them driven before you, and to hear the lamentation of their women!"`,
                    attribution: `Conan (Conan the Barbarian)`,
                }
            } else if (this.cards.find(card => card.name.includes('spine'))) {
                return {
                    header: `SPINE!!!`,
                    quote: `"I hope you leave enough room for my fist because I'm going to ram it into your stomach and break your goddamn spine!"`,
                    attribution: `Ben Richards (The Running Man)`,
                }
            } else if (this.cards.find(card => ['sld', 'slp', 'slc', 'slu'].includes(card.selectedOption.setCode))) {
                return {
                    header: `Secret Lairs?! Really?`,
                    quote: `"I gotta tell you, Santa, there's something about this place that doesn't seem quite... Kosher."`,
                    attribution: `Howard Langston (Jingle All The Way)`,
                }
            } else if (this.cards.find(card => ['ugl', 'unh', 'punh', 'ust', 'und', 'unf'].includes(card.selectedOption.setCode))) {
                return {
                    header: `I'm starting to UN-derstand what's going on here.`,
                    quote: `"You're a funny guy, Sully, I like you. That's why I'm going to kill you last."`,
                    attribution: `John Matrix (Commando)`,
                }
            } else if (this.cards.find(card => [
                'kird ape', 'loam lion', 'wild nacatl',
                'savannah lions', 'isamaru, hound of konda',
                'watchwolf', 'tarmogoyf', 'knight of the reliquary',
                'tribal flames', 'steppe lynx', 'figure of destiny',
            ].includes(card.name))) {
                return {
                    header: `I sure hope you're playing Zoo.`,
                    quote: `"Not many people understand what a pump is. It must be experienced to be understood. It is the greatest feeling that I get. I search for this pump because it means that my muscles will grow when I get it. I get a pump when the blood is running into my muscles. They become really tight with blood."`,
                    attribution: `John Matrix (Commando)`,
                }
            } else {
                return {
                    header: `Your list doesn't contain Griselbrand! Good job.`,
                    quote: `"Life may be full of pain, but that's not an excuse to give up."`,
                    attribution: `Arnold Schwarzenegger`,
                };
            }
        },
    },
}
</script>
