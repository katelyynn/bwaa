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

let version = '2024.0622';

let current_promo = `<a href="https://cutensilly.org/bwaa/fm" target="_blank">cutensilly.org/bwaa/fm: you are running bwaa version ${version} »`;

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
                user: 'User',
                subscriber: 'Subscriber',
                staff: 'Staff',
                mod: 'Mod',
                queen: 'bwaaaaaaaaaa!!',
                cat: 'it\'s a kitty!!',
                glaive: '#1 glaive fan',
                paw: 'silly creature',
                'colon-three': ':3²'
            },
            tasteometer: {
                super: 'SUPER',
                very_high: 'VERY HIGH',
                high: 'HIGH',
                medium: 'MEDIUM',
                low: 'LOW',
                very_low: 'VERY LOW',
                unknown: 'UNKNOWN'
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
            type: 'queen'
        }
    ],
    'Iexyy': {
        type: 'cat'
    },
    'bIeak': [
        {
            type: 'cat'
        },
        {
            type: 'glaive'
        }
    ],
    'peoplepleasr': {
        type: 'cat'
    },
    'twolay': {
        type: 'cat'
    },
    'aoivee': {
        type: 'cat'
    },
    'Serprety': {
        type: 'cat'
    },
    'RazzBX': {
        type: 'cat'
    },
    'ivyshandle': {
        type: 'cat'
    },
    'u5c': {
        type: 'paw'
    },
    'destons': {
        type: 'colon-three'
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
            bwaa_albums();
            bwaa_tracks();
            bwaa_shouts();
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
                                bwaa_albums();
                                bwaa_tracks();
                                bwaa_shouts();
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

        let inner = document.body.querySelector('.masthead-inner-wrap');

        let promo = document.createElement('div');
        promo.classList.add('header-promo');
        promo.innerHTML = current_promo;
        inner.appendChild(promo);
    }


    // run on profile
    function bwaa_profiles() {
        console.info('bwaa - profiles');

        // are we on a profile?
        let profile_header = document.body.querySelector('.header--user');

        if (profile_header == undefined)
            return;

        if (profile_header.hasAttribute('data-bwaa'))
            return;
        profile_header.setAttribute('data-bwaa', 'true');

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

            // user type
            let user_type = 'user';
            let user_follows_you = (profile_header.querySelector('.label.user-follow') != undefined);

            // custom badges
            if (profile_badges.hasOwnProperty(header_user_data.name)) {
                if (!Array.isArray(profile_badges[header_user_data.name])) {
                    // default
                    console.info('bwaa - profile has 1 custom badge', profile_badges[header_user_data.name]);

                    user_type = profile_badges[header_user_data.name].type;
                } else {
                    // multiple
                    console.info('bwaa - profile has multiple custom badges', profile_badges[header_user_data.name]);

                    user_type = profile_badges[header_user_data.name][profile_badges[header_user_data.name].length-1].type;
                }
            } else {
                let user_is_subscriber = (profile_header.querySelector('.user-status-subscriber') != undefined);
                let user_is_staff = (profile_header.querySelector('.user-status-staff') != undefined);
                let user_is_mod = (profile_header.querySelector('.user-status-mod') != undefined);
                if (user_is_staff)
                    user_type = 'staff';
                else if (user_is_mod)
                    user_type = 'mod';
                else if (user_is_subscriber)
                    user_type = 'subscriber';
            }
            console.info('bwaa - user is of type', user_type);


            // when was this user last seen scrobbling?
            let recent_tracks = document.getElementById('recent-tracks-section');
            let last_seen = '';
            if (recent_tracks != undefined) {
                let latest_chartlist_timestamp = document.body.querySelector('.chartlist-timestamp');
                let scrobbling_now = latest_chartlist_timestamp.querySelector('.chartlist-now-scrobbling');

                if (scrobbling_now == undefined)
                    last_seen = latest_chartlist_timestamp.querySelector('span').textContent;
                else
                    last_seen = 'Active now';
            } else {
                last_seen = 'Unknown';
            }


            // user interactions
            if (auth != header_user_data.name) {
                let follow_button = profile_header.querySelector('.header-avatar [data-toggle-button=""]').outerHTML;

                let tasteometer = profile_header.querySelector('.tasteometer');
                let tasteometer_percent = tasteometer.querySelector('.tasteometer-viz').getAttribute('title');
                let tasteometer_lvl = tasteometer.classList[1];

                let tasteometer_artists = tasteometer.querySelectorAll('.tasteometer-shared-artists a');

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
                        <p>Music you have in common includes ${tasteometer_artists[0].outerHTML}, ${tasteometer_artists[1].outerHTML} and ${tasteometer_artists[2].outerHTML}.</p>
                    </div>
                `);
                col_main.insertBefore(profile_actions, col_main.firstChild);

                /*let follow_button2 = document.body.querySelector('.profile-actions-section .header-follower-btn');
                follow_button2.setAttribute('onclick', '_update_follow_btn(this)');
                console.info(follow_button2, follow_button2.getAttribute('data-analytics-action'), follow_button2.getAttribute('data-analytics-action') == 'UnfollowUser');
                if (follow_button2.getAttribute('data-analytics-action') == 'UnfollowUser')
                    follow_button2.textContent = 'You are friends';
                else
                    follow_button2.textContent = 'Add as friend';*/
            }

            // main user header
            // this is on top of the actions, but appending is backwards
            let new_header = document.createElement('section');
            new_header.classList.add('profile-header-section');
            new_header.innerHTML = (`
                <div class="badge-avatar">
                    <img src="${header_user_data.avatar.getAttribute('src').replace('/i/u/avatar170s/', '/i/u/ar0/')}" alt="${header_user_data.avatar.getAttribute('alt')}">
                    <div class="user-type user-type--${user_type}">
                        <a>${trans[lang].profile.user_types[user_type]}</a>
                    </div>
                </div>
                <div class="badge-info">
                    <h1>${header_user_data.name}</h1>
                    <div class="user-info">
                        <div class="top">
                            <strong>${header_user_data.display_name}</strong>${(user_follows_you) ? '(follows you!)' : ''}
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
                        <a href="${header_user_data.loved_tracks.getAttribute('href')}">${header_user_data.loved_tracks.textContent} Loved Tracks</a> | <a href="${header_user_data.artists.getAttribute('href')}">${header_user_data.artists.textContent} Artists</a> | <a href="${header_user_data.link}/shoutbox">Shouts</a>
                    </div>
                </div>
            `);

            row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, col_main.firstChild);
            profile_header.style.setProperty('display', 'none');

            // user type
            /*if (user_type != 'user') {
                let user_type_banner = document.createElement('div');
                user_type_banner.classList.add('user-type-banner', `user-type--${user_type}`);
                user_type_banner.textContent = trans[lang].profile.user_types[user_type];
                row.insertBefore(user_type_banner, col_main);
            }*/
        } else {
            // profile non-overview stuff

            let header_user_data = {
                avatar: profile_header.querySelector('.avatar img'),
                name: profile_header.querySelector('.header-title a').textContent,
                link: profile_header.querySelector('.header-title a').getAttribute('href'),
                page: document.body.querySelector('.content-top-header').textContent
            }

            let library_controls = content_top.querySelector('.library-controls');
            if (library_controls != undefined) {
                col_main.insertBefore(library_controls, col_main.firstChild);
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

        let navlist = artist_header.querySelector('.navlist');
        if (!is_subpage) {
            navlist = document.createElement('nav');
            navlist.classList.add('navlist', 'secondary-nav', 'navlist--more');
            navlist.setAttribute('aria-label', 'Secondary navigation');
            navlist.setAttribute('data-require', 'components/collapsing-nav-v2');

            navlist.innerHTML = (`
                <ul class="navlist-items js-navlist-items" style="position: relative;">
                    <li class="navlist-item secondary-nav-item secondary-nav-item--overview">
                        <a class="secondary-nav-item-link secondary-nav-item-link--active" href="${window.location.href}">
                            Overview
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--tracks">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+tracks">
                            Tracks
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--albums">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+albums">
                            Albums
                            <span class="sr-only">(current section)</span>
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--images">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+images">
                            Photos
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--similar">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+similar">
                            Similar Artists
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--events">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+events">
                            Events
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--wiki">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+wiki">
                            Biography
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--tags">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+tags">
                            Tags
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--shoutbox">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+shoutbox">
                            Shouts
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--listeners">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+listeners">
                            Listeners
                        </a>
                    </li>
                </ul>
            `);
        }

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

            row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, col_main.firstChild);
            artist_header.style.setProperty('display', 'none');
        } else {
            let header_user_data = {
                avatar: artist_header.querySelector('.header-new-background-image').getAttribute('content'),
                name: artist_header.querySelector('.header-new-title').textContent,
                link: artist_header.querySelector('.secondary-nav-item--overview a').getAttribute('href'),
                page: document.body.querySelector('.subpage-title').textContent
            }

            let new_header = document.createElement('section');
            new_header.classList.add('profile-header-subpage-section');
            new_header.innerHTML = (`
                <div class="badge-avatar">
                    <img src="${header_user_data.avatar}">
                </div>
                <div class="badge-info">
                    <a href="${header_user_data.link}">${header_user_data.name}</a>
                    <h1>${header_user_data.page}</h1>
                </div>
            `);

            row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, col_main.firstChild);
            artist_header.style.setProperty('display', 'none');

            document.body.querySelector('.container.page-content').classList.add('subpage');
        }
    }

    function bwaa_albums() {
        let album_header = document.body.querySelector('.header-new--album');

        if (album_header == undefined)
            return;

        if (album_header.hasAttribute('data-bwaa'))
            return;
        album_header.setAttribute('data-bwaa', 'true');

        let is_subpage = album_header.classList.contains('header-new--subpage');


        let row = document.body.querySelector('.row');
        let col_main = document.body.querySelector('.col-main:not(.visible-xs)');

        let navlist = album_header.querySelector('.navlist');
        if (!is_subpage) {
            navlist = document.createElement('nav');
            navlist.classList.add('navlist', 'secondary-nav', 'navlist--more');
            navlist.setAttribute('aria-label', 'Secondary navigation');
            navlist.setAttribute('data-require', 'components/collapsing-nav-v2');

            navlist.innerHTML = (`
                <ul class="navlist-items js-navlist-items" style="position: relative;">
                    <li class="navlist-item secondary-nav-item secondary-nav-item--overview">
                        <a class="secondary-nav-item-link secondary-nav-item-link--active" href="${window.location.href}">
                            Overview
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--wiki">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+wiki">
                            Wiki
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--tags">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+tags">
                            Tags
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--images">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+images">
                            Artwork
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--similar">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+shoutbox">
                            Shouts
                        </a>
                    </li>
                </ul>
            `);
        }

        if (!is_subpage) {
            let album_metadata = album_header.querySelectorAll('.header-metadata-tnew-display');

            let avatar_element = document.body.querySelector('.album-overview-cover-art img');
            let avatar = '';
            let add_artwork = '';
            if (avatar_element != undefined) {
                avatar = avatar_element.getAttribute('src');
                add_artwork = document.body.querySelector('.album-overview-cover-art-gallery-action a').getAttribute('href');
            }

            let header_album_data = {
                avatar: avatar,
                name: album_header.querySelector('.header-new-title').textContent,
                artist: album_header.querySelector('.header-new-crumb span').textContent,
                artist_link: album_header.querySelector('.header-new-crumb').getAttribute('href'),
                link: window.location.href,
                plays: album_metadata[1].querySelector('abbr').getAttribute('title'),
                listeners: album_metadata[0].querySelector('abbr').getAttribute('title'),
                add_artwork: add_artwork
            }

            let new_header = document.createElement('section');
            new_header.classList.add('profile-album-section');
            new_header.innerHTML = (`
                <div class="album-info">
                    <h1>${header_album_data.name} by <a href="${header_album_data.artist_link}">${header_album_data.artist}</a></h1>
                    <div class="stats">
                        ${header_album_data.plays} plays (${header_album_data.listeners} listeners)
                    </div>
                </div>
                <div class="album-image-side">
                    <a class="image" href="${header_album_data.add_artwork}">
                        <img src="${header_album_data.avatar}">
                    </a>
                </div>
            `);

            row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, col_main.firstChild);
            album_header.style.setProperty('display', 'none');
        } else {
            let subpage_title = document.body.querySelector('.subpage-title');
            if (subpage_title == undefined)
                subpage_title = col_main.querySelector(':scope > h2');

            let header_album_data = {
                avatar: album_header.querySelector('.header-new-background-image').getAttribute('content'),
                name: album_header.querySelector('.header-new-title').textContent,
                artist: album_header.querySelector('.header-new-crumb span').textContent,
                artist_link: album_header.querySelector('.header-new-crumb').getAttribute('href'),
                link: album_header.querySelector('.secondary-nav-item--overview a').getAttribute('href'),
                page: subpage_title.textContent
            }

            let new_header = document.createElement('section');
            new_header.classList.add('profile-header-subpage-section');
            new_header.innerHTML = (`
                <div class="badge-avatar">
                    <img src="${header_album_data.avatar}">
                </div>
                <div class="badge-info">
                    <a href="${header_album_data.link}">${header_album_data.name} by <a href="${header_album_data.artist_link}">${header_album_data.artist}</a></a>
                    <h1>${header_album_data.page}</h1>
                </div>
            `);

            row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, col_main.firstChild);
            album_header.style.setProperty('display', 'none');

            document.body.querySelector('.container.page-content').classList.add('subpage');
        }
    }

    function bwaa_tracks() {
        let track_header = document.body.querySelector('.header-new--track');

        if (track_header == undefined)
            return;

        if (track_header.hasAttribute('data-bwaa'))
            return;
        track_header.setAttribute('data-bwaa', 'true');

        let is_subpage = track_header.classList.contains('header-new--subpage');


        let row = document.body.querySelector('.row');
        let col_main = document.body.querySelector('.col-main');

        let navlist = track_header.querySelector('.navlist');
        if (!is_subpage) {
            navlist = document.createElement('nav');
            navlist.classList.add('navlist', 'secondary-nav', 'navlist--more');
            navlist.setAttribute('aria-label', 'Secondary navigation');
            navlist.setAttribute('data-require', 'components/collapsing-nav-v2');

            navlist.innerHTML = (`
                <ul class="navlist-items js-navlist-items" style="position: relative;">
                    <li class="navlist-item secondary-nav-item secondary-nav-item--overview">
                        <a class="secondary-nav-item-link secondary-nav-item-link--active" href="${window.location.href}">
                            Overview
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--albums">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+albums">
                            Albums
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--wiki">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+wiki">
                            Wiki
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--tags">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+tags">
                            Tags
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--similar">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+shoutbox">
                            Shouts
                        </a>
                    </li>
                </ul>
            `);
        }

        if (!is_subpage) {
            let col_sidebar = document.body.querySelector('.col-sidebar.buffer-standard');
            let track_metadata = track_header.querySelectorAll('.header-metadata-tnew-display');

            let avatar_element = document.body.querySelector('.source-album-art img');
            let avatar = '';
            if (avatar_element != undefined)
                avatar = avatar_element.getAttribute('src');

            let header_track_data = {
                avatar: avatar,
                name: track_header.querySelector('.header-new-title').textContent,
                artist: track_header.querySelector('.header-new-crumb span').textContent,
                artist_link: track_header.querySelector('.header-new-crumb').getAttribute('href'),
                link: window.location.href,
                plays: track_metadata[1].querySelector('abbr').getAttribute('title'),
                listeners: track_metadata[0].querySelector('abbr').getAttribute('title'),
                album_amount: parseInt(document.body.querySelectorAll('.source-album').length) - 1
            }

            let new_header = document.createElement('section');
            new_header.classList.add('profile-track-section');
            new_header.innerHTML = (`
                <div class="header">
                    <div class="track-image-side">
                        <a class="image">
                            <img src="${header_track_data.avatar}">
                        </a>
                    </div>
                    <div class="track-info">
                        <h1>${header_track_data.name} by <a href="${header_track_data.artist_link}">${header_track_data.artist}</a></h1>
                        <p>On ${header_track_data.album_amount} albums <strong><a href="${header_track_data.link}/+albums">see all</a></strong></p>
                    </div>
                </div>
            `);

            row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, col_main.firstChild);
            track_header.style.setProperty('display', 'none');

            // sidebar
            let listener_trend = document.body.querySelector('.listener-trend').outerHTML;

            let track_stats = document.createElement('section');
            track_stats.innerHTML = (`
                <h2>Track Stats</h2>
                <div class="stats-container">
                    <div class="scrobbles-and-listeners">
                        <div class="scrobbles">
                            <h1>${header_track_data.plays}</h1>
                            <p>Scrobbles</p>
                        </div>
                        <div class="listeners">
                            <h1>${header_track_data.listeners}</h1>
                            <p>Listeners</p>
                        </div>
                    </div>
                    <div class="recent-listening-trend">
                        <p>Recent Listening Trend</p>
                        ${listener_trend}
                    </div>
                </div>
            `);
            col_sidebar.insertBefore(track_stats, col_sidebar.firstChild);
        } else {
            let subpage_title = document.body.querySelector('.subpage-title');
            if (subpage_title == undefined)
                subpage_title = col_main.querySelector(':scope > h2');

            let header_track_data = {
                avatar: track_header.querySelector('.header-new-background-image').getAttribute('content'),
                name: track_header.querySelector('.header-new-title').textContent,
                artist: track_header.querySelector('.header-new-crumb span').textContent,
                artist_link: track_header.querySelector('.header-new-crumb').getAttribute('href'),
                link: track_header.querySelector('.secondary-nav-item--overview a').getAttribute('href'),
                page: subpage_title.textContent
            }

            let new_header = document.createElement('section');
            new_header.classList.add('profile-header-subpage-section');
            new_header.innerHTML = (`
                <div class="badge-avatar">
                    <img src="${header_track_data.avatar}">
                </div>
                <div class="badge-info">
                    <a href="${header_track_data.link}">${header_track_data.name} by <a href="${header_track_data.artist_link}">${header_track_data.artist}</a></a>
                    <h1>${header_track_data.page}</h1>
                </div>
            `);

            row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, col_main.firstChild);
            track_header.style.setProperty('display', 'none');

            document.body.querySelector('.container.page-content').classList.add('subpage');
        }
    }


    function bwaa_shouts() {
        // avatars
        let shout_avatars = document.body.querySelectorAll('.shout-user-avatar img');
        shout_avatars.forEach((shout_avatar) => {
            if (shout_avatar.hasAttribute('data-bwaa'))
                return;
            shout_avatar.setAttribute('data-bwaa', 'true');

            // this allows shout avatars to be varied in shape
            let src = shout_avatar.getAttribute('src');
            src = src.replace('/i/u/avatar70s/', '/i/u/ar0/');
            shout_avatar.setAttribute('src', src);
        });
    }
})();