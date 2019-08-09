<template>
    <ul v-cloak id="me-emote-autocomplete" class="me-autocomplete" v-show="showMenu" role="listbox">
        <li v-for="emote in filteredEmotes" v-bind:key="emote.id">
            <button class="me-autocomplete-emote me-tooltip" title="MixrElixr Channel Emote">
                <span class="elixr-custom-emote twentyfour me-emotes-preview" style="display: inline-block;">
                    <img src="">
                </span>
                <span class="emote-name">{{emote.name}}</span>
            </button>
        </li>
    </ul>
</template>

<script>
export default {
    data: function() {
        return {
            show: false,
            query: "troll",
            emotes: []
        }
    },
    computed: {
        filteredEmotes: function() {
            return this.emotes.filter(e => e.name.startsWith(this.query))
        },
        showMenu: function() {
            return this.query != null && this.query.length > 0 && this.filteredEmotes.length > 0;
        }
    }
}
</script>


