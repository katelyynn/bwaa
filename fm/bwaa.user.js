// ==UserScript==
// @name         bwaa
// @namespace    http://last.fm/
// @version      2024.0620
// @description  bwaaaaaaa
// @author       kate
// @match        https://www.last.fm/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=last.fm
// @updateURL    https://github.com/katelyynn/bwaa/raw/uwu/fm/bwaa.user.js
// @downloadURL  https://github.com/katelyynn/bwaa/raw/uwu/fm/bwaa.user.js
// @run-at       document-body
// @require      https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js
// @require      https://unpkg.com/@popperjs/core@2
// @require      https://unpkg.com/tippy.js@6
// ==/UserScript==

console.info('bwaa - beginning to load');

let version = '2024.0620';
let lang = document.documentElement.getAttribute('lang');
let valid_langs = ['en'];

if (!valid_langs.includes(lang)) {
    console.info('bwaa - language fallback from', lang, 'to en (lang is not listed as valid)', valid_langs);
    lang = 'en';
}

const trans = {
    en: {
        profile: {
            user_types: {
                subscriber: 'Sponsored User'
            }
        }
    }
}

/*tippy.setDefaultProps({
    arrow: false,
    duration: [100, 300],
    delay: [null, 50]
});*/

let settings_defaults = {

}

let profile_badges = {
    'cutensilly': [
        {
            type: 'k',
            name: 'k'
        },
        {
            type: 'a',
            name: 'a'
        },
        {
            type: 't',
            name: 't'
        },
        {
            type: 'e',
            name: 'e'
        },
        {
            type: 'queen',
            name: 'blehhhhhhhhhh!!'
        }
    ],
    'Iexyy': {
        type: 'cat',
        name: 'it\'s a kitty!!'
    },
    'bIeak': [
        {
            type: 'cat',
            name: 'it\'s a kitty!!'
        },
        {
            type: 'glaive',
            name: '#1 glaive fan'
        }
    ],
    'peoplepleasr': {
        type: 'cat',
        name: 'it\'s a kitty!!'
    },
    'twolay': {
        type: 'cat',
        name: 'it\'s a kitty!!'
    },
    'aoivee': {
        type: 'cat',
        name: 'it\'s a kitty!!'
    },
    'Serprety': {
        type: 'cat',
        name: 'it\'s a kitty!!'
    },
    'RazzBX': {
        type: 'cat',
        name: 'it\'s a kitty!!'
    },
    'ivyshandle': {
        type: 'cat',
        name: 'it\'s a kitty!!'
    },
    'KuroinHeroin': {
        type: 'mask',
        name: 'kimchi lover'
    },
    'u5c': {
        type: 'paw',
        name: 'silly creature'
    },
    'destons': {
        type: 'colon-three',
        name: ':3²'
    }
};

// use the top-right link to determine the current user
let auth = '';

let bwaa_url = 'https://www.last.fm/bwaa';
let bwaa_regex = new RegExp('^https://www\.last\.fm/[a-z]+/bwaa$');

(function() {
    'use strict';

    auth = document.querySelector('a.auth-link img').getAttribute('alt');
    console.info('bwaa - auth', auth);
    bwaa();

    function bwaa() {
        console.info('bwaa - starting up');

        // essentials
        bwaa_load_header();

        if (window.location.href == bwaa_url || bwaa_regex.test(window.location.href)) {
            // start bwaa settings
        } else {
            // things that load when not in bwaa settings
            bwaa_profiles();
        }

        // last.fm is a single page application
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node instanceof Element) {
                        if (!node.hasAttribute('data-bwaa')) {
                            node.setAttribute('data-bwaa', 'true');

                            console.info('bwaa - bwaa\'ing');

                            // essentials
                            bwaa_load_header();

                            if (window.location.href == bwaa_url || bwaa_regex.test(window.location.href)) {
                                // start bwaa settings
                            } else {
                                // things that load when not in bwaa settings
                                bwaa_profiles();
                            }
                        }
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }


    // header
    function bwaa_load_header() {
        return 200;
    }


    // run on profile
    function bwaa_profiles() {
        console.info('bwaa - profiles');

        // are we on a profile?
        let profile_header = document.body.querySelector('.header--user');

        if (profile_header == undefined)
            return;

        console.info('bwaa - user is on a profile');

        // are we on the overview page?
        let profile_header_overview = profile_header.classList.contains('header--overview');
        console.info('bwaa - profile overview?', profile_header_overview);


        if (profile_header_overview) {
            // profile overview stuff

            // remove the profile card-related stuff
            let content_top = document.body.querySelector('.content-top');
            if (!content_top.hasAttribute('data-bwaa')) {
                content_top.setAttribute('data-bwaa', 'true');
                content_top.style.setProperty('display', 'none');
            }


            // re-implement header
            let row = document.body.querySelector('.row');
            let col_main = document.body.querySelector('.col-main');
            let recent_tracks = document.getElementById('recent-tracks-section'); // we will use this to append before it

            let navlist = profile_header.querySelector('.navlist');

            // fetch some data from the header
            let header_metadata = profile_header.querySelectorAll('.header-metadata-display p');
            let header_user_data = {
                avatar: profile_header.querySelector('.avatar img'),
                name: profile_header.querySelector('.header-title a').textContent,
                display_name: profile_header.querySelector('.header-title-display-name').textContent,
                since: profile_header.querySelector('.header-scrobble-since').textContent,
                scrobbles: header_metadata[0],
                artists: header_metadata[1].querySelector('a'),
                loved_tracks: header_metadata[2].querySelector('a')
            }

            if (recent_tracks.hasAttribute('data-bwaa'))
                return;
            recent_tracks.setAttribute('data-bwaa', 'true');

            console.info('bwaa - profile has stock labels', header_user_data.labels);
            let this_profile_badges = [];

            let user_is_subscriber = (profile_header.querySelector('.user-status-subscriber') != undefined);
            let user_is_staff = (profile_header.querySelector('.user-status-staff') != undefined);
            let user_is_mod = (profile_header.querySelector('.user-status-mod') != undefined);
            let user_type = 'user';
            if (user_is_subscriber || user_is_staff || user_is_mod)
                user_type = 'subscriber';

            // custom badges
            if (profile_badges.hasOwnProperty(header_user_data.name)) {
                if (!Array.isArray(profile_badges[header_user_data.name])) {
                    // default
                    console.info('bwaa - profile has 1 custom badge', profile_badges[header_user_data.name]);

                    this_profile_badges.push(profile_badges[header_user_data.name]);
                } else {
                    // multiple
                    console.info('bwaa - profile has multiple custom badges', profile_badges[header_user_data.name]);
                    for (let badge_entry in profile_badges[header_user_data.name]) {
                        this_profile_badges.push(profile_badges[header_user_data.name][badge_entry]);
                    }
                }
            }
            console.info('bwaa - profile stock labels & custom badges', this_profile_badges);

            let new_header = document.createElement('section');
            new_header.classList.add('profile-header-section');
            new_header.innerHTML = (`
                <div class="badge-avatar">
                    <img src="${header_user_data.avatar.getAttribute('src')}" alt="${header_user_data.avatar.getAttribute('alt')}">
                </div>
                <div class="badge-info">
                    <h1>${header_user_data.name}</h1>
                    <div class="user-info">
                        <div class="top">
                            <strong>${header_user_data.display_name}</strong>, cutensilly.org
                        </div>
                        <div class="bottom user-last-seen">
                        Last seen: {}
                        </div>
                    </div>
                    <div class="user-data">
                        <div class="user-plays">
                            <div class="count">
                                ${scrobble_flip(header_user_data.scrobbles).outerHTML} plays
                            </div>
                            <div class="since">
                                ${header_user_data.since.replace('• scrobbling ', '')}
                            </div>
                        </div>
                    </div>
                    <div class="user-activity">
                        <a href="${header_user_data.loved_tracks.getAttribute('href')}">${header_user_data.loved_tracks.textContent} Loved Tracks</a> | <a href="${header_user_data.artists.getAttribute('href')}">${header_user_data.artists.textContent} Artists</a> | <a>Shoutbox</a>
                    </div>
                </div>
            `);

            row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, recent_tracks);
            profile_header.style.setProperty('display', 'none');

            // user type
            if (user_type != 'user') {
                let user_type_banner = document.createElement('div');
                user_type_banner.classList.add('user-type-banner', `user-type--${user_type}`);
                user_type_banner.textContent = trans[lang].profile.user_types[user_type];
                row.insertBefore(user_type_banner, col_main);
            }
        } else {
            // profile non-overview stuff
        }
    }

    function scrobble_flip(element) {
        let tooltip = element.getAttribute('title');
        let link = element.querySelector('a').getAttribute('href');
        let scrobbles = element.querySelector('a').textContent.replaceAll(',', '');

        let scrobbles_split = scrobbles.split('');
        let flipper = document.createElement('div');
        flipper.classList.add('flipper-wrap');
        flipper.setAttribute('title', tooltip);
        for (let split in scrobbles_split) {
            let counter = document.createElement('div');
            counter.classList.add('flip');
            counter.textContent = scrobbles_split[split];

            flipper.appendChild(counter);
        }

        return flipper;
    }
})();