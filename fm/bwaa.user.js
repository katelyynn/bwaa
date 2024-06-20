// ==UserScript==
// @name         bwaa
// @namespace    http://last.fm/
// @version      2024.0620
// @description  bwaaaaaaa
// @author       kate
// @match        https://www.last.fm/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=last.fm
// @updateURL    https://github.com/katelyynn/bleh/raw/uwu/fm/bleh.user.js
// @downloadURL  https://github.com/katelyynn/bleh/raw/uwu/fm/bleh.user.js
// @run-at       document-body
// @require      https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js
// @require      https://unpkg.com/@popperjs/core@2
// @require      https://unpkg.com/tippy.js@6
// ==/UserScript==

let version = '2024.0620';
let lang = document.documentElement.getAttribute('lang');
let valid_langs = ['en'];

if (!valid_langs.includes(lang)) {
    console.info('bwaa - language fallback from', lang, 'to en (lang is not listed as valid)', valid_langs);
    lang = 'en';
}

const trans = {
    en: {

    }
}

tippy.setDefaultProps({
    arrow: false,
    duration: [100, 300],
    delay: [null, 50]
});

let settings_defaults = {

}

// use the top-right link to determine the current user
let auth = '';

let bwaa_url = 'https://www.last.fm/bwaa';
let bwaa_regex = new RegExp('^https://www\.last\.fm/[a-z]+/bwaa$');

(function() {
    'use strict';

    auth = document.querySelector('a.auth-link img').getAttribute('alt');
    initia();

    function initia() {
        console.info('bwaa - starting up');

        // essentials
        bwaa_load_header();

        if (window.location.href == bwaa_url || bwaa_regex.test(window.location.href)) {
            // start bwaa settings
        } else {
            // things that load when not in bwaa settings
        }
    }


    // header
    function bwaa_load_header() {

    }
});