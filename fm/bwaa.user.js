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
            },
            tasteometer: {
                super: 'Super',
                very_high: 'Very High',
                high: 'High',
                medium: 'Medium',
                low: 'Low',
                very_low: 'Very Low'
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
let auth_link = '';

let bwaa_url = 'https://www.last.fm/bwaa';
let bwaa_regex = new RegExp('^https://www\.last\.fm/[a-z]+/bwaa$');

(function() {
    'use strict';

    auth_link = document.querySelector('a.auth-link');
    auth = auth_link.querySelector('img').getAttribute('alt');
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
            bwaa_artists();
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
                                bwaa_artists();
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
        let auth_link = document.body.querySelector('.auth-link');

        if (auth_link.hasAttribute('data-bwaa'))
            return;
        auth_link.setAttribute('data-bwaa', 'true');

        let text = document.createElement('p');
        text.textContent = auth;
        auth_link.appendChild(text);
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

        // remove the profile card-related stuff
        let content_top = document.body.querySelector('.content-top');
        if (!content_top.hasAttribute('data-bwaa')) {
            content_top.setAttribute('data-bwaa', 'true');
            content_top.style.setProperty('display', 'none');
        }

        let row = document.body.querySelector('.row');
        let col_main = document.body.querySelector('.col-main');

        let navlist = profile_header.querySelector('.navlist');


        if (profile_header_overview) {
            // profile overview stuff

            // re-implement header
            let recent_tracks = document.getElementById('recent-tracks-section'); // we will use this to append before it

            // fetch some data from the header
            let header_metadata = profile_header.querySelectorAll('.header-metadata-display p');
            let header_user_data = {
                avatar: profile_header.querySelector('.avatar img'),
                name: profile_header.querySelector('.header-title a').textContent,
                link: profile_header.querySelector('.header-title a').getAttribute('href'),
                display_name: profile_header.querySelector('.header-title-display-name').textContent,
                since: profile_header.querySelector('.header-scrobble-since').textContent,
                scrobbles: header_metadata[0],
                artists: header_metadata[1].querySelector('a'),
                loved_tracks: (header_metadata[2] != undefined) ? header_metadata[2].querySelector('a') : placeholder_loved_tracks()
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

            let latest_chartlist_timestamp = document.body.querySelector('.chartlist-timestamp');
            let scrobbling_now = latest_chartlist_timestamp.querySelector('.chartlist-now-scrobbling');
            let last_seen = '';
            if (scrobbling_now == undefined)
                last_seen = latest_chartlist_timestamp.querySelector('span').textContent;
            else
                last_seen = 'Active now';

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
                        Last seen: ${last_seen}
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
                        <a href="${header_user_data.loved_tracks.getAttribute('href')}">${header_user_data.loved_tracks.textContent} Loved Tracks</a> | <a href="${header_user_data.artists.getAttribute('href')}">${header_user_data.artists.textContent} Artists</a> | <a href="${header_user_data.link}/shoutbox">Shoutbox</a>
                    </div>
                </div>
            `);

            row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, recent_tracks);
            profile_header.style.setProperty('display', 'none');

            if (auth != header_user_data.name) {
                let follow_button = profile_header.querySelector('.header-avatar [data-toggle-button=""]').outerHTML;

                let tasteometer = profile_header.querySelector('.tasteometer');
                let tasteometer_percent = tasteometer.querySelector('.tasteometer-viz').getAttribute('title');
                let tasteometer_lvl = tasteometer.classList[1];

                let profile_actions = document.createElement('section');
                profile_actions.classList.add('profile-actions-section');
                profile_actions.innerHTML = (`
                    <div class="options">
                        ${follow_button}
                        <a class="has-icon leave-a-shout" href="${header_user_data.link}/shoutbox">Leave a shout</a>
                    </div>
                    <div class=tasteometer ${tasteometer_lvl}">
                        <p>Your musical compatibility with <strong>${header_user_data.name}</strong> is <strong>${trans[lang].profile.tasteometer[tasteometer_lvl.replace('tasteometer-compat-', '')]}</strong></p>
                        <div class="bar">
                            <div class="fill" style="width: ${tasteometer_percent}"></div>
                        </div>
                    </div>
                `);
                col_main.insertBefore(profile_actions, recent_tracks);

                let follow_button2 = document.body.querySelector('.profile-actions-section .header-follower-btn');
                follow_button2.setAttribute('onclick', '_update_follow_btn(this)');
                console.info(follow_button2, follow_button2.getAttribute('data-analytics-action'), follow_button2.getAttribute('data-analytics-action') == 'UnfollowUser');
                if (follow_button2.getAttribute('data-analytics-action') == 'UnfollowUser')
                    follow_button2.textContent = 'You are friends';
                else
                    follow_button2.textContent = 'Add as friend';
            }

            // user type
            if (user_type != 'user') {
                let user_type_banner = document.createElement('div');
                user_type_banner.classList.add('user-type-banner', `user-type--${user_type}`);
                user_type_banner.textContent = trans[lang].profile.user_types[user_type];
                row.insertBefore(user_type_banner, col_main);
            }
        } else {
            // profile non-overview stuff

            let header_user_data = {
                avatar: profile_header.querySelector('.avatar img'),
                name: profile_header.querySelector('.header-title a').textContent,
                link: profile_header.querySelector('.header-title a').getAttribute('href'),
                page: document.body.querySelector('.content-top-header').textContent
            }

            let new_header = document.createElement('section');
            new_header.classList.add('profile-header-subpage-section');
            new_header.innerHTML = (`
                <div class="badge-avatar">
                    <img src="${header_user_data.avatar.getAttribute('src')}" alt="${header_user_data.avatar.getAttribute('alt')}">
                </div>
                <div class="badge-info">
                    <a href="${header_user_data.link}">${header_user_data.name}</a>
                    <h1>${header_user_data.page}</h1>
                </div>
            `);

            row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, col_main.firstChild);
            profile_header.style.setProperty('display', 'none');

            document.body.querySelector('.container.page-content').classList.add('subpage');
        }
    }

    unsafeWindow._update_follow_btn = function(button) {
        if (button.getAttribute('data-analytics-action') == 'UnfollowUser')
            button.textContent = 'You are friends';
        else
            button.textContent = 'Add as friend';
    }

    function placeholder_loved_tracks() {
        let placeholder = document.createElement('a');
        placeholder.setAttribute('href', '');
        placeholder.textContent = '0';

        return placeholder;
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


    function bwaa_artists() {
        let artist_header = document.body.querySelector('.header-new--artist');

        if (artist_header == undefined)
            return;

        if (artist_header.hasAttribute('data-bwaa'))
            return;
        artist_header.setAttribute('data-bwaa', 'true');

        let is_subpage = artist_header.classList.contains('header-new--subpage');


        let row = document.body.querySelector('.row');
        let col_main = document.body.querySelector('.col-main');

        if (!is_subpage) {
            let artist_metadata = artist_header.querySelectorAll('.header-metadata-tnew-display');
            let header_artist_data = {
                avatar: artist_header.querySelector('.header-new-background-image').getAttribute('content'),
                name: artist_header.querySelector('.header-new-title').textContent,
                link: window.location.href,
                photos: artist_header.querySelector('.header-new-gallery-inner').textContent,
                plays: artist_metadata[1].querySelector('abbr').getAttribute('title'),
                listeners: artist_metadata[0].querySelector('abbr').getAttribute('title')
            }

            let new_header = document.createElement('section');
            new_header.classList.add('profile-artist-section');
            new_header.innerHTML = (`
                <div class="artist-info">
                    <h1>${header_artist_data.name}</h1>
                    <div class="stats">
                        ${header_artist_data.plays} plays (${header_artist_data.listeners} listeners)
                    </div>
                </div>
                <div class="artist-image-side">
                    <div class="images">
                        <div class="top">
                            <a>
                                <img src="${header_artist_data.avatar}">
                            </a>
                        </div>
                        <div class="bottom">

                        </div>
                    </div>
                    <div class="option">
                        <a href="${header_artist_data.link}/+images">See all ${header_artist_data.photos}</a>
                    </div>
                </div>
            `);

            //row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, col_main.firstChild);
            artist_header.style.setProperty('display', 'none');
        } else {

        }
    }
})();