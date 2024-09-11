// ==UserScript==
// @name         bwaa
// @namespace    http://last.fm/
// @version      2024.0910
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

let version = {
    build: '2024.0910',
    sku: 'sweet'
}

let current_promo = `<a href="https://cutensilly.org/bwaa/fm" target="_blank">cutensilly.org/bwaa/fm: you are running bwaa version ${version.build}.${version.sku} »`;

// loads your selected language in last.fm
let lang;
let non_override_lang;
// WARN: fill this out if translating
// lists all languages with valid bwaa translations
// any custom translations will not load if not listed here!!
let valid_langs = ['en'];

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
            },
            reports: {
                categories: {
                    week: 'Last week',
                    month: 'Last month',
                    year: 'Last year'
                }
            }
        },
        gallery: {
            tabs: {
                overview: 'Photos',
                bookmarks: 'Saved'
            },
            bookmarks: {
                name: 'Saved',
                bio: 'Gallery photos can be saved for future reference.',
                no_data: 'no images saved (・・ )',
                button: {
                    image_is_bookmarked: {
                        name: 'You have saved this image'
                    },
                    bookmark_this_image: {
                        name: 'Save this image',
                        bio: 'Save this image for later'
                    },
                    unbookmark_this_image: {
                        name: 'Unsave this image',
                        bio: 'Unsave this image'
                    }
                }
            }
        },
        settings: {
            themes: {
                simply_red: {
                    name: 'Simply Red'
                },
                paint_it_black: {
                    name: 'Paint It Black'
                }
            }
        }
    }
}

function lookup_lang() {
    root = document.querySelector('.masthead-logo a').getAttribute('href');
    lang = document.documentElement.getAttribute('lang');
    non_override_lang = lang;

    if (!valid_langs.includes(lang)) {
        console.info('bwaa - language fallback from', lang, 'to en (language is not listed as valid)', valid_langs);
        lang = 'en';
    }
}

/*tippy.setDefaultProps({
    arrow: false,
    duration: [100, 300],
    delay: [null, 50]
});*/

let settings;
let settings_defaults = {
    developer: false,
    inbuilt_style_loading: true,
    theme: 'simply_red',
    test: false,
    varied_avatar_shapes: true,
    sticky_nav: false,
    shouts_2010: false,
    shouts_no_votes: false,
    no_notifs: false,
    hide_redirect_banner: false,
    legacy_cover_art: true,

    hide_obsessions: false,
    hide_your_progress: false,
    hide_listening_reports: false
}
let settings_store = {
    developer: {
        type: 'toggle',
        values: [true, false]
    },
    inbuilt_style_loading: {
        type: 'toggle',
        values: [true, false]
    },
    theme: {
        type: 'option'
    },
    test: {
        type: 'toggle',
        values: [true, false]
    },
    varied_avatar_shapes: {
        type: 'toggle',
        values: [true, false]
    },
    sticky_nav: {
        type: 'toggle',
        values: [true, false]
    },
    shouts_2010: {
        type: 'toggle',
        values: [true, false]
    },
    shouts_no_votes: {
        type: 'toggle',
        values: [true, false]
    },
    no_notifs: {
        type: 'toggle',
        values: [true, false]
    },
    hide_redirect_banner: {
        type: 'toggle',
        values: [true, false]
    },
    legacy_cover_art: {
        type: 'toggle',
        values: [true, false]
    }
}
let legacy_cover_art = {
    // NIRVANA
    '570021b68d3d9d2db08bc99a473303b0.jpg': 'de8d87469f794622a0687feb36e13c07.jpg', // NEVERMIND
    '3324e5982f0d81338d2749d5161eb2a8.jpg': 'de8d87469f794622a0687feb36e13c07.jpg', // NEVERMIND (REMASTERED)
    'b897255bf422baa93a42536af293f9f8.jpg': 'acbf048199bb4cf18ed93d3065a25be9.jpg' // IN UTERO
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

let root = '';

let bwaa_url = 'https://www.last.fm/bwaa';
let bwaa_regex = new RegExp('^https://www\.last\.fm/[a-z]+/bwaa$');

let setup_url = 'https://www.last.fm/bwaa/setup';
let setup_regex = new RegExp('^https://www\.last\.fm/[a-z]+/bwaa/setup$');

(function() {
    'use strict';

    auth_link = document.querySelector('a.auth-link');
    auth = auth_link.querySelector('img').getAttribute('alt');
    console.info('bwaa - auth', auth);
    bwaa();

    function bwaa() {
        console.info('bwaa - starting up');

        // essentials
        document.head.querySelector('link[rel="icon"]').setAttribute('href', 'https://katelyynn.github.io/bwaa/fm/res/favicon.2.ico');
        lookup_lang();
        load_settings();
        bwaa_load_header();
        load_notifs();

        notify_if_new_update();

        if (window.location.href == bwaa_url || bwaa_regex.test(window.location.href)) {
            // start bwaa settings
            bwaa_settings();
        } else if (window.location.href == setup_url || setup_regex.test(window.location.href)) {
            // start bwaa setup
            bwaa_setup();
        } else {
            // things that load when not in bwaa settings
            bwaa_profiles();
            bwaa_artists();
            bwaa_albums();
            bwaa_tracks();
            bwaa_shouts();
            bwaa_artworks();
            bwaa_friends();
            bwaa_obsessions();
            bwaa_library();
            bwaa_media_items();
        }
        bwaa_lastfm_settings();
        bwaa_footer();

        // last.fm is a single page application
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node instanceof Element) {
                        console.info(node.className);
                        if (node.classList[0] == 'modal-dialog') {
                            // this is a silly hack to ensure modals get themed, as the creation of this element
                            // causes another run of this script, giving enough time for the modal to load
                            // this took so long
                            fix_modal();
                        }

                        if (!node.hasAttribute('data-bwaa')) {
                            node.setAttribute('data-bwaa', 'true');
                            console.info('node', node);

                            console.info('bwaa - bwaa\'ing');

                            // essentials
                            lookup_lang();
                            load_settings();
                            bwaa_load_header();

                            if (window.location.href == bwaa_url || bwaa_regex.test(window.location.href)) {
                                // start bwaa settings
                                bwaa_settings();
                            } else if (window.location.href == setup_url || setup_regex.test(window.location.href)) {
                                // start bwaa setup
                                bwaa_setup();
                            } else {
                                // things that load when not in bwaa settings
                                bwaa_profiles();
                                bwaa_artists();
                                bwaa_albums();
                                bwaa_tracks();
                                bwaa_shouts();
                                bwaa_artworks();
                                bwaa_friends();
                                bwaa_obsessions();
                                bwaa_library();
                                bwaa_media_items();
                            }
                            bwaa_lastfm_settings();
                            bwaa_footer();
                        }
                    }
                }
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }


    // header
    function bwaa_load_header() {
        let auth_link = document.querySelector('a.auth-link');

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


        let selected_language = document.querySelector('.footer-language--active strong').textContent;
        let language_options = document.querySelectorAll('.footer-language-form');

        let language_menu = document.createElement('div');
        language_menu.classList.add('language-menu');

        language_options.forEach((language_option) => {
            let button = language_option.querySelector('button');
            button.classList.remove('mimic-link');
            button.classList.add('language-menu-item');

            language_menu.appendChild(language_option);
        });


        let search_companion_nav = document.createElement('div');
        search_companion_nav.classList.add('search-companion-nav');
        search_companion_nav.innerHTML = (`
            <span class="language-wrapper" id="language-wrapper" data-dialog-open="false"><a onclick="_open_language_menu()" name="${non_override_lang}">${selected_language}</a>${language_menu.outerHTML}</span> | <a onclick="toggle_theme()" id="theme-value">${trans[lang].settings.themes[settings.theme].name}</a> | <a href="${root}help">Help</a>
        `);
        inner.appendChild(search_companion_nav);
    }

    unsafeWindow._open_language_menu = function() {
        let wrapper = document.getElementById('language-wrapper');

        let current_state = wrapper.getAttribute('data-dialog-open');
        if (current_state == 'false')
            wrapper.setAttribute('data-dialog-open', 'true');
        else
            wrapper.setAttribute('data-dialog-open', 'false');
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
        let navlist_items = navlist.querySelector('.navlist-items');

        let journal_nav_btn = document.createElement('li');
        journal_nav_btn.classList.add('navlist-item', 'secondary-nav-item', 'secondary-nav-item--journal');


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

            journal_nav_btn.innerHTML = (`
                <a class="secondary-nav-item-link" href="${root}user/${header_user_data.name}/journal">
                    Journal
                </a>
            `);

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
                    last_seen = 'active now';
            } else {
                last_seen = 'unknown o.O';
            }


            // user interactions
            if (auth != header_user_data.name) {
                let follow_button = profile_header.querySelector('.header-avatar [data-toggle-button=""]').outerHTML;

                let tasteometer = profile_header.querySelector('.tasteometer');
                let tasteometer_percent = tasteometer.querySelector('.tasteometer-viz').getAttribute('title');
                let tasteometer_lvl = tasteometer.classList[1];

                let tasteometer_artists = tasteometer.querySelectorAll('.tasteometer-shared-artists a');
                let music_you_have_in_common = 'You have no music in common :(';
                if (tasteometer_artists.length > 0) {
                    music_you_have_in_common = `Music you have in common includes ${tasteometer_artists[0].outerHTML}`;
                    if (tasteometer_artists.length > 1) {
                        music_you_have_in_common = `${music_you_have_in_common}, ${tasteometer_artists[1].outerHTML}`;
                        if (tasteometer_artists.length > 2) {
                            music_you_have_in_common = `${music_you_have_in_common}, and ${tasteometer_artists[2].outerHTML}.`;
                        }
                    }
                }

                let profile_actions = document.createElement('section');
                profile_actions.classList.add('profile-actions-section');
                profile_actions.innerHTML = (`
                    <div class="options">
                        ${follow_button}
                        <a class="has-icon send-a-msg" href="${root}inbox/compose?to=${header_user_data.name}">Send a message</a>
                        <a class="has-icon leave-a-shout" href="${header_user_data.link}/shoutbox">Leave a shout</a>
                    </div>
                    <div class="tasteometer ${tasteometer_lvl}" data-taste="${tasteometer_lvl.replace('tasteometer-compat-', '')}">
                        <p>Your musical compatibility with <strong>${header_user_data.name}</strong> is <strong>${trans[lang].profile.tasteometer[tasteometer_lvl.replace('tasteometer-compat-', '')]}</strong></p>
                        <div class="bar">
                            <div class="fill" style="width: ${tasteometer_percent}"></div>
                        </div>
                        <p>${music_you_have_in_common}</p>
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

            let user_avatar = header_user_data.avatar.getAttribute('src');
            if (settings.varied_avatar_shapes)
                user_avatar = user_avatar.replace('/i/u/avatar170s/', '/i/u/550x0/');

            // main user header
            // this is on top of the actions, but appending is backwards
            let new_header = document.createElement('section');
            new_header.classList.add('profile-header-section');
            new_header.innerHTML = (`
                <div class="badge-avatar">
                    <img src="${user_avatar}" alt="${header_user_data.avatar.getAttribute('alt')}">
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
                        ${(auth != header_user_data.name) ? `
                        <div class="bottom user-last-seen">
                            Last seen: ${last_seen}
                        </div>
                        ` : `
                        <div class="bottom edit-profile-details">
                            <a href="${root}settings">Edit profile details »</a>
                        </div>
                        `}
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

            navlist_items.appendChild(journal_nav_btn);
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




            // listening reports
            let listening_report_items = document.body.querySelectorAll('.listening-report-promo');
            listening_report_items.forEach((report) => {
                report.classList.remove('listening-report-promo');
                report.classList.add('listen-report', 'journal-like');

                console.info(report, report.classList[0]);

                let date = report.querySelector('.listening-report-promo-date').textContent;
                let title = trans[lang].profile.reports.categories[report.classList[0].replace('listening-report-promo--', '')];

                report.innerHTML = (`
                    <div class="title">${title}</div>
                    <div class="date">${date}</div>
                `);
            });
        } else {
            // profile non-overview stuff

            // which subpage is it?
            let subpage_type = document.body.classList[1].replace('namespace--', '');
            deliver_notif(`Subpage type of ${subpage_type}`, true);

            if (subpage_type == 'user_obsessions_overview') {
                col_main = document.body.querySelector('.container.page-content');
                deliver_notif('This page is currently not finished, sorry!');
            } else if (
                subpage_type.startsWith('user_events') ||
                subpage_type.startsWith('user_playlists') ||
                subpage_type == 'user_neighbours'
            ) {
                deliver_notif('This page is currently not finished, sorry!');
            }

            let header_user_data = {
                avatar: profile_header.querySelector('.avatar img'),
                name: profile_header.querySelector('.header-title a').textContent,
                link: profile_header.querySelector('.header-title a').getAttribute('href'),
                page: document.body.querySelector('.content-top-header').textContent
            }

            if (subpage_type.startsWith('user_journal')) {
                journal_nav_btn.innerHTML = (`
                    <a class="secondary-nav-item-link secondary-nav-item-link--active" href="${root}user/${header_user_data.name}/journal">
                        Journal
                    </a>
                `);
            } else {
                journal_nav_btn.innerHTML = (`
                    <a class="secondary-nav-item-link" href="${root}user/${header_user_data.name}/journal">
                        Journal
                    </a>
                `);
            }

            let library_controls = content_top.querySelector('.library-controls');
            if (library_controls != undefined) {
                col_main.insertBefore(library_controls, col_main.firstChild);
            }

            let new_header = generic_subpage_header(
                header_user_data.avatar.getAttribute('src'),
                header_user_data.name,
                header_user_data.page
            );

            navlist_items.appendChild(journal_nav_btn);
            try { row.insertBefore(navlist, col_main); } catch(e) { col_main.insertBefore(navlist, col_main.firstElementChild) }
            col_main.insertBefore(new_header, col_main.firstElementChild);
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
        let col_sidebar = document.body.querySelector('.col-sidebar.hidden-xs');
        if (col_sidebar == null)
            col_sidebar = document.body.querySelector('.col-sidebar');

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


            let origin = '';
            let origin_elements = col_main.querySelectorAll('.metadata-column .catalogue-metadata-description');
            if (origin_elements.length > 0) {
                origin = '<div class="origin">';

                origin_elements.forEach((meta) => {
                    origin = `${origin}<div class="meta">${meta.textContent}</div>`;
                })

                origin = `${origin}</div>`;
            }


            let tags_html = '';
            let tags = col_main.querySelectorAll('.tag a');
            let tags_see_more = col_main.querySelector('.tags-view-all');

            let index = 1;
            tags.forEach((tag) => {
                if (index == 1)
                    tags_html = `${tags_html} <a href="${tag.getAttribute('href')}">${tag.textContent}</a>`;
                else
                    tags_html = `${tags_html}, <a href="${tag.getAttribute('href')}">${tag.textContent}</a>`;
                index += 1;
            });

            tags_html = `${tags_html} <a class="see-more-tags" href="${(tags_see_more != null) ? tags_see_more.getAttribute('href') : ''}">See more</a>`;


            let gallery_sidebar_photos_ems = document.body.querySelectorAll('.sidebar-image-list-item');
            let gallery_sidebar_photos = [];
            for (let i = 1; i < 5; i++) {
                console.info('gallery', i, gallery_sidebar_photos_ems);
                if (gallery_sidebar_photos_ems[i] != null) {
                    gallery_sidebar_photos.push(gallery_sidebar_photos_ems[i].querySelector('a').outerHTML);
                } else {
                    gallery_sidebar_photos.push('');
                }
            }


            let new_header = document.createElement('section');
            new_header.classList.add('profile-artist-section');
            new_header.innerHTML = (`
                <div class="artist-info">
                    <h1>${header_artist_data.name}</h1>
                    <div class="stats">
                        ${header_artist_data.plays} plays (${header_artist_data.listeners} listeners)
                    </div>
                    <div class="actions">
                        ${artist_header.querySelector('.header-new-actions > [data-toggle-button=""]').outerHTML}
                    </div>
                    ${origin}
                    <div class="wiki">
                        ${get_wiki(col_main)}
                    </div>
                    <div class="tags">
                        Popular tags: ${tags_html}
                    </div>
                    <div class="shouts">
                        Shouts: <a href="${window.location.href}/+shoutbox">Leave a shout</a>
                    </div>
                    <div class="share-bar">
                        <strong>Share this artist:</strong>
                    </div>
                </div>
                <div class="artist-image-side">
                    <div class="images">
                        <div class="top">
                            <a href="${header_artist_data.link}/+images">
                                <img src="${header_artist_data.avatar}">
                            </a>
                        </div>
                        <div class="bottom">
                            ${gallery_sidebar_photos[0]}
                            ${gallery_sidebar_photos[1]}
                            ${gallery_sidebar_photos[2]}
                            ${gallery_sidebar_photos[3]}
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

            update_bookmark_btn(col_main.querySelector('.header-new-bookmark-button'));
            col_main.querySelector('.header-new-bookmark-button').addEventListener('click', (e) => {
                update_bookmark_btn(col_main.querySelector('.header-new-bookmark-button'));
            });

            // sidebar


            // links
            let links = document.body.querySelectorAll('.external-links-section .resource-external-link');
            if (links.length > 0) {
                console.info(links.length);
                let links_html = document.createElement('div');
                links.forEach((link, index) => {
                    if (index >= (links.length / 2))
                        return;

                    link.classList = [];
                    links_html.appendChild(link);
                });

                let more_information = document.createElement('section');
                more_information.innerHTML = (`
                    <h2>More information</h2>
                    <div class="more-information-links">
                        <div class="title">
                            <h3>Links</h3>
                        </div>
                        <div class="links">
                            ${links_html.innerHTML}
                        </div>
                    </div>
                `);
                col_sidebar.insertBefore(more_information, col_sidebar.firstChild);
            }


            //
            let top_global_listeners_placeholder = document.createElement('div');
            top_global_listeners_placeholder.classList.add('top-listeners-small');
            let top_global_listeners_you_know_list = document.body.querySelectorAll('.listeners-section-item');
            console.info(top_global_listeners_you_know_list);
            let top_global_listener_index = 0;
            top_global_listeners_you_know_list.forEach((listener) => {
                if (top_global_listener_index == 4)
                    return;

                let avi = listener.querySelector('img').getAttribute('src');
                let name = listener.querySelector('.listeners-section-item-name a').textContent;
                let link = listener.querySelector('.listeners-section-track a').getAttribute('href');

                console.info(name);

                let listener_element = document.createElement('div');
                listener_element.classList.add('listener');
                listener_element.innerHTML = (`
                    <div class="image">
                        <img src="${avi}">
                    </div>
                    <div class="info">
                        <a class="user" href="${auth_link.getAttribute('href').replace(auth, name)}">${name}</a>
                        <a class="scrobbles" href="${link}">Top Listener</a>
                    </div>
                `);
                top_global_listeners_placeholder.appendChild(listener_element);

                top_global_listener_index += 1;
            });

            let top_global_listeners_you_know = document.createElement('section');
            top_global_listeners_you_know.innerHTML = (`
                <h2>Top Listeners</h2>
                ${top_global_listeners_placeholder.outerHTML}
                <div class="module-options">
                    <a href="${window.location.href}/+listeners">See more</a>
                </div>
            `);
            col_sidebar.insertBefore(top_global_listeners_you_know, col_sidebar.firstChild);

            // listeners you! know
            let listeners_placeholder = document.createElement('div');
            listeners_placeholder.classList.add('top-listeners-small');
            let listeners_you_know_list = col_main.querySelectorAll('.personal-stats-listener');
            console.info(listeners_you_know_list);
            let listener_index = 0;
            listeners_you_know_list.forEach((listener) => {
                if (listener_index == 4)
                    return;

                let avi = listener.querySelector('img').getAttribute('src');
                let name = listener.querySelector('img').getAttribute('alt');
                let link = listener.querySelector('a').getAttribute('href');

                console.info(name);

                let listener_element = document.createElement('div');
                listener_element.classList.add('listener');
                listener_element.innerHTML = (`
                    <div class="image">
                        <img src="${avi}">
                    </div>
                    <div class="info">
                        <a class="user" href="${auth_link.getAttribute('href').replace(auth, name)}">${name}</a>
                        <a class="scrobbles" href="${link}">Top Listener</a>
                    </div>
                `);
                listeners_placeholder.appendChild(listener_element);

                listener_index += 1;
            });

            let more_listeners = col_main.querySelector('.personal-stats-item--listeners .header-metadata-display a');
            if (more_listeners != null) {
                let listeners_you_know = document.createElement('section');
                listeners_you_know.innerHTML = (`
                    <h2>Listeners You Know</h2>
                    ${listeners_placeholder.outerHTML}
                    <div class="module-options">
                        <a href="${more_listeners.getAttribute('href')}">See ${more_listeners.textContent} more</a>
                    </div>
                `);
                col_sidebar.insertBefore(listeners_you_know, col_sidebar.firstChild);
            }

            let my_avi = auth_link.querySelector('img').getAttribute('src');
            let scrobble_count_element = col_main.querySelector('.personal-stats-item--scrobbles .header-metadata-display a');
            let scrobble_count = 0;
            let scrobble_link = '';
            if (scrobble_count_element != undefined) {
                scrobble_count = scrobble_count_element.textContent;
                scrobble_link = scrobble_count_element.getAttribute('href');
            }

            let your_scrobbles = document.createElement('section');
            your_scrobbles.innerHTML = (`
                <h2>Your Scrobbles</h2>
                <div class="listeners-container">
                    <div class="listener">
                        <div class="image">
                            <img src="${my_avi}">
                        </div>
                        <div class="info">
                            <a class="user" href="${auth_link}">${auth}</a>
                            <a class="scrobbles" href="${scrobble_link}">${scrobble_count} scrobbles</a>
                        </div>
                    </div>
                </div>
            `);
            col_sidebar.insertBefore(your_scrobbles, col_sidebar.firstChild);

            let listener_trend = document.body.querySelector('.listener-trend');
            if (listener_trend == null)
                return;
            listener_trend = listener_trend.outerHTML;

            let artist_stats = document.createElement('section');
            artist_stats.innerHTML = (`
                <h2>Artist Stats</h2>
                <div class="stats-container">
                    <div class="scrobbles-and-listeners">
                        <div class="scrobbles">
                            <h1>${header_artist_data.plays}</h1>
                            <p>Scrobbles</p>
                        </div>
                        <div class="listeners">
                            <h1>${header_artist_data.listeners}</h1>
                            <p>Listeners</p>
                        </div>
                    </div>
                    <div class="recent-listening-trend">
                        <p>Recent Listening Trend</p>
                        ${listener_trend}
                    </div>
                </div>
            `);
            col_sidebar.insertBefore(artist_stats, col_sidebar.firstChild);
        } else {
            // which subpage is it?
            let subpage_type = document.body.classList[2].replace('namespace--', '');
            deliver_notif(`Subpage type of ${subpage_type}`, true);

            let subpage_title = document.body.querySelector('.subpage-title');
            if (subpage_title == undefined)
                subpage_title = col_main.querySelector(':scope > h2');

            let header_user_data = {
                avatar: artist_header.querySelector('.header-new-background-image').getAttribute('content'),
                name: artist_header.querySelector('.header-new-title').textContent,
                link: artist_header.querySelector('.secondary-nav-item--overview a').getAttribute('href'),
                page: subpage_title.textContent
            }

            let new_header = generic_subpage_header(
                header_user_data.avatar.getAttribute('src'),
                header_user_data.name,
                header_user_data.page,
                'artist'
            );

            row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, col_main.firstChild);
            artist_header.style.setProperty('display', 'none');

            if (subpage_type.includes('wiki')) {
                generic_wiki_patch(col_main, col_sidebar);

                return;
            }

            document.body.querySelector('.container.page-content').classList.add('subpage');
        }
    }

    function update_bookmark_btn(button) {
        let action = button.getAttribute('data-analytics-action');
        console.info('action', action);
        if (action.startsWith('Bookmark')) {
            button.innerHTML = '<strong>Add to my Library</strong>';
        } else {
            button.innerHTML = '<strong>Added to my Library</strong>'
        }
    }
    function update_love_btn(button) {
        let action = button.getAttribute('data-analytics-action');
        console.info('action', action);
        if (action.startsWith('Love')) {
            button.innerHTML = '<strong>Love this track</strong>';
        } else {
            button.innerHTML = '<strong>You love this track</strong>'
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
        let col_sidebar = document.body.querySelector('.col-sidebar.hidden-xs');
        if (col_sidebar == null)
            col_sidebar = document.body.querySelector('.col-sidebar');

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
                    <li class="navlist-item secondary-nav-item secondary-nav-item--shoutbox">
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
                add_artwork = document.body.querySelector('.album-overview-cover-art a').getAttribute('href');
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

            if (settings.legacy_cover_art) {
                let url_split = avatar.split('/');

                if (legacy_cover_art.hasOwnProperty(url_split[6])) {
                    header_album_data.avatar = header_album_data.avatar.replace(url_split[6], legacy_cover_art[url_split[6]]);
                }
            }


            let tags_html = '';
            let tags = col_main.querySelectorAll('.tag a');
            let tags_see_more = col_main.querySelector('.tags-view-all');

            let index = 1;
            tags.forEach((tag) => {
                if (index == 1)
                    tags_html = `${tags_html} <a href="${tag.getAttribute('href')}">${tag.textContent}</a>`;
                else
                    tags_html = `${tags_html}, <a href="${tag.getAttribute('href')}">${tag.textContent}</a>`;
                index += 1;
            });

            tags_html = `${tags_html} <a class="see-more-tags" href="${(tags_see_more != null) ? tags_see_more.getAttribute('href') : ''}">See more</a>`;


            let new_header = document.createElement('section');
            new_header.classList.add('profile-album-section');
            new_header.innerHTML = (`
                <div class="album-info">
                    <h1>${header_album_data.name} by <a href="${header_album_data.artist_link}">${header_album_data.artist}</a></h1>
                    <div class="stats">
                        ${header_album_data.plays} plays (${header_album_data.listeners} listeners)
                    </div>
                    <div class="actions">
                        ${album_header.querySelector('.header-new-actions > [data-toggle-button=""]').outerHTML}
                    </div>
                    <div class="tags">
                        Popular tags: ${tags_html}
                    </div>
                    <div class="shouts">
                        Shouts: <a href="${window.location.href}/+shoutbox">Leave a shout</a>
                    </div>
                    <div class="share-bar">
                        <strong>Share this album:</strong>
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

            update_bookmark_btn(col_main.querySelector('.header-new-bookmark-button'));
            col_main.querySelector('.header-new-bookmark-button').addEventListener('click', (e) => {
                update_bookmark_btn(col_main.querySelector('.header-new-bookmark-button'));
            });


            // about this album
            let release_year = 0;
            let release_date = 'never :(';
            let track_count = 'No tracks';
            let album_length = '0:00'

            let meta = col_main.querySelectorAll('.metadata-column .catalogue-metadata-description');
            meta.forEach((meta_item, index) => {
                let meta_text = meta_item.textContent;

                if (index == 0) {
                    // track count & length
                    let split = meta_text.split(',');

                    track_count = split[0];
                    if (split.length > 1)
                        album_length = split[1].trim();
                } else {
                    // release date
                    release_date = meta_text;
                    release_year = new Date(release_date).getFullYear();
                }
            });

            let about_this_album = document.createElement('section');
            about_this_album.classList.add('about-this-album');
            about_this_album.innerHTML = (`
                <h2><a href="${window.location.href}/+wiki">About this album</a></h2>
                <div class="label-container">
                    <div class="image">
                        <img src="https://lastfm.freetls.fastly.net/i/u/avatar300s/2a96cbd8b46e442fc41c2b86b821562f.jpg">
                    </div>
                    <div class="info">
                        <div class="label-release">
                            <a>No label</a> (${release_year})
                        </div>
                        <p>Released: ${release_date}</p>
                        <p>${track_count}</p>
                        <p>(${album_length})</p>
                    </div>
                </div>
                <div class="wiki">
                    ${get_wiki(col_main)}
                </div>
            `);
            try {
                document.getElementById('tracklist').after(about_this_album);
            } catch(e) {
                console.info('bwaa - no tracklist, will append elsewhere');

                let masonry_left = document.querySelector('.masonry-left-bottom');
                masonry_left.insertBefore(about_this_album, masonry_left.firstElementChild);
            }




            // sidebar
            let my_avi = auth_link.querySelector('img').getAttribute('src');
            let scrobble_count_element = col_main.querySelector('.personal-stats-item--scrobbles .header-metadata-display a');
            let scrobble_count = 0;
            let scrobble_link = '';
            if (scrobble_count_element != undefined) {
                scrobble_count = scrobble_count_element.textContent;
                scrobble_link = scrobble_count_element.getAttribute('href');
            }

            let your_scrobbles = document.createElement('section');
            your_scrobbles.innerHTML = (`
                <h2>Your Scrobbles</h2>
                <div class="listeners-container">
                    <div class="listener">
                        <div class="image">
                            <img src="${my_avi}">
                        </div>
                        <div class="info">
                            <a class="user" href="${auth_link}">${auth}</a>
                            <a class="scrobbles" href="${scrobble_link}">${scrobble_count} scrobbles</a>
                        </div>
                    </div>
                </div>
            `);
            col_sidebar.insertBefore(your_scrobbles, col_sidebar.firstChild);

            let listener_trend = document.body.querySelector('.listener-trend');
            if (listener_trend == null)
                return;
            listener_trend = listener_trend.outerHTML;

            let album_stats = document.createElement('section');
            album_stats.innerHTML = (`
                <h2>Album Stats</h2>
                <div class="stats-container">
                    <div class="scrobbles-and-listeners">
                        <div class="scrobbles">
                            <h1>${header_album_data.plays}</h1>
                            <p>Scrobbles</p>
                        </div>
                        <div class="listeners">
                            <h1>${header_album_data.listeners}</h1>
                            <p>Listeners</p>
                        </div>
                    </div>
                    <div class="recent-listening-trend">
                        <p>Recent Listening Trend</p>
                        ${listener_trend}
                    </div>
                </div>
            `);
            col_sidebar.insertBefore(album_stats, col_sidebar.firstChild);;
        } else {
            // which subpage is it?
            let subpage_type = document.body.classList[2].replace('namespace--', '');
            deliver_notif(`Subpage type of ${subpage_type}`, true);

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

            let new_header = generic_subpage_header(
                header_user_data.avatar.getAttribute('src'),
                header_user_data.name,
                header_user_data.page,
                header_user_data.artist,
                'album'
            );

            row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, col_main.firstChild);
            album_header.style.setProperty('display', 'none');

            if (subpage_type.includes('wiki')) {
                generic_wiki_patch(col_main, col_sidebar);

                return;
            }

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
        let col_sidebar = document.body.querySelector('.col-sidebar');

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
                    <li class="navlist-item secondary-nav-item secondary-nav-item--shoutbox">
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


            let track_video_element = document.body.querySelector('.video-preview');
            let track_video = '';
            if (track_video_element != null)
                track_video = track_video_element.outerHTML;


            let tags_html = '';
            let tags = col_main.querySelectorAll('.tag a');
            let tags_see_more = col_main.querySelector('.tags-view-all');

            let index = 1;
            tags.forEach((tag) => {
                if (index == 1)
                    tags_html = `${tags_html} <a href="${tag.getAttribute('href')}">${tag.textContent}</a>`;
                else
                    tags_html = `${tags_html}, <a href="${tag.getAttribute('href')}">${tag.textContent}</a>`;
                index += 1;
            });

            tags_html = `${tags_html} <a class="see-more-tags" href="${(tags_see_more != null) ? tags_see_more.getAttribute('href') : ''}">See more</a>`;


            let play_on_youtube = document.body.querySelector('.play-this-track-playlink--youtube');
            let play_on_spotify = document.body.querySelector('.play-this-track-playlink--spotify');
            let play_on_apple_music = document.body.querySelector('.play-this-track-playlink--itunes');

            let header_actions = track_header.querySelectorAll('.header-new-actions > [data-toggle-button=""]');

            let first_meta = col_main.querySelector('.catalogue-metadata-description');
            console.info(first_meta, first_meta.querySelector('a'));
            let track_length = '';
            if (first_meta.querySelector('a') == null)
                track_length = ` (${first_meta.textContent.trim()})`;

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
                        <h1>${header_track_data.name} by <a href="${header_track_data.artist_link}">${header_track_data.artist}</a>${track_length}</h1>
                        <p>On ${(header_track_data.album_amount > 0) ? header_track_data.album_amount : 'no'} albums <strong><a href="${header_track_data.link}/+albums">see all</a></strong></p>
                        <div class="actions">
                            ${header_actions[0].outerHTML}
                            ${header_actions[1].outerHTML}
                        </div>
                    </div>
                </div>
                <div class="tags">
                    Popular tags: ${tags_html}
                </div>
                <div class="shouts">
                    Shouts: <a href="${window.location.href}/+shoutbox">Leave a shout</a>
                </div>
                <div class="share-bar">
                    <strong>Share this artist:</strong>
                </div>
                <div class="playback">
                    <div class="playback-item">
                        ${(!play_on_youtube.classList.contains('play-this-track-playlink--disabled'))
                        ? `<a class="provider provider--youtube" href="${play_on_youtube.getAttribute('href')}" target="_blank">
                            Play on <strong>YouTube</strong>
                        </a>`
                        : `<a class="provider provider--youtube" href="${play_on_youtube.getAttribute('href')}" data-open-modal="${play_on_youtube.getAttribute('data-open-modal')}">
                            Add a <strong>YouTube</strong> link
                        </a>`}
                        <div class="note">
                            Yes, it <a>scrobbles!</a> <a>Learn more</a>
                        </div>
                    </div>
                    <div class="playback-item">
                        ${(!play_on_spotify.classList.contains('play-this-track-playlink--disabled'))
                        ? `<a class="provider provider--spotify" href="${play_on_spotify.getAttribute('href')}" target="_blank">
                            Play on <strong>Spotify</strong>
                        </a>`
                        : `<a class="provider provider--spotify" href="${play_on_spotify.getAttribute('href')}" data-open-modal="${play_on_spotify.getAttribute('data-open-modal')}">
                            Add a <strong>Spotify</strong> link
                        </a>`}
                        <div class="note">
                            Yes, it <a>scrobbles!</a> <a>Learn more</a>
                        </div>
                    </div>
                    <div class="playback-item">
                        ${(!play_on_apple_music.classList.contains('play-this-track-playlink--disabled'))
                        ? `<a class="provider provider--apple-music" href="${play_on_apple_music.getAttribute('href')}" target="_blank">
                            Play on <strong>Apple Music</strong>
                        </a>`
                        : `<a class="provider provider--apple-music" href="${play_on_apple_music.getAttribute('href')}" data-open-modal="${play_on_apple_music.getAttribute('data-open-modal')}">
                            Add an <strong>Apple Music</strong> link
                        </a>`}
                        <div class="note">
                            Yes, it <a>scrobbles!</a> <a>Learn more</a>
                        </div>
                    </div>
                </div>
                ${(track_video != ''
                    ? `<div class="playback-video">${track_video}</div>`
                    : ''
                )}
            `);

            row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, col_main.firstChild);
            track_header.style.setProperty('display', 'none');

            update_bookmark_btn(col_main.querySelector('.header-new-bookmark-button'));
            col_main.querySelector('.header-new-bookmark-button').addEventListener('click', (e) => {
                update_bookmark_btn(col_main.querySelector('.header-new-bookmark-button'));
            });
            update_love_btn(col_main.querySelector('.header-new-love-button'));
            col_main.querySelector('.header-new-love-button').addEventListener('click', (e) => {
                update_love_btn(col_main.querySelector('.header-new-love-button'));
            });


            // about this track
            let about_this_track = document.createElement('section');
            about_this_track.classList.add('about-this-track');
            about_this_track.innerHTML = (`
                <h2><a href="${window.location.href}/+wiki">About this track</a></h2>
                <div class="wiki">
                    ${get_wiki(col_main)}
                </div>
            `);
            new_header.after(about_this_track);

            // sidebar
            let my_avi = auth_link.querySelector('img').getAttribute('src');
            let scrobble_count_element = col_main.querySelector('.personal-stats-item--scrobbles .header-metadata-display a');
            let scrobble_count = 0;
            let scrobble_link = '';
            if (scrobble_count_element != undefined) {
                scrobble_count = scrobble_count_element.textContent;
                scrobble_link = scrobble_count_element.getAttribute('href');
            }

            let your_scrobbles = document.createElement('section');
            your_scrobbles.innerHTML = (`
                <h2>Your Scrobbles</h2>
                <div class="listeners-container">
                    <div class="listener">
                        <div class="image">
                            <img src="${my_avi}">
                        </div>
                        <div class="info">
                            <a class="user" href="${auth_link}">${auth}</a>
                            <a class="scrobbles" href="${scrobble_link}">${scrobble_count} scrobbles</a>
                        </div>
                    </div>
                </div>
            `);
            col_sidebar.insertBefore(your_scrobbles, col_sidebar.firstChild);

            let listener_trend = document.body.querySelector('.listener-trend');
            if (listener_trend == null)
                return;
            listener_trend = listener_trend.outerHTML;

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
            // which subpage is it?
            let subpage_type = document.body.classList[2].replace('namespace--', '');
            deliver_notif(`Subpage type of ${subpage_type}`, true);

            let subpage_title = document.body.querySelector('.subpage-title');
            if (subpage_title == undefined)
                subpage_title = col_main.querySelector(':scope > h2');

            let pre_fetch_avatar = track_header.querySelector('.header-new-background-image');
            if (pre_fetch_avatar == null)
                pre_fetch_avatar = '';
            else
                pre_fetch_avatar = pre_fetch_avatar.getAttribute('content')

            let header_track_data = {
                avatar: pre_fetch_avatar,
                name: track_header.querySelector('.header-new-title').textContent,
                artist: track_header.querySelector('.header-new-crumb span').textContent,
                artist_link: track_header.querySelector('.header-new-crumb').getAttribute('href'),
                link: track_header.querySelector('.secondary-nav-item--overview a').getAttribute('href'),
                page: subpage_title.textContent
            }

            let new_header = generic_subpage_header(
                header_track_data.avatar,
                header_track_data.name,
                header_track_data.page,
                header_track_data.artist,
                'track'
            );

            row.insertBefore(navlist, col_main);
            col_main.insertBefore(new_header, col_main.firstChild);
            track_header.style.setProperty('display', 'none');

            if (subpage_type.includes('wiki')) {
                generic_wiki_patch(col_main, col_sidebar);

                return;
            }

            document.body.querySelector('.container.page-content').classList.add('subpage');
        }
    }


    /**
     * subpage header creator for profiles, artists, albums, and tracks
     * @param {string} avatar avatar url
     * @param {string} user_name name used for small text for profile, artist, track, or album name
     * @param {string} header_title main header text
     * @param {string} additional_user_reference artist name linked to track/album (not required)
     * @param {string} link_type type of header, controls how top link is created (defaults to user)
     * @returns subpage header
     */
    function generic_subpage_header(avatar, user_name, header_title, additional_user_reference='', link_type='user') {
        // determines top text link
        let link_field = `<a href="${root}user/${sanitise(user_name)}">${user_name}</a>`;

        // not a user
        if (link_type == 'artist')
            link_field = `<a href="${root}music/${sanitise(user_name)}">${sanitise(user_name)}</a>`;
        else if (link_type == 'album')
            link_field = `<a href="${root}music/${sanitise(additional_user_reference)}/${sanitise(user_name)}">${user_name}</a>`;
        else if (link_type == 'track')
            link_field = `<a href="${root}music/${sanitise(additional_user_reference)}/_/${sanitise(user_name)}">${user_name}</a>`;

        let new_header = document.createElement('section');
        new_header.classList.add('profile-header-subpage-section');
        new_header.innerHTML = (`
            <div class="badge-avatar">
                <img src="${avatar}" alt="${user_name}">
            </div>
            <div class="badge-info">
                ${link_field}
                <h1>${header_title}</h1>
            </div>
        `);

        return new_header;
    }


    function sanitise(text) {
        return text
        .replaceAll(' ', '+')
        .replaceAll('?', '%3F');
    }


    /**
     * generic wiki patch to create sidebar factbox
     * @param {element} col_main col_main element
     * @param {element} col_sidebar col_sidebar element
     */
    function generic_wiki_patch(col_main, col_sidebar) {
        let factbox = col_main.querySelector('.factbox');

        col_sidebar.innerHTML = '';
        if (factbox == null) {
            factbox = document.createElement('div');
            factbox.classList.add('factbox');
            factbox.innerHTML = (`
                <div class="no-facts">This wiki has no facts listed :(</div>
            `);
        }

        let factbox_header = document.createElement('h4');
        factbox_header.classList.add('factbox-header');
        factbox_header.innerHTML = 'Factbox (<a href="#" title="What’s This?">?</a>)';
        factbox.insertBefore(factbox_header, factbox.firstElementChild);

        let wiki_author_element = col_main.querySelector('.wiki-author');

        // ensures splitting still works fine, refer to below
        wiki_author_element.innerHTML = wiki_author_element.innerHTML.replace('Deleted user', '<span>deleted user</span>');

        let wiki_author = wiki_author_element.querySelector(':scope > a');
        // wiki version is the text before the author element, which we ensure exists
        // with the "splitting" line above even if user is deleted
        let wiki_version = wiki_author_element.firstChild.textContent.trim();
        // wiki date is all the text after the author element
        let wiki_date = wiki_author_element.childNodes[2].textContent.trim();

        let wiki_history_link = wiki_author_element.querySelector('.wiki-history-link--desktop a');

        // wiki discussion pages no longer exist, direct user to shoutbox
        // by grabbing the tab's link
        let wiki_discuss_link = document.querySelector('.secondary-nav-item--shoutbox a');

        // compile all that information into one
        let factbox_version = document.createElement('div');
        factbox_version.classList.add('factbox-version-container');
        factbox_version.innerHTML = (`
            <div class="factbox-version">
                You’re viewing <span class="version">${wiki_version}</span> ${(wiki_author != null) ? wiki_author.outerHTML : 'a deleted user'}. ${(wiki_history_link != null) ? `<a href="${wiki_history_link.getAttribute('href')}">View older versions</a>, or <a href="${wiki_discuss_link.getAttribute('href')}">discuss</a> this wiki.` : ''}
            </div>
            <div class="factbox-author">
                Last edited ${wiki_date}.
            </div>
        `);

        factbox.appendChild(factbox_version);

        // wiki edit
        let wiki_edit_link = col_main.querySelector('.qa-wiki-edit');
        if (wiki_edit_link != null) {
            let wiki_edit_more_link = document.createElement('div');
            wiki_edit_more_link.classList.add('more-link', 'align-right');
            wiki_edit_more_link.innerHTML = (`
                <a href="${wiki_edit_link.getAttribute('href')}">Edit this wiki’s contents</a>
            `);

            factbox.appendChild(wiki_edit_more_link);
        }

        // move any alerts (eg. locked wiki, old version notice) to the sidebar
        // below all factbox elements
        let alerts = col_main.querySelectorAll('.alert');
        alerts.forEach((alert) => {
            factbox.appendChild(alert);
        });

        col_sidebar.appendChild(factbox);
    }


    /**
     * retrieves longest wiki content on page
     * @param {element} col_main col_main element
     * @returns retrieved wiki or cta if missing
     */
    function get_wiki(col_main) {
        let wiki = col_main.querySelector('.wiki-block.visible-lg');
        if (wiki == null)
            wiki = col_main.querySelector('.wiki-block-cta');

        return wiki.outerHTML;
    }


    function bwaa_shouts() {
        let shouts = document.body.querySelectorAll('.shout:not([data-bwaa])');
        shouts.forEach((shout) => {
            shout.setAttribute('data-bwaa', 'true');

            let shout_name = shout.querySelector('.shout-user');
            if (shout_name == null)
                return;

            if (settings.shouts_2010)
                shout_name.innerHTML = `${shout_name.innerHTML} wrote:`;

            let shout_actions = shout.querySelector('.shout-actions');

            if (!settings.shouts_no_votes) {
                let shout_reply = shout_actions.querySelector('.shout-action');
                shout_reply.innerHTML = `${shout_reply.innerHTML} | `;

                let vote_buttons = shout_actions.querySelectorAll('.vote-button');
                vote_buttons.forEach((vote_button) => {
                    vote_button.textContent = vote_button.textContent;
                });
            }

            if (settings.shouts_2010)
                shout_actions.innerHTML = `<a href="${root}user/${shout_name.textContent}">View Profile</a> | ${shout_actions.innerHTML}`;
        });

        if (!settings.varied_avatar_shapes)
            return;

        // avatars
        let shout_avatars = document.body.querySelectorAll('.shout-user-avatar img:not([data-bwaa])');
        shout_avatars.forEach((shout_avatar) => {
            shout_avatar.setAttribute('data-bwaa', 'true');

            // this allows shout avatars to be varied in shape
            let src = shout_avatar.getAttribute('src');
            src = src.replace('/i/u/avatar70s/', '/i/u/550x0/');
            shout_avatar.setAttribute('src', src);
        });
    }


    function bwaa_friends() {
        if (!settings.varied_avatar_shapes)
            return;

        // avatars
        let friend_avatars = document.body.querySelectorAll('.user-list-avatar img:not([data-bwaa])');
        friend_avatars.forEach((friend_avatar) => {
            if (friend_avatar.hasAttribute('data-bwaa'))
                return;
            friend_avatar.setAttribute('data-bwaa', 'true');

            // this allows friend avatars to be varied in shape
            let src = friend_avatar.getAttribute('src');
            src = src.replace('/i/u/avatar70s/', '/i/u/550x0/');
            friend_avatar.setAttribute('src', src);
        });
    }




    function bwaa_artworks() {
        let gallery_sidebar = document.body.querySelector('.gallery-sidebar');

        if (gallery_sidebar == null)
            return;

        let artist_subpage_text = document.getElementById('artist-subpage-text');
        artist_subpage_text.textContent = document.querySelector('.subpage-title').textContent;

        /*if (gallery_sidebar.hasAttribute('data-bwaa'))
            return;
        gallery_sidebar.setAttribute('data-bwaa', 'true');*/

        let gallery_image_votes = gallery_sidebar.querySelectorAll('.gallery-image-votes');
        gallery_image_votes.forEach((button) => {
            if (button.hasAttribute('data-bwaa'))
                return;
            button.setAttribute('data-bwaa', 'true');

            let vote_text = document.createElement('span');
            vote_text.classList.add('vote-text');
            vote_text.innerHTML = '<span class="to-vote">Vote</span><span class="voted">Voted</span>';
            button.after(vote_text);
        });

        let gallery_image_favs = gallery_sidebar.querySelectorAll('.gallery-image-preferred-states');
        gallery_image_favs.forEach((button) => {
            if (button.hasAttribute('data-bwaa'))
                return;
            button.setAttribute('data-bwaa', 'true');

            let vote_text = document.createElement('span');
            vote_text.classList.add('vote-text');
            vote_text.innerHTML = '<span class="to-vote">Star</span><span class="voted">Starred</span>';
            button.after(vote_text);
        });

        // bookmarks from bleh
        let artist_header = document.querySelector('.header-new--artist');
        if (artist_header == null)
            return;

        let artist_name = document.body.querySelector('.header-new-title').textContent;
        let focused_image_id = gallery_sidebar.querySelector('div[data-image-url]').getAttribute('data-image-url').split('/')[4];

        let bookmarked_images = JSON.parse(localStorage.getItem('bleh_bookmarked_images')) || {};
        let image_is_bookmarked = false;
        if (bookmarked_images.hasOwnProperty(artist_name)) {
            if (bookmarked_images[artist_name].includes(focused_image_id)) {
                image_is_bookmarked = true;
                console.info('bleh - focused image is bookmarked');
            }
        }

        let gallery_interactions = gallery_sidebar.querySelector('.gallery-image-buttons');
        if (gallery_interactions == undefined)
            return;

        if (gallery_interactions.hasAttribute('data-bwaa'))
            return;
        gallery_interactions.setAttribute('data-bwaa', 'true');

        // append a bookmark button
        let gallery_bookmark_button = document.createElement('div');
        gallery_bookmark_button.classList.add('gallery-image-bookmark-button');
        gallery_bookmark_button.innerHTML = (`
            <button class="gallery-image-bookmark-button-button" data-bleh--image-is-bookmarked="${image_is_bookmarked}" onclick="_update_image_bookmark(this, '${artist_name}', '${focused_image_id}')">
                <span class="bookmark-votes">

                </span>
                <span class="vote-text" id="bookmark-vote-text">
                    ${(image_is_bookmarked)
                    ? 'Saved'
                    : 'Save'}
                </span>
            </button>
        `);
        gallery_interactions.appendChild(gallery_bookmark_button);
    }

    unsafeWindow._update_image_bookmark = function(button, artist, id) {
        update_image_bookmark(button, artist, id);
    }
    function update_image_bookmark(button, artist, id) {
        let bookmarked_images = JSON.parse(localStorage.getItem('bleh_bookmarked_images')) || {};
        let is_bookmarked = (button.getAttribute('data-bleh--image-is-bookmarked') === 'true');

        document.getElementById('bookmark-vote-text').textContent = (is_bookmarked)
        ? 'Save'
        : 'Saved';

        if (!bookmarked_images.hasOwnProperty(artist))
            bookmarked_images[artist] = [];

        if (is_bookmarked) {
            // remove from bookmarks

            button.setAttribute('data-bleh--image-is-bookmarked', 'false');

            let new_artist_bookmarks = [];
            for (let image in bookmarked_images[artist]) {
                if (bookmarked_images[artist][image] != id) {
                    new_artist_bookmarks.push(bookmarked_images[artist][image]);
                }
            }
            bookmarked_images[artist] = new_artist_bookmarks;

            deliver_notif(`Removed from ${artist}’s saved images`);
            console.info('bleh - image', id, 'from artist', artist, 'has been removed from bookmarks');
        } else {
            // add to bookmarks

            button.setAttribute('data-bleh--image-is-bookmarked', 'true');
            bookmarked_images[artist].push(id);
            deliver_notif(`Added to ${artist}’s saved images`);
            console.info('bleh - image', id, 'from artist', artist, 'has been added to bookmarks');
        }

        localStorage.setItem('bleh_bookmarked_images', JSON.stringify(bookmarked_images));
    }




    // theme
    unsafeWindow.toggle_theme = function() {
        let current_theme = settings.theme;

        if (current_theme == 'paint_it_black')
            current_theme = 'simply_red';
        else if (current_theme == 'simply_red')
            current_theme = 'paint_it_black';

        document.getElementById('theme-value').textContent = trans[lang].settings.themes[current_theme].name;

        // save value
        settings.theme = current_theme;
        document.documentElement.setAttribute(`data-bwaa--theme`, `${current_theme}`);

        // save to settings
        localStorage.setItem('bwaa', JSON.stringify(settings));
    }


    // create blank settings
    function create_settings_template() {
        localStorage.setItem('bwaa', JSON.stringify(settings_defaults));
        return settings_defaults;
    }

    // load settings
    function load_settings() {
        settings = JSON.parse(localStorage.getItem('bwaa')) || create_settings_template();

        // missing? set to default value
        for (let setting in settings_defaults)
            if (settings[setting] == undefined)
                settings[setting] = settings_defaults[setting];

        // save setting into body
        for (let setting in settings) {
            document.body.style.setProperty(`--${setting}`, settings[setting]);
            document.documentElement.setAttribute(`data-bwaa--${setting}`, `${settings[setting]}`);
        }

        // save to settings
        localStorage.setItem('bwaa', JSON.stringify(settings));
    }




    function bwaa_obsessions() {
        let obsession_container = document.querySelector('.obsession-container:not([data-bwaa="true"])');

        if (obsession_container == null)
            return;

        obsession_container.setAttribute('data-bwaa', 'true');

        let page_content = obsession_container.querySelector('.page-content');
        page_content.classList.add('subpage');

        let row = document.createElement('div');
        row.classList.add('row');

        let col_main = document.createElement('div');
        col_main.classList.add('col-main');

        let obsession_wrap = page_content.querySelector('.obsession-details-wrap');


        let obsession_author = obsession_wrap.querySelector('.obsession-details-intro a').textContent;

        let new_header = generic_subpage_header(
            obsession_wrap.querySelector('.obsession-details-intro-avatar-wrap img').getAttribute('src'),
            obsession_author,
            `Music <a href="${root}user/${obsession_author}/obsessions">Obsession</a>`
        );


        let next = page_content.querySelector('.obsession-pagination-next a');
        let previous = page_content.querySelector('.obsession-pagination-previous a');

        let navlist_switcher = document.createElement('nav');
        navlist_switcher.classList.add('navlist', 'secondary-nav', 'navlist--more');
        navlist_switcher.innerHTML = (`
            <ul class="navlist-items">
                <li class="navlist-item secondary-nav-item secondary-nav-item--next-obsession">
                    ${(next != null) ? `
                        <a class="secondary-nav-item-link" href="${next.getAttribute('href')}">
                            « Forward
                        </a>
                    ` : `
                        <a class="secondary-nav-item-link" disabled>
                            « Forward
                        </a>
                    `}
                </li>
                <li class="navlist-item secondary-nav-item secondary-nav-item--previous-obsession">
                    ${(previous != null) ? `
                        <a class="secondary-nav-item-link" href="${previous.getAttribute('href')}">
                            Previous »
                        </a>
                    ` : `
                        <a class="secondary-nav-item-link" disabled>
                            Previous »
                        </a>
                    `}
                </li>
            </ul>
        `);
        row.appendChild(navlist_switcher);
        col_main.appendChild(new_header);
        col_main.appendChild(obsession_wrap);

        row.appendChild(col_main);

        page_content.appendChild(row);

        let adaptive_skin = document.querySelector('.adaptive-skin-container');
        let content_top = adaptive_skin.querySelector('.content-top');
        adaptive_skin.removeChild(content_top);
    }




    function bwaa_lastfm_settings() {
        console.info('bwaa - last.fm settings host');

        let content_forms = document.querySelectorAll('.content-form:not([data-bwaa="true"])');
        console.info('bwaa - last.fm settings host found content-forms:', content_forms);
        content_forms.forEach((content_form) => {
            content_form.classList.remove('content-form');
            content_form.classList.add('settings-form');

            content_form.setAttribute('data-bwaa', 'true');
        });

        if (!document.body.classList[2].startsWith('namespace--settings'))
            return;

        let page_content = document.querySelector('.page-content');

        if (page_content.hasAttribute('data-bwaa'))
            return;
        page_content.setAttribute('data-bwaa', 'true');
        page_content.classList.add('lastfm-settings', 'subpage');

        let row = page_content.querySelector(':scope > .row');


        let navlist_switcher = document.createElement('nav');
        navlist_switcher.classList.add('navlist', 'secondary-nav', 'navlist--more');
        navlist_switcher.innerHTML = (`
            <ul class="navlist-items">
                <li class="navlist-item secondary-nav-item secondary-nav-item--lastfm-settings">
                    <a class="secondary-nav-item-link secondary-nav-item-link--active" href="${root}settings">
                        Last.fm
                    </a>
                </li>
                <li class="navlist-item secondary-nav-item secondary-nav-item--bwaa-settings">
                    <a class="secondary-nav-item-link" href="${root}bwaa">
                        bwaa
                    </a>
                </li>
            </ul>
        `);
        row.insertBefore(navlist_switcher, row.firstElementChild);


        let col_main = row.querySelector('.col-main');

        let adaptive_skin = document.querySelector('.adaptive-skin-container');
        let content_top = adaptive_skin.querySelector('.content-top');

        let navlist = content_top.querySelector('.navlist');
        col_main.insertBefore(navlist, col_main.firstElementChild);

        adaptive_skin.removeChild(content_top);

        let my_avi = auth_link.querySelector('img').getAttribute('src');
        let new_header = generic_subpage_header(
            my_avi,
            auth,
            'Your Account Settings'
        );
        col_main.insertBefore(new_header, col_main.firstElementChild);
    }




    function bwaa_settings() {
        console.info('bwaa - loading custom settings');
        let adaptive_skin = document.querySelector('.adaptive-skin-container:not([data-bwaa="true"])');

        if (adaptive_skin == null)
            return;
        adaptive_skin.setAttribute('data-bwaa', 'true');

        adaptive_skin.innerHTML = '';
        document.title = 'configure your bwaa | Last.fm';

        let my_avi = auth_link.querySelector('img').getAttribute('src');

        adaptive_skin.innerHTML = (`
            <div class="container page-content bwaa-settings lastfm-settings subpage">
                <div class="row">
                    <nav class="navlist secondary-nav navlist--more">
                        <ul class="navlist-items">
                            <li class="navlist-item secondary-nav-item secondary-nav-item--lastfm-settings">
                                <a class="secondary-nav-item-link" href="${root}settings">
                                    Last.fm
                                </a>
                            </li>
                            <li class="navlist-item secondary-nav-item secondary-nav-item--bwaa-settings">
                                <a class="secondary-nav-item-link secondary-nav-item-link--active" href="${root}bwaa">
                                    bwaa
                                </a>
                            </li>
                        </ul>
                    </nav>
                    <div class="col-main settings-form">
                        <section class="profile-header-subpage-section">
                            <div class="badge-avatar">
                                <img src="${my_avi}" alt="${auth}">
                            </div>
                            <div class="badge-info">
                                <a href="${root}user/${auth}">${auth}</a>
                                <h1>Configure bwaa Settings</h1>
                            </div>
                        </section>
                        <nav class="navlist secondary-nav navlist--more">
                            <ul class="navlist-items">
                                <li class="navlist-item secondary-nav-item">
                                    <a class="secondary-nav-item-link secondary-nav-item-link--active bwaa-settings-tab" data-bwaa-tab="home" onclick="_change_settings_page('home')">
                                        Home
                                    </a>
                                </li>
                                <li class="navlist-item secondary-nav-item">
                                    <a class="secondary-nav-item-link bwaa-settings-tab" data-bwaa-tab="corrections" onclick="_change_settings_page('corrections')">
                                        Corrections
                                    </a>
                                </li>
                                <li class="navlist-item secondary-nav-item">
                                    <a class="secondary-nav-item-link bwaa-settings-tab" data-bwaa-tab="page2" onclick="_change_settings_page('page2')">
                                        Page 2
                                    </a>
                                </li>
                            </ul>
                        </nav>
                        <div id="bleh-settings-inject"></div>
                    </div>
                </div>
            </div>
        `);


        change_settings_page('home');
    }

    unsafeWindow._change_settings_page = function(page) {
        change_settings_page(page);
    }
    function change_settings_page(page) {
        let tabs = document.querySelectorAll('.bwaa-settings-tab');
        tabs.forEach((tab) => {
            if (tab.getAttribute('data-bwaa-tab') != page) {
                tab.classList.remove('secondary-nav-item-link--active');
            } else {
                tab.classList.add('secondary-nav-item-link--active');
            }
        });

        render_settings_page(page, document.getElementById('bleh-settings-inject'));
    }

    function render_settings_page(page, injector) {
        if (page == 'home') {
            injector.innerHTML = (`
                <section id="welcome" class="form-section settings-form">
                    <h2 class="form-header">Welcome to bwaa!</h2>
                    <p>You currently have version <strong>${version.build}.${version.sku}</strong> of bwaa installed. Think you’re behind?</p>
                    <div class="more-link align-left space-self">
                        <a href="https://github.com/katelyynn/bwaa/raw/uwu/fm/bwaa.user.js" target="_blank">Check for updates</a>
                    </div>
                    <fieldset>
                        <legend>Navigation</legend>
                        <div class="form-group">
                            <div class="checkbox">
                                <label for="setting--sticky_nav">
                                    <input id="setting--sticky_nav" type="checkbox" onchange="_notify_checkbox_change(this)">
                                    Make the navigation bar persistent on scroll
                                </label>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>Accuracy</legend>
                        <div class="form-group">
                            <div class="checkbox">
                                <label for="setting--legacy_cover_art">
                                    <input id="setting--legacy_cover_art" type="checkbox" onchange="_notify_checkbox_change(this)">
                                    Override album cover art for 2012-era images
                                </label>
                                <div class="alert">
                                    All personal preference, check out <a href="${root}music/Nirvana" target="_blank">Nirvana</a>’s <a href="${root}music/Nirvana/Nevermind" target="_blank">Nevermind</a> for an example.
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>Social</legend>
                        <div class="form-group">
                            <div class="checkbox">
                                <label for="setting--varied_avatar_shapes">
                                    <input id="setting--varied_avatar_shapes" type="checkbox" onchange="_notify_checkbox_change(this)">
                                    Allow varied avatar shapes
                                </label>
                                <div class="alert">
                                    Due to limitations post-redesign, varied avatar shapes are only possible by requesting high-resolution avatars from Last.fm. In cases where a user’s avatar is too large, it will fail to display.
                                </div>
                            </div>
                        </div>
                        <div class="sep"></div>
                        <div class="form-group">
                            <div class="checkbox">
                                <label for="setting--shouts_2010">
                                    <input id="setting--shouts_2010" type="checkbox" onchange="_notify_checkbox_change(this)">
                                    Prefer 2010-era shout design
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="checkbox">
                                <label for="setting--shouts_no_votes">
                                    <input id="setting--shouts_no_votes" type="checkbox" onchange="_notify_checkbox_change(this)">
                                    Do not display shout votes
                                </label>
                            </div>
                        </div>
                        <div class="sep"></div>
                        <div class="form-group">
                            <div class="checkbox">
                                <label for="setting--no_notifs">
                                    <input id="setting--no_notifs" type="checkbox" onchange="_notify_checkbox_change(this)">
                                    Hide notifications, only display inbox <i class="subtext">(not yet implemented)</i>
                                </label>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>${version.build}.${version.sku}</legend>
                        <div class="form-group">
                            <div class="checkbox">
                                <label for="setting--developer">
                                    <input id="setting--developer" type="checkbox" onchange="_notify_checkbox_change(this)">
                                    Enable developer features
                                </label>
                            </div>
                        </div>
                        <div class="sep"></div>
                        <div class="form-group">
                            <div class="checkbox">
                                <label for="setting--inbuilt_style_loading">
                                    <input id="setting--inbuilt_style_loading" type="checkbox" onchange="_notify_checkbox_change(this)">
                                    Automatically load the stylesheet <i class="subtext">(not yet implemented)</i>
                                </label>
                                <div class="alert">
                                    Once disabled, you are in control of loading the stylesheet with browser extensions such as Stylus.
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <div class="more-link align-right">
                        <a onclick="_deliver_notif('This is a quick test notification with text!')">Create a notification</a>
                    </div>
                    <div class="more-link align-right">
                        <a onclick="_deliver_notif('This is a long-lasting test notification filled with lots of text bla b la bla lbaslba b;;af;asdasdjk', false, false)">Create a long-lasting notification</a>
                    </div>
                    <div class="more-link align-right">
                        <a onclick="_deliver_notif('This is a notification only visible with developer mode enabled', true)">Create a developer-only notification</a>
                    </div>
                    <div class="more-link align-right">
                        <a href="${root}bwaa/setup">Enter first-time setup</a>
                    </div>
                </section>
            `);

            request_checkbox_update();
        } else if (page == 'corrections') {
            injector.innerHTML = (`
                <section id="welcome" class="form-section settings-form">
                    <h2 class="form-header">Media Corrections</h2>
                    <div class="alert">Capitalisation corrections for artists, albums, and tracks are currently not supported. Sorry for the inconvenience.</div>
                    <div class="more-link align-left space-self">
                        <a href="https://github.com/katelyynn/bleh/issues/new" target="_blank">Submit a correction</a>
                    </div>
                    <fieldset>
                        <legend>Artist Redirection</legend>
                        <div class="form-group">
                            <div class="checkbox">
                                <label for="setting--hide_redirect_banner">
                                    <input id="setting--hide_redirect_banner" type="checkbox" onchange="_notify_checkbox_change(this)">
                                    Do not display redirection banners
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </section>
            `);

            request_checkbox_update();
        } else if (page == 'page2') {
            injector.innerHTML = '<p>o.O</p>';
        }
    }

    function request_checkbox_update() {
        for (let setting in settings_store) {
            checkbox_update(setting, settings[setting], false);
        }
    }

    function checkbox_update(setting, value, modify=true) {
        if (settings_store[setting].type == 'toggle') {
            let checkbox = document.getElementById(`setting--${setting}`);
            if (checkbox == null)
                return;

            if (modify) {
                if (value == settings_store[setting].values[0]) {
                    settings[setting] = settings_store[setting].values[0];
                    checkbox.checked = true;
                } else {
                    settings[setting] = settings_store[setting].values[1];
                    checkbox.checked = false;
                }
                console.info('bwaa - setting', setting, 'changed to', value, settings[setting]);

                // save setting into body
                document.body.style.setProperty(`--${setting}`, settings[setting]);
                document.documentElement.setAttribute(`data-bwaa--${setting}`, `${settings[setting]}`);
            } else {
                console.info('bwaa - setting', setting, 'is being loaded as', value);
                if (value == settings_store[setting].values[0]) {
                    checkbox.checked = true;
                } else {
                    checkbox.checked = false;
                }
            }
        }

        // save to settings
        localStorage.setItem('bwaa', JSON.stringify(settings));
    }

    unsafeWindow._notify_checkbox_change = function(checkbox) {
        let setting = checkbox.getAttribute('id').replace('setting--', '');
        let state = checkbox.checked;

        checkbox_update(setting, state);
    }




    function bwaa_footer() {
        let footer = document.querySelector('.footer:not([data-bwaa="true"]');

        if (footer == null)
            return;
        footer.setAttribute('data-bwaa', 'true');


        let footer_container = footer.querySelector('.footer-top .container');

        let cute = document.createElement('div');
        cute.classList.add('cute-quote-container');
        cute.innerHTML = (`
            <div class="quote">
                “cute quote here”
            </div>
            <div class="more">
                <strong>More Last.fm Sites:</strong> <a href="https://blog.last.fm">Blog</a> | <a href="https://musicmanager.last.fm">Music Manager</a> | <a href="https://build.last.fm">Build</a> | <a href="https://playground.last.fm">Playground (Subscriber VIP zone)</a>
            </div>
        `);

        footer_container.appendChild(cute);

        let audioscrobbler_logo = footer.querySelector('.footer-bottom .logo img').getAttribute('src');

        let legal = document.createElement('div');
        legal.classList.add('legal');
        legal.innerHTML = (`
            <div class="logos">
                <div class="cbs-logo"></div>
                <div class="audioscrobbler-logo" style="background-image: url(${audioscrobbler_logo});"></div>
            </div>
            <div class="text">
                © 2024 Last.fm Ltd. All rights reserved. | <a href="${root}legal/terms">Terms of Use</a> and <a href="${root}legal/privacy">Privacy Policy</a> | <i class="update-date">Updated 2024</i><br>Some user-contributed text on this page is available under the <a href="http://creativecommons.org/licenses/by-sa/3.0/legalcode">Creative Commons Attribution/Share-Alike License</a>.<br>Text may also be available under the <a href="https://www.last.fm/help/gfdl">GNU Free Documentation License</a>.
            </div>
        `);

        footer_container.appendChild(legal);

        let bwaa_legal = document.createElement('div');
        bwaa_legal.classList.add('legal', 'bwaa-legal');
        bwaa_legal.innerHTML = (`
            <div class="logos"></div>
            <div class="text">
                <strong>bwaa</strong> is a creation by <a href="${root}user/cutensilly">cutensilly</a> in an attempt to restore the look of Last.fm during 2012. All original works are by Last.fm. Re-creations found within the script and stylesheet are based on Last.fm's designs with some flair of my own where applicable. <a href="https://github.com/katelyynn/bwaa/issues">bwaa is early alpha software, stability is not to be expected.</a>
            </div>
        `);

        footer_container.appendChild(bwaa_legal);
    }




    function bwaa_library() {
        bwaa_library_header();

        let top_tracks = document.querySelectorAll('#top-tracks-section .chartlist .chartlist-row:not(.chartlist__placeholder-row, [data-bwaa="true"])');

        if (top_tracks == null)
            return;

        top_tracks.forEach((track) => {
            track.setAttribute('data-bwaa', 'true');

            let album_link = '';
            let album_name = '-';

            let track_image = track.querySelector('.chartlist-image a');
            if (track_image != null) {
                album_link = track_image.getAttribute('href');
                album_name = track_image.querySelector('img').getAttribute('alt');
            }

            let album_name_col = document.createElement('td');
            album_name_col.classList.add('chartlist-album');
            album_name_col.innerHTML = (`
                <a href="${album_link}" alt="${album_name}">${album_name}</a>
            `);

            track.appendChild(album_name_col);
        });
    }
    function bwaa_library_header() {
        let library_header = document.querySelector('.library-header:not([data-bwaa])');

        if (library_header == null)
            return;
        library_header.setAttribute('data-bwaa', 'true');

        library_header.innerHTML = library_header.innerHTML.replaceAll('·', '|');
    }




    function bwaa_setup() {
        console.info('bwaa - loading first-time setup');
        let adaptive_skin = document.querySelector('.adaptive-skin-container:not([data-bwaa="true"])');

        if (adaptive_skin == null)
            return;
        adaptive_skin.setAttribute('data-bwaa', 'true');

        deliver_notif(`bwaa has installed successfully, welcome aboard!`);

        adaptive_skin.innerHTML = '';
        document.title = 'first-time bwaa | Last.fm';

        let my_avi = auth_link.querySelector('img').getAttribute('src');

        adaptive_skin.innerHTML = (`
            <div class="container page-content bwaa-settings lastfm-settings subpage">
                <div class="row">
                    <nav class="navlist secondary-nav navlist--more">
                        <ul class="navlist-items">
                            <li class="navlist-item secondary-nav-item secondary-nav-item--lastfm-settings">
                                <a class="secondary-nav-item-link secondary-nav-item-link--active" href="${window.location.href}">
                                    Setup bwaa
                                </a>
                            </li>
                            <li class="navlist-item secondary-nav-item secondary-nav-item--bwaa-settings">
                                <a class="secondary-nav-item-link" href="${root}bwaa">
                                    Configure bwaa
                                </a>
                            </li>
                        </ul>
                    </nav>
                    <div class="col-main settings-form">
                        <section class="profile-header-subpage-section">
                            <div class="badge-avatar">
                                <img src="${my_avi}" alt="${auth}">
                            </div>
                            <div class="badge-info">
                                <a href="${root}user/${auth}">${auth}</a>
                                <h1>Setup bwaa</h1>
                            </div>
                        </section>
                        <nav class="navlist secondary-nav navlist--more">
                            <ul class="navlist-items">
                                <li class="navlist-item secondary-nav-item">
                                    <a class="secondary-nav-item-link secondary-nav-item-link--active bwaa-settings-tab" data-bwaa-tab="home" onclick="_change_setup_page('home')">
                                        Home
                                    </a>
                                </li>
                                <li class="navlist-item secondary-nav-item">
                                    <a class="secondary-nav-item-link bwaa-settings-tab" data-bwaa-tab="page2" onclick="_change_setup_page('page2')">
                                        Page 2
                                    </a>
                                </li>
                            </ul>
                        </nav>
                        <div id="bleh-setup-inject"></div>
                    </div>
                </div>
            </div>
        `);


        change_setup_page('home');
    }

    unsafeWindow._change_setup_page = function(page) {
        change_setup_page(page);
    }
    function change_setup_page(page) {
        let tabs = document.querySelectorAll('.bwaa-settings-tab');
        tabs.forEach((tab) => {
            if (tab.getAttribute('data-bwaa-tab') != page) {
                tab.classList.remove('secondary-nav-item-link--active');
            } else {
                tab.classList.add('secondary-nav-item-link--active');
            }
        });

        render_setup_page(page, document.getElementById('bleh-setup-inject'));
    }

    function render_setup_page(page, injector) {
        if (page == 'home') {
            injector.innerHTML = (`
                <section id="welcome" class="form-section settings-form">
                    <h2 class="form-header">Thank you for installing!</h2>
                    <p>bwaa is an extension for Last.fm by <a href="${root}user/cutensilly">cutensilly</a> with the aim to bring back the 2012 look of Last.fm. Since it’s you’re first time installing, here’s a quick setup to get you going. You can configure bwaa at anytime by visiting <a href="${root}bwaa">Settings</a> :3</p>
                    <fieldset>
                        <legend>What era suits you best?</legend>
                        <div class="form-group">
                            <div class="radio-box">
                                <label for="setting--setup_choose_era--2010">
                                    <input id="setting--setup_choose_era--2010" type="radio" value="2010" name="setup_choose_era" onchange="_notify_radio_change(this)">
                                    2010 <i class="subtext">(WIP)</i>
                                </label>
                            </div>
                            <div class="radio-box">
                                <label for="setting--setup_choose_era--2012">
                                    <input id="setting--setup_choose_era--2012" type="radio" value="2012" name="setup_choose_era" checked onchange="_notify_radio_change(this)">
                                    2012 <i class="subtext">(default, most optimised)</i>
                                </label>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>How should modern features be treated?</legend>
                        <div class="form-group">
                            <div class="radio-box">
                                <label for="setting--setup_modern_visibility--true">
                                    <input id="setting--setup_modern_visibility--true" type="radio" value="true" name="setup_modern_visibility" checked onchange="_notify_radio_change(this)">
                                    Keep visible and attempt to blend in
                                </label>
                            </div>
                            <div class="radio-box">
                                <label for="setting--setup_modern_visibility--false">
                                    <input id="setting--setup_modern_visibility--false" type="radio" value="false" name="setup_modern_visibility" onchange="_notify_radio_change(this)">
                                    Hide all features not available in the time period (within reason)
                                </label>
                                <div class="alert">
                                    Keep in mind, this will hide features such as obsessions, listening reports, and more. This is configurable on a case-by-case basis in settings.
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <div class="more-link align-right">
                        <a href="${root}bwaa">Configure more of bwaa</a>
                    </div>
                    <div class="more-link align-right">
                        <a href="${root}user/${auth}">Head to your profile</a>
                    </div>
                    <fieldset>
                        <legend>Support bwaa</legend>
                        <div class="alert">If you end up enjoying bwaa you can <a href="https://github.com/katelyynn/bwaa" target="_blank">star the project</a> <i class="subtext">(if you have GitHub)</i> and/or share the word around! <3</alert>
                    </fieldset>
                </section>
            `);
        } else if (page == 'page2') {
            injector.innerHTML = '<p>o.O</p>';
        }
    }

    function radio_update(setting, value) {
        if (setting == 'setup_choose_era') {
            // choose your era preset

            // global
            settings.varied_avatar_shapes = true;
            settings.legacy_cover_art = true;

            if (value == '2012') {
                // 2012
                settings.shouts_2010 = false;
            } else if (value == '2010') {
                // 2010
                settings.shouts_2010 = true;
            }
        } else if (setting == 'setup_modern_visibility') {
            // show modern things

            if (value == 'true') {
                // true, show
                settings.hide_obsessions = false;
                settings.hide_your_progress = false;
                settings.hide_listening_reports = false;
            } else {
                // false, hide
                settings.hide_obsessions = true;
                settings.hide_your_progress = true;
                settings.hide_listening_reports = true;
            }
        }

        // save to settings
        localStorage.setItem('bwaa', JSON.stringify(settings));
    }

    unsafeWindow._notify_radio_change = function(radio) {
        let setting = radio.getAttribute('name');
        let value = radio.getAttribute('value');

        radio_update(setting, value);
    }




    // notifs
    function load_notifs() {
        let prev_notif = document.getElementById('bleh-notifs');
        if (prev_notif == null) {
            let notifs = document.createElement('div');
            notifs.classList.add('bwaa-notification-feed');
            notifs.setAttribute('id', 'bwaa-notifs');
            document.body.appendChild(notifs);
        }
    }

    unsafeWindow._deliver_notif = function(content, dev_only=false, quick=true, persist=false) {
        deliver_notif(content, dev_only, quick, persist);
    }
    /**
     * deliver notification to the user
     * @param {string} content text content displayed to the user
     * @param {boolean} dev_only display only when developer mode is enabled
     * @param {boolean} quick only show for a short notice
     * @param {boolean} persist persist until user dismisses
     */
    function deliver_notif(content, dev_only=false, quick=true, persist=false) {
        if (dev_only && !settings.developer)
            return;

        let notif = document.createElement('button');
        notif.classList.add('bwaa-notification');
        notif.setAttribute('onclick', '_kill_notif(this)');
        notif.textContent = content;

        document.getElementById('bwaa-notifs').appendChild(notif);

        if (persist)
            return;

        let timeout_length = (quick) ? 2500 : 7000;

        setTimeout(function() {
            kill_notif(notif);
        }, timeout_length);
    }

    unsafeWindow._kill_notif = function(notif) {
        kill_notif(notif);
    }
    function kill_notif(notif) {
        notif.classList.add('fade-out');
        setTimeout(function() {
            document.getElementById('bwaa-notifs').removeChild(notif);
        }, 200);
    }

    function fix_modal() {
        let fix = document.createElement('div');
        fix.classList.add('modal-fixer');
        fix.style.setProperty('display', 'none');

        document.body.appendChild(fix);

        setTimeout(function() {
            document.body.removeChild(fix);
        }, 10);
    }




    function notify_if_new_update() {
        let last_version_used = localStorage.getItem('bwaa_last_version_used') || '';

        // enter first-time setup
        if (last_version_used == '') {
            window.location.href = `${root}bwaa/setup`;
            localStorage.setItem('bwaa_last_version_used', version.build);
            return;
        }

        // otherwise, it's a usual update
        if (last_version_used != version.build) {
            deliver_notif(`bwaa has updated to ${version.build}.${version.sku}, welcome aboard!`, false, false, true);
            localStorage.setItem('bwaa_last_version_used', version.build);
        }
    }




    function bwaa_media_items() {
        if (!settings.legacy_cover_art)
            return;

        let media_items = document.querySelectorAll('.media-item img:not([data-bwaa])');
        media_items.forEach((media_item) => {
            media_item.setAttribute('data-bwaa', 'true');

            let url = media_item.getAttribute('src');
            let url_split = url.split('/');

            if (legacy_cover_art.hasOwnProperty(url_split[6])) {
                media_item.setAttribute('src', url.replace(url_split[6], legacy_cover_art[url_split[6]]));
            }
        });

        let chartlist_images = document.querySelectorAll('.chartlist-image img:not([data-bwaa])');
        chartlist_images.forEach((chartlist_image) => {
            chartlist_image.setAttribute('data-bwaa', 'true');

            let url = chartlist_image.getAttribute('src');
            let url_split = url.split('/');

            if (legacy_cover_art.hasOwnProperty(url_split[6])) {
                chartlist_image.setAttribute('src', url.replace(url_split[6], legacy_cover_art[url_split[6]]));
            }
        });

        let grid_images = document.querySelectorAll('.grid-items-cover-image-image img:not([data-bwaa])');
        grid_images.forEach((grid_image) => {
            grid_image.setAttribute('data-bwaa', 'true');

            let url = grid_image.getAttribute('src');
            let url_split = url.split('/');

            if (legacy_cover_art.hasOwnProperty(url_split[6])) {
                grid_image.setAttribute('src', url.replace(url_split[6], legacy_cover_art[url_split[6]]));
            }
        });
    }
})();