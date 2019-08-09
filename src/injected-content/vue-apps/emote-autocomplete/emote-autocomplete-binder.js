import Vue from "vue";
import $ from "jquery";
import AutocompleteApp from "./emote-autocomplete";

let app = null;
export function bindEmoteAutocompleteApp(globalEmotesCache, channelEmotesCache) {

    let globalEmotes = [];
    if (globalEmotesCache && globalEmotesCache.emotes) {
        globalEmotes = Object.values(globalEmotesCache.emotes);
        globalEmotes.forEach(e => e.global = true);
    }

    let channelEmotes = [];
    if (channelEmotesCache && channelEmotesCache.emotes) {
        channelEmotes = Object.values(channelEmotesCache.emotes);
        channelEmotes.forEach(e => e.global = false);
    }

    $("[class*='webComposerBlock']").prepend('<ul id="me-autocomplete-binder" role="listbox"></ul>');

    app = new Vue({
        el: '#me-autocomplete-binder',
        render: h => h(AutocompleteApp)
    });

    console.log("RENDERED VUE APP");
    console.log(app);

    let child = app.$children[0] || {};

    child.emotes = globalEmotes.concat(channelEmotes);
    console.log("EMOTES IN APP", child.emotes);
    console.log("QUERY IN APP", child.query);

    $("#chat-input").children("textarea").off("keyup", keyupListener);

    $("#chat-input").children("textarea").on("keyup", keyupListener);

}

function keyupListener() {
    let query = "";

    let allText = $("#chat-input").children("textarea").val();
    if (allText && allText.trim().length > 0 && !allText.endsWith(" ")) {
        let words = allText.split(" ");
        if (words.length > 0) {
            let lastWord = words[words.length - 1];
            if (lastWord != null && lastWord.trim().length > 0) {
                query = lastWord;
            }
        }
    }

    let child = app.$children[0] || {};
    child.query = query;
    console.log("set query to: " + query);
}