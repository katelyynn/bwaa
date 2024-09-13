// ==UserScript==
// @name         bwaa
// @namespace    http://last.fm/
// @version      2024.0913
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
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js
// ==/UserScript==

console.info('bwaa - beginning to load');

let version = {
    build: '2024.0913',
    sku: 'sweet'
}

let current_promo = `<a href="https://cutensilly.org/bwaa/fm" target="_blank">cutensilly.org/bwaa/fm: you are running bwaa version ${version.build}.${version.sku} »</a>`;

// loads your selected language in last.fm
let lang;
let non_override_lang;
// WARN: fill this out if translating
// lists all languages with valid bwaa translations
// any custom translations will not load if not listed here!!
let valid_langs = ['en'];

const trans = {
    en: {
        see_more: 'See more',
        see_count_more: 'See {count} more',

        plays: '{count} plays',
        listeners: '{count} listeners',
        popular_tags: 'Popular tags: {list}',
        shouts: 'Shouts: {link}',
        leave_a_shout: 'Leave a shout',
        see_all_images: 'See all {placeholder}',

        your_scrobbles: {
            name: 'Your Scrobbles',
            count_scrobbles: '{count} scrobbles'
        },

        trend: {
            name: 'Recent Listening Trend',
            artist: 'Artist Stats',
            album: 'Album Stats',
            track: 'Track Stats'
        },

        profile: {
            tabs: {
                overview: 'Profile',

                // copy 1:1 from last.fm's interface
                journal: 'Journal'
            },
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
            },
            last_seen: {
                name: 'Last seen: {time}',
                active_now: 'active now',
                private: 'unknown..'
            },
            follows_you: {
                name: '(follows you!)'
            },
            edit: {
                link: 'Edit profile details »'
            },
            user_data: {
                // copy these exactly from last.fm's interface, this is used for
                // string manipulation within bwaa

                // in order to get this value, navigate to a profile and run '_dev_request_scrobble_since()'
                // in the browser console (CTRL + SHIFT + I)
                // which, in english, returns "• scrobbling since 20 Jun 2022"

                // copy this exactly but remove 'since 20 Jun 2022', leaving '• scrobbling ' (SPACE ON THE END IMPORTANT)
                // obviously, apply to ur language

                scrobbling_since_replace: '• scrobbling ',

                //

                loved_tracks: '{count} Loved Tracks',
                artists: '{count} Artists',
                shouts: 'Shouts'
            }
        },
        artist: {
            tabs: {
                overview: 'Artist',

                // copy the rest 1:1 from last.fm's interface
                tracks: 'Tracks',
                albums: 'Albums',
                photos: 'Photos',
                similar: 'Similar Artists',
                events: 'Events',
                wiki: 'Biography',
                tags: 'Tags',
                shoutbox: 'Shoutbox',
                listeners: 'Listeners'
            },
            share: 'Share this artist:',
            more_information: {
                name: 'More information',
                links: 'Links'
            },
            top_listeners: {
                name: 'Top Listeners',
                subtext: 'Top Listener'
            },
            listeners_you_know: {
                name: 'Listeners You Know'
            }
        },
        album: {
            tabs: {
                overview: 'Album'
            }
        },
        track: {
            tabs: {
                overview: 'Track'
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
        },
        activities: {
            name: 'Recent Activity',
            description: 'Your latest 10 activities are tracked locally on your profile, try leaving a shout and check back here!',
            notifications: 'Read your notifications',

            test: 'TEST {involved}',
            shout: 'You left a shout for {i}',
            image_upload: 'You uploaded an image for {i}',
            obsess: 'You’re obsessed with {i}',
            unobsess: 'You’re no longer obsessed with {i}',
            love: 'You love {i}',
            unlove: 'You no longer love {i}',
            install_bwaa: 'You installed bwaa',
            update_bwaa: 'You updated bwaa to {i}',
            bookmark: 'You bookmarked {i}',
            unbookmark: 'You removed {i}’s bookmark',
            wiki: 'You edited on {i}'
        }
    }
}

/**
 * lookup information function, used for realtime language changing mainly,
 * keeping the 'root' variable accurate
 */
function lookup_lang() {
    root = document.querySelector('.masthead-logo a').getAttribute('href');
    if (auth_link != null)
        my_avi = auth_link.querySelector('img').getAttribute('src');
    lang = document.documentElement.getAttribute('lang');
    non_override_lang = lang;

    if (!valid_langs.includes(lang)) {
        console.info('bwaa - language fallback from', lang, 'to en (language is not listed as valid)', valid_langs);
        lang = 'en';
    }
}

tippy.setDefaultProps({
    arrow: false,
    duration: [100, 100],
    delay: [null, 50]
});

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
    hide_extra_grid_item: true,

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
    },
    hide_extra_grid_item: {
        type: 'toggle',
        values: [true, false]
    },
    hide_obsessions: {
        type: 'toggle',
        values: [true, false]
    },
    hide_your_progress: {
        type: 'toggle',
        values: [true, false]
    },
    hide_listening_reports: {
        type: 'toggle',
        values: [true, false]
    }
}
let legacy_cover_art = {
    // NIRVANA
    '570021b68d3d9d2db08bc99a473303b0.jpg': 'de8d87469f794622a0687feb36e13c07.jpg', // NEVERMIND
    '3324e5982f0d81338d2749d5161eb2a8.jpg': 'de8d87469f794622a0687feb36e13c07.jpg', // NEVERMIND (REMASTERED)
    'b897255bf422baa93a42536af293f9f8.jpg': 'acbf048199bb4cf18ed93d3065a25be9.jpg', // IN UTERO
    // KANYE WEST
    '617da94739994953c9dead5f00a6972c.jpg': '5af9deac5bd2ec3da52a36d7b6c4b850.jpg', // YEEZUS
    '57c1731b0f18c6f288e30a6c3ad42eb6.jpg': 'ab7f5ca02b45ea96ee7bbf33d4502ab0.jpg' // YANDHI - i cant upload a better one :(
}
let fallback_cover_art = 'https://katelyynn.github.io/bwaa/fm/extra_res/empty_disc.png';

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

// stores ur current authorised avatar
let my_avi = '';

// stores the current root of the page, most applicable in other languages:
// en: /
// jp: /jp/
// etc.
let root = '';

// recent activity
let recent_activity_list;

// page type
let page = {
    type: '',
    name: '',
    sister: '',
    subpage: '',
    structure: {
        container: null,
        row: null,
        main: null,
        side: null
    }
};

let bwaa_url = 'https://www.last.fm/bwaa';
let bwaa_regex = new RegExp('^https://www\.last\.fm/[a-z]+/bwaa$');

let setup_url = 'https://www.last.fm/bwaa/setup';
let setup_regex = new RegExp('^https://www\.last\.fm/[a-z]+/bwaa/setup$');

(function() {
    'use strict';

    auth_link = document.querySelector('a.auth-link');
    if (auth_link != null) {
        auth = auth_link.querySelector('img').getAttribute('alt');
        console.info('bwaa - auth', auth);
    }
    bwaa();

    function bwaa() {
        console.info('bwaa - starting up');

        // replace favicon with 2012 favicon
        document.head.querySelector('link[rel="icon"]').setAttribute('href', 'https://katelyynn.github.io/bwaa/fm/res/favicon.2.ico');
        // essentials
        lookup_lang();
        load_settings();
        bwaa_load_header();
        load_notifs();

        bwaa_lastfm_settings();
        bwaa_footer();

        // everything past this point requires authorisation
        if (auth == '')
            return;

        load_activities();
        notify_if_new_update();

        if (window.location.href == bwaa_url || bwaa_regex.test(window.location.href)) {
            // start bwaa settings
            bwaa_settings();
        } else if (window.location.href == setup_url || setup_regex.test(window.location.href)) {
            // start bwaa setup
            bwaa_setup();
        } else {
            // things that load when not in bwaa settings
            bwaa_media_items();

            bwaa_profiles();
            bwaa_artists();
            bwaa_albums();
            bwaa_tracks();
            bwaa_shouts();
            bwaa_artworks();
            bwaa_friends();
            bwaa_obsessions();
            bwaa_library();
            bwaa_playlists();
            subscribe_to_events();
        }

        // last.fm is a single page application, this will be on the lookout
        // for new elements being added so they can be patched if needed
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node instanceof Element) {
                        if (node.classList[0] == 'modal-dialog') {
                            // this is a silly hack to ensure modals get themed, as the creation of this element
                            // causes another run of this script, giving enough time for the modal to load
                            // this took so long
                            fix_modal();
                        }

                        if (!node.hasAttribute('data-bwaa')) {
                            node.setAttribute('data-bwaa', 'true');

                            console.info('bwaa - bwaa\'ing');

                            // essentials
                            lookup_lang();
                            load_settings();
                            bwaa_load_header();

                            bwaa_lastfm_settings();
                            bwaa_footer();

                            load_activities();

                            if (window.location.href == bwaa_url || bwaa_regex.test(window.location.href)) {
                                // start bwaa settings
                                bwaa_settings();
                            } else if (window.location.href == setup_url || setup_regex.test(window.location.href)) {
                                // start bwaa setup
                                bwaa_setup();
                            } else {
                                // things that load when not in bwaa settings
                                bwaa_media_items();

                                bwaa_profiles();
                                bwaa_artists();
                                bwaa_albums();
                                bwaa_tracks();
                                bwaa_shouts();
                                bwaa_artworks();
                                bwaa_friends();
                                bwaa_obsessions();
                                bwaa_library();
                                bwaa_playlists();
                                subscribe_to_events();
                            }
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
        let inner = document.body.querySelector('.masthead-inner-wrap');

        if (inner.hasAttribute('data-bwaa'))
            return;
        inner.setAttribute('data-bwaa', 'true');

        if (auth_link != null) {
            // logged in
            let text = document.createElement('p');
            text.textContent = auth;
            auth_link.appendChild(text);
        } else {
            // guest

            let site_auth_anon = inner.querySelector('.site-auth--anon');

            let login_btn = site_auth_anon.querySelector('.site-auth-control');
            login_btn.classList.add('logon-button');
            login_btn.innerHTML = '<strong>Login</strong>';

            let join_btn = site_auth_anon.querySelector('.join-cta-button');
            join_btn.innerHTML = '<strong>Join</strong>';
        }

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


        if (auth_link == null)
            return;


        let site_auth = inner.querySelector('.site-auth');

        let notif_btn_txt = document.querySelector('[data-analytics-label="notifications"] .auth-dropdown-item-left').textContent.trim();
        let notif_badge = document.querySelector('[data-analytics-label="notifications"] .notification-count-badge');

        if (settings.no_notifs)
            notif_badge = null;

        let inbox_btn_txt = document.querySelector('[data-analytics-label="inbox"] .auth-dropdown-item-left').textContent.trim();
        let inbox_badge = document.querySelector('[data-analytics-label="inbox"] .notification-count-badge');

        let logout_btn = document.querySelector('[data-require="components/logout-form"]');
        let logout_btn_anchor = logout_btn.querySelector('a');
        logout_btn_anchor.classList.remove('auth-dropdown-menu-item', 'js-logout-button', 'mimic-link', 'masthead-nav-control');

        let user_companion_nav = document.createElement('div');
        user_companion_nav.classList.add('user-companion-nav');
        user_companion_nav.innerHTML = (`
            <a href="${root}inbox/notifications">${notif_btn_txt}${(notif_badge != null ? ` (${notif_badge.textContent.trim()})` : '')}</a> | <a href="${root}inbox">${inbox_btn_txt}${(inbox_badge != null ? ` (${inbox_badge.textContent.trim()})` : '')}</a> | ${logout_btn.outerHTML}
        `);
        site_auth.appendChild(user_companion_nav);
    }

    unsafeWindow._open_language_menu = function() {
        let wrapper = document.getElementById('language-wrapper');

        let current_state = wrapper.getAttribute('data-dialog-open');
        if (current_state == 'false')
            wrapper.setAttribute('data-dialog-open', 'true');
        else
            wrapper.setAttribute('data-dialog-open', 'false');
    }


    // general health
    function checkup_page_structure() {
        if (page.structure.row == null) {
            console.info('bwaa - page structure checkup - page is missing a row, creating');
            page.structure.row = document.createElement('div');
            page.structure.row.classList.add('row');

            page.structure.container.insertBefore(page.structure.row, page.structure.container.firstElementChild);
        }

        if (page.structure.main == null) {
            console.info('bwaa - page structure checkup - page is missing a main, creating');
            page.structure.main = document.createElement('div');
            page.structure.main.classList.add('col-main');

            page.structure.row.appendChild(page.structure.main);
        }

        if (page.structure.side == null) {
            console.info('bwaa - page structure checkup - page is missing a side');
            // check first if another sidebar exists
            page.structure.side = page.structure.row.querySelector('.col-sidebar');

            if (page.structure != null)
                return;
            console.info('bwaa - page structure checkup - creating new side');

            // otherwise, make anew
            page.structure.side = document.createElement('div');
            page.structure.side.classList.add('col-sidebar');

            page.structure.row.appendChild(page.structure.side);
        }

        console.info('bwaa - page structure checkup - finished');
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
        page.type = 'user';

        // are we on the overview page?
        let profile_header_overview = profile_header.classList.contains('header--overview');
        console.info('bwaa - profile overview?', profile_header_overview);

        // remove the profile card-related stuff
        let content_top = document.body.querySelector('.content-top');
        if (!content_top.hasAttribute('data-bwaa')) {
            content_top.setAttribute('data-bwaa', 'true');
            content_top.style.setProperty('display', 'none');
        }

        page.structure.container = document.body.querySelector('.page-content:not(.profile-cards-container)');
        page.structure.row = page.structure.container.querySelector('.row');
        page.structure.main = page.structure.row.querySelector('.col-main');
        page.structure.side = page.structure.row.querySelector('.col-sidebar');

        if (page.structure.main == null) {
            page.structure.container = document.body.querySelector('.page-content');

            page.structure.row = document.createElement('div');
            page.structure.row.classList.add('row');

            page.structure.main = document.createElement('div');
            page.structure.main.classList.add('col-main');

            page.structure.side = document.createElement('div');
            page.structure.side.classList.add('col-sidebar');

            page.structure.row.appendChild(page.structure.main, page.structure.side);
            page.structure.container.insertBefore(row, page.structure.container.firstElementChild);
        }

        let navlist = profile_header.querySelector('.navlist');
        patch_tab_overview_btn(navlist);
        let navlist_items = navlist.querySelector('.navlist-items');

        let journal_nav_btn = document.createElement('li');
        journal_nav_btn.classList.add('navlist-item', 'secondary-nav-item', 'secondary-nav-item--journal');


        if (profile_header_overview) {
            // profile overview stuff
            page.subpage = 'overview';

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
            page.name = header_user_data.name;

            journal_nav_btn.innerHTML = (`
                <a class="secondary-nav-item-link" href="${root}user/${header_user_data.name}/journal">
                    ${trans[lang].profile.tabs.journal}
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
                    last_seen = trans[lang].profile.last_seen.active_now;
            } else {
                last_seen = trans[lang].profile.last_seen.private;
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
                page.structure.main.insertBefore(profile_actions, page.structure.main.firstChild);

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
                            <strong>${header_user_data.display_name}</strong>${(user_follows_you) ? trans[lang].profile.follows_you.name : ''}
                        </div>
                        ${(auth != header_user_data.name) ? `
                        <div class="bottom user-last-seen">
                            ${trans[lang].profile.last_seen.name.replace('{time}', last_seen)}
                        </div>
                        ` : `
                        <div class="bottom edit-profile-details">
                            <a href="${root}settings">${trans[lang].profile.edit.link}</a>
                        </div>
                        `}
                    </div>
                    <div class="user-data">
                        <div class="user-plays">
                            <div class="count">
                                ${scrobble_flip(header_user_data.scrobbles).outerHTML} plays
                            </div>
                            <div class="since">
                                ${header_user_data.since.replace(trans[lang].profile.user_data.scrobbling_since_replace, '')}
                            </div>
                        </div>
                    </div>
                    <div class="user-activity">
                        <a href="${header_user_data.loved_tracks.getAttribute('href')}">${trans[lang].profile.user_data.loved_tracks.replace('{count}', header_user_data.loved_tracks.textContent)}</a> | <a href="${header_user_data.artists.getAttribute('href')}">${trans[lang].profile.user_data.artists.replace('{count}', header_user_data.artists.textContent)}</a> | <a href="${header_user_data.link}/shoutbox">${trans[lang].profile.user_data.shouts}</a>
                    </div>
                </div>
            `);

            navlist_items.appendChild(journal_nav_btn);
            page.structure.row.insertBefore(navlist, page.structure.main);
            page.structure.main.insertBefore(new_header, page.structure.main.firstElementChild);
            profile_header.style.setProperty('display', 'none');

            // user type
            if (header_user_data.name == 'cutensilly') {
                let user_type_banner = document.createElement('div');
                user_type_banner.classList.add('user-type-banner', `user-type--cute`);
                user_type_banner.textContent = 'bwaa creator';
                page.structure.row.insertBefore(user_type_banner, page.structure.main);
            }




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




            // about me
            let about_me = page.structure.side.querySelector('.about-me-sidebar p');

            if (about_me != null)
                about_me.innerHTML = parse_markdown_text(about_me.textContent);




            // featured track
            let featured_item_wrapper = document.body.querySelector('.header-featured-track');

            if (featured_item_wrapper != null)
                bwaa_profile_featured_item(featured_item_wrapper);




            // recent activity
            if (auth != header_user_data.name)
                return;

            let recent_activity_section = document.createElement('section');
            recent_activity_section.classList.add('recent-activity-section');
            recent_activity_section.innerHTML = (`
                <h2>${trans[lang].activities.name} <i class="subtext"><a id="what-are-activities">(?)</a></i></h2>
            `);

            // we want to show in date order from latest to oldest down
            // but .reverse() is destructive, so we copy first
            let recent_activity_list_r = recent_activity_list;
            recent_activity_list_r.reverse();

            recent_activity_list_r.forEach((activity) => {
                // type: string,
                // involved: [{name: string, type: user | artist | album | track}, sister?: string],
                // context: string,
                // date: string

                let activity_item = document.createElement('a');
                activity_item.classList.add('activity-item', 'journal-like', `activity--${activity.type}`);
                activity_item.setAttribute('href', activity.context);

                let involved_text = '';

                let tooltip_name;
                let tooltip_sister;

                activity.involved.forEach((involved) => {
                    let involved_link;

                    if (involved.type == 'user')
                        involved_link = `${root}user/${involved.name}`;
                    else if (involved.type == 'artist')
                        involved_link = `${root}music/${sanitise(involved.name)}`;
                    else if (involved.type == 'album')
                        involved_link = `${root}music/${sanitise(involved.sister)}/${sanitise(involved.name)}`;
                    else if (involved.type == 'track')
                        involved_link = `${root}music/${sanitise(involved.sister)}/_/${sanitise(involved.name)}`;
                    else if (involved.type == 'bwaa')
                        involved_link = `${root}bwaa`;

                    // tooltip
                    if (involved.type != 'artist' && involved.type != 'user' && involved.type != 'bwaa') {
                        tooltip_name = involved.name;
                        tooltip_sister = involved.sister;
                    }

                    if (involved_text != '')
                        involved_text = `${involved_text}, <a class="involved--${involved.type}" href="${involved_link}">${involved.name}</a>`;
                    else
                        involved_text = `${involved_text}<a class="involved--${involved.type}" href="${involved_link}">${involved.name}</a>`;
                });

                let activity_text = trans[lang].activities[activity.type].replace('{i}', involved_text);

                moment.locale('en', {
                    relativeTime: {
                        future: 'in %s',
                        past: '%s ago',
                        s:  'now',
                        ss: '%ss',
                        m:  '1m',
                        mm: '%dm',
                        h:  '1h',
                        hh: '%dh',
                        d:  '1d',
                        dd: '%dd',
                        M:  '1mo',
                        MM: '%dmo',
                        y:  '1yr',
                        yy: '%dyr'
                    }
                });

                activity_item.innerHTML = (`
                    <div class="title">${activity_text}</div>
                    <div class="date">${moment(activity.date).fromNow(true)}</div>
                `);

                recent_activity_section.appendChild(activity_item);

                if (tooltip_name != undefined)
                    tippy(activity_item.querySelector('.title a'), {
                        content: `${tooltip_sister} - ${tooltip_name}`
                    });
            });

            if (!settings.no_notifs) {
                let notification_more_link = document.createElement('div');
                notification_more_link.classList.add('more-link', 'align-right');
                notification_more_link.innerHTML = (`
                    <a href="${root}inbox/notifications">${trans[lang].activities.notifications}</a>
                `);
                recent_activity_section.appendChild(notification_more_link);
            }

            let featured_item_section = page.structure.side.querySelector('.featured-item-section');
            if (featured_item_section != null)
                page.structure.side.insertBefore(recent_activity_section, featured_item_section);
            else
                page.structure.side.firstElementChild.after(recent_activity_section);

            tippy(document.getElementById('what-are-activities'), {
                content: trans[lang].activities.description
            });
        } else {
            // profile non-overview stuff

            // which subpage is it?
            page.subpage = document.body.classList[1].replace('namespace--', '');
            deliver_notif(`Subpage type of ${page.subpage}`, true);

            let header_user_data = {
                avatar: profile_header.querySelector('.avatar img'),
                name: profile_header.querySelector('.header-title a').textContent,
                link: profile_header.querySelector('.header-title a').getAttribute('href'),
                page: document.body.querySelector('.content-top-header').textContent
            }
            page.name = header_user_data.name;

            if (page.subpage.startsWith('user_journal')) {
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
                page.structure.main.insertBefore(library_controls, page.structure.main.firstChild);
            }

            let new_header = generic_subpage_header(
                header_user_data.avatar.getAttribute('src'),
                header_user_data.page
            );

            navlist_items.appendChild(journal_nav_btn);
            try {
                page.structure.row.insertBefore(navlist, page.structure.main);
            } catch(e) {
                page.structure.main.insertBefore(navlist, page.structure.main.firstElementChild)
            }
            page.structure.main.insertBefore(new_header, page.structure.main.firstElementChild);
            profile_header.style.setProperty('display', 'none');

            page.structure.container.classList.add('subpage');

            if (page.subpage == 'user_obsessions_overview') {
                bwaa_obsessions_list();
            } else if (
                page.subpage.startsWith('user_events') ||
                page.subpage.startsWith('user_playlists') ||
                page.subpage == 'user_neighbours'
            ) {
                deliver_notif('This page is currently not finished, sorry!');
            }
        }
        console.info(page);
    }

    function parse_markdown_text(text) {
        let converter = new showdown.Converter({
            emoji: true,
            excludeTrailingPunctuationFromURLs: true,
            ghMentions: true,
            ghMentionsLink: `${root}user/{u}`,
            headerLevelStart: 5,
            noHeaderId: true,
            openLinksInNewWindow: true,
            requireSpaceBeforeHeadingText: true,
            simpleLineBreaks: true,
            simplifiedAutoLink: true,
            strikethrough: true,
            underline: true,
            ghCodeBlocks: false,
            smartIndentationFix: true
        });
        let parsed_text = converter.makeHtml(text
        .replace(/([@])([a-zA-Z0-9_]+)/g, '[$1$2](/user/$2)')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;'));
        return parsed_text;
    }

    function bwaa_profile_featured_item(featured_item_wrapper) {
        if (settings.hide_obsessions)
            return;

        let cover = featured_item_wrapper.querySelector('.cover-art img').getAttribute('src');

        let header = featured_item_wrapper.querySelector('.featured-item-heading');
        let header_link = header.querySelector('.featured-item-heading-link');
        if (header_link == null) {
            header_link = document.body.querySelector('#top-tracks .more-link a');
        }

        let track_name = featured_item_wrapper.querySelector('.featured-item-name').textContent;
        let artist_name = featured_item_wrapper.querySelector('.featured-item-artist');

        let featured_item_section = document.createElement('section');
        featured_item_section.classList.add('featured-item-section');
        featured_item_section.innerHTML = (`
            <h2>${header.textContent}</h2>
            <div class="grid-items">
                <li class="grid-items-item link-block">
                    <div class="grid-items-cover-image">
                        <div class="grid-items-cover-image-image">
                            <img src="${cover}" alt="Image for '${track_name}'" loading="lazy">
                        </div>
                        <div class="grid-items-item-details">
                            <p class="grid-items-item-main-text">
                                <a class="link-block-target" href="${header_link.getAttribute('href')}" title="${track_name}">
                                    ${track_name}
                                </a>
                            </p>
                            <p class="grid-items-item-aux-text">
                                <a class="grid-items-item-aux-block" href="${artist_name}">
                                    ${artist_name.textContent.trim()}
                                </a>
                            </p>
                        </div>
                        <a class="link-block-cover-link" href="${header_link.getAttribute('href')}" tabindex="-1" aria-hidden="true"></a>
                    </div>
                </li>
            </div>
        `);

        let stationlinks = page.structure.side.querySelector('.stationlinks');
        if (stationlinks != null)
            page.structure.side.insertBefore(featured_item_section, stationlinks);
        else
            page.structure.side.insertBefore(featured_item_section, page.structure.side.firstElementChild);
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

        let scrobbles = element.querySelector('a').textContent
        .replaceAll(',', '')
        .replaceAll('.', '');

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




    function patch_tab_overview_btn(navlist) {
        let tab = navlist.querySelector('.secondary-nav-item--overview a');

        if (page.type == 'user')
            tab.textContent = trans[lang].profile.tabs.overview;
        else
            tab.textContent = trans[lang][page.type].tabs.overview;
    }




    function bwaa_artists() {
        let artist_header = document.body.querySelector('.header-new--artist');

        if (artist_header == undefined)
            return;

        if (artist_header.hasAttribute('data-bwaa'))
            return;
        artist_header.setAttribute('data-bwaa', 'true');

        page.type = 'artist';

        let is_subpage = artist_header.classList.contains('header-new--subpage');


        page.structure.container = document.body.querySelector('.page-content');
        page.structure.row = page.structure.container.querySelector('.row');
        try {
            page.structure.main = page.structure.row.querySelector('.col-main');
            page.structure.side = page.structure.row.querySelector('.col-sidebar:not(.masonry-right)');
        } catch(e) {
            console.info('bwaa - page structure - there was an issue finding elements');
        }

        checkup_page_structure();

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
                            ${trans[lang].artist.tabs.overview}
                            <span class="sr-only">(current section)</span>
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
            page.subpage = 'overview';
            let artist_metadata = artist_header.querySelectorAll('.header-metadata-tnew-display');
            let header_artist_data = {
                avatar: artist_header.querySelector('.header-new-background-image').getAttribute('content'),
                name: artist_header.querySelector('.header-new-title').textContent,
                link: window.location.href,
                photos: artist_header.querySelector('.header-new-gallery-inner').textContent,
                plays: abbr_statistic(artist_metadata[1].querySelector('abbr')),
                listeners: artist_metadata[0].querySelector('abbr').getAttribute('title')
            }
            page.name = header_artist_data.name;
            page.sister = '';


            let origin = '';
            let origin_elements = page.structure.main.querySelectorAll('.metadata-column .catalogue-metadata-description');
            if (origin_elements.length > 0) {
                origin = '<div class="origin">';

                origin_elements.forEach((meta) => {
                    origin = `${origin}<div class="meta">${meta.textContent}</div>`;
                })

                origin = `${origin}</div>`;
            }


            let tags_html = '';
            let tags = page.structure.main.querySelectorAll('.tag a');
            let tags_see_more = page.structure.main.querySelector('.tags-view-all');

            let index = 1;
            tags.forEach((tag) => {
                if (index == 1)
                    tags_html = `${tags_html} <a href="${tag.getAttribute('href')}">${tag.textContent}</a>`;
                else
                    tags_html = `${tags_html}, <a href="${tag.getAttribute('href')}">${tag.textContent}</a>`;
                index += 1;
            });

            tags_html = `${tags_html} <a class="see-more-tags" href="${(tags_see_more != null) ? tags_see_more.getAttribute('href') : ''}">${trans[lang].see_more}</a>`;


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
                        ${get_wiki()}
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

            page.structure.row.insertBefore(navlist, page.structure.main);
            page.structure.main.insertBefore(new_header, page.structure.main.firstChild);
            artist_header.style.setProperty('display', 'none');

            prep_bookmark_btn();

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
                page.structure.side.insertBefore(more_information, page.structure.side.firstChild);
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
                    <a href="${window.location.href}/+listeners">${trans[lang].see_more}</a>
                </div>
            `);
            page.structure.side.insertBefore(top_global_listeners_you_know, page.structure.side.firstChild);

            // listeners you! know
            let listeners_placeholder = document.createElement('div');
            listeners_placeholder.classList.add('top-listeners-small');
            let listeners_you_know_list = page.structure.main.querySelectorAll('.personal-stats-listener');
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

            let more_listeners = page.structure.main.querySelector('.personal-stats-item--listeners .header-metadata-display a');
            if (more_listeners != null) {
                let listeners_you_know = document.createElement('section');
                listeners_you_know.innerHTML = (`
                    <h2>Listeners You Know</h2>
                    ${listeners_placeholder.outerHTML}
                    <div class="module-options">
                        <a href="${more_listeners.getAttribute('href')}">${trans[lang].see_count_more.replace('{count}', more_listeners.textContent)}</a>
                    </div>
                `);
                page.structure.side.insertBefore(listeners_you_know, page.structure.side.firstChild);
            }

            let scrobble_count_element = page.structure.main.querySelector('.personal-stats-item--scrobbles .header-metadata-display a');
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
            page.structure.side.insertBefore(your_scrobbles, page.structure.side.firstChild);

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
            page.structure.side.insertBefore(artist_stats, page.structure.side.firstChild);
        } else {
            patch_tab_overview_btn(navlist);

            // which subpage is it?
            let subpage_type = document.body.classList[2].replace('namespace--', '');
            page.subpage = subpage_type;
            deliver_notif(`Subpage type of ${subpage_type}`, true);

            let subpage_title = document.body.querySelector('.subpage-title');
            if (subpage_title == undefined)
                subpage_title = page.structure.main.querySelector(':scope > h2');

            let header_artist_data = {
                avatar: artist_header.querySelector('.header-new-background-image').getAttribute('content'),
                name: artist_header.querySelector('.header-new-title').textContent,
                link: artist_header.querySelector('.secondary-nav-item--overview a').getAttribute('href'),
                page: subpage_title.textContent
            }
            page.name = header_artist_data.name;
            page.sister = '';

            let new_header = generic_subpage_header(
                header_artist_data.avatar,
                header_artist_data.page,
                'artist'
            );

            page.structure.row.insertBefore(navlist, page.structure.main);
            page.structure.main.insertBefore(new_header, page.structure.main.firstChild);
            artist_header.style.setProperty('display', 'none');

            if (subpage_type.includes('wiki')) {
                if (subpage_type.includes('wiki_history')) {
                    bwaa_wiki_history();
                } else {
                    generic_wiki_patch();

                    return;
                }
            }

            document.body.querySelector('.container.page-content').classList.add('subpage');

            if (subpage_type.includes('tags_overview')) {
                generic_tag_patch();
            }
        }
    }

    function prep_bookmark_btn() {
        let btn = page.structure.main.querySelector('.header-new-bookmark-button');

        update_bookmark_btn(btn);
    }
    function prep_love_btn() {
        let btn = page.structure.main.querySelector('.header-new-love-button');

        update_love_btn(btn);
    }

    function update_bookmark_btn(button) {
        button.setAttribute('data-bwaa-fired', 'true');

        // this prevents a reload apparently
        window.setTimeout(function() {
            let action = button.getAttribute('data-analytics-action');
            console.info('action', action);
            if (action.startsWith('Bookmark')) {
                button.innerHTML = '<strong>Add to my Library</strong>';
            } else {
                button.innerHTML = '<strong>Added to my Library</strong>';
            }

            button.removeAttribute('data-bwaa-fired');
        }, 2);
    }
    function update_love_btn(button) {
        button.setAttribute('data-bwaa-fired', 'true');

        // this prevents a reload apparently
        window.setTimeout(function() {
            let action = button.getAttribute('data-analytics-action');
            console.info('action', action);
            if (action.startsWith('Love')) {
                button.innerHTML = '<strong>Love this track</strong>';
            } else {
                button.innerHTML = '<strong>You love this track</strong>';
            }

            button.removeAttribute('data-bwaa-fired');
        }, 2);
    }



    function bwaa_albums() {
        let album_header = document.body.querySelector('.header-new--album');

        if (album_header == undefined)
            return;

        if (album_header.hasAttribute('data-bwaa'))
            return;
        album_header.setAttribute('data-bwaa', 'true');

        page.type = 'album';

        let is_subpage = album_header.classList.contains('header-new--subpage');


        page.structure.container = document.body.querySelector('.page-content');
        page.structure.row = page.structure.container.querySelector('.row');
        try {
            page.structure.main = page.structure.row.querySelector('.col-main:not(.visible-xs)');
            page.structure.side = page.structure.row.querySelector('.col-sidebar.hidden-xs');
        } catch(e) {
            console.info('bwaa - page structure - there was an issue finding elements');
        }

        checkup_page_structure();

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
                            ${trans[lang].album.tabs.overview}
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
            page.subpage = 'overview';
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
                plays: abbr_statistic(album_metadata[1].querySelector('abbr')),
                listeners: album_metadata[0].querySelector('abbr').getAttribute('title'),
                add_artwork: add_artwork
            }
            page.name = header_album_data.name;
            page.sister = header_album_data.artist;

            if (settings.legacy_cover_art) {
                let url_split = avatar.split('/');

                if (legacy_cover_art.hasOwnProperty(url_split[6])) {
                    header_album_data.avatar = header_album_data.avatar.replace(url_split[6], legacy_cover_art[url_split[6]]);
                }
            }


            let tags_html = '';
            let tags = page.structure.main.querySelectorAll('.tag a');
            let tags_see_more = page.structure.main.querySelector('.tags-view-all');

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

            page.structure.row.insertBefore(navlist, page.structure.main);
            page.structure.main.insertBefore(new_header, page.structure.main.firstChild);
            album_header.style.setProperty('display', 'none');

            prep_bookmark_btn();


            // about this album
            let release_year = 0;
            let release_date = 'never :(';
            let track_count = 'No tracks';
            let album_length = '0:00'

            let meta = page.structure.main.querySelectorAll('.metadata-column .catalogue-metadata-description');
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
                    ${get_wiki()}
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
            let scrobble_count_element = page.structure.main.querySelector('.personal-stats-item--scrobbles .header-metadata-display a');
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
            page.structure.side.insertBefore(your_scrobbles, page.structure.side.firstChild);

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
            page.structure.side.insertBefore(album_stats, page.structure.side.firstChild);;
        } else {
            patch_tab_overview_btn(navlist);

            // which subpage is it?
            let subpage_type = document.body.classList[2].replace('namespace--', '');
            page.subpage = subpage_type;
            deliver_notif(`Subpage type of ${subpage_type}`, true);

            let subpage_title = document.body.querySelector('.subpage-title');
            if (subpage_title == undefined)
                subpage_title = page.structure.main.querySelector(':scope > h2');

            let header_album_data = {
                avatar: album_header.querySelector('.header-new-background-image').getAttribute('content'),
                name: album_header.querySelector('.header-new-title').textContent,
                artist: album_header.querySelector('.header-new-crumb span').textContent,
                artist_link: album_header.querySelector('.header-new-crumb').getAttribute('href'),
                link: album_header.querySelector('.secondary-nav-item--overview a').getAttribute('href'),
                page: subpage_title.textContent
            }
            page.name = header_album_data.name;
            page.sister = header_album_data.artist;

            let new_header = generic_subpage_header(
                header_album_data.avatar,
                header_album_data.page,
                'album'
            );

            page.structure.row.insertBefore(navlist, page.structure.main);
            page.structure.main.insertBefore(new_header, page.structure.main.firstChild);
            album_header.style.setProperty('display', 'none');

            if (subpage_type.includes('wiki')) {
                if (subpage_type.includes('wiki_history')) {
                    bwaa_wiki_history();
                } else {
                    generic_wiki_patch();

                    return;
                }
            }

            document.body.querySelector('.container.page-content').classList.add('subpage');

            if (subpage_type.includes('tags_overview')) {
                generic_tag_patch();
            }
        }
    }

    function bwaa_tracks() {
        let track_header = document.body.querySelector('.header-new--track');

        if (track_header == undefined)
            return;

        if (track_header.hasAttribute('data-bwaa'))
            return;
        track_header.setAttribute('data-bwaa', 'true');

        page.type = 'track';

        let is_subpage = track_header.classList.contains('header-new--subpage');


        page.structure.container = document.body.querySelector('.page-content');
        page.structure.row = page.structure.container.querySelector('.row');
        try {
            page.structure.main = page.structure.row.querySelector('.col-main');
            page.structure.side = page.structure.row.querySelector('.col-sidebar');
        } catch(e) {
            console.info('bwaa - page structure - there was an issue finding elements');
        }

        checkup_page_structure();

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
                            ${trans[lang].track.tabs.overview}
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
            page.subpage = 'overview';
            page.structure.side = page.structure.row.querySelector('.col-sidebar.buffer-standard');
            let track_metadata = track_header.querySelectorAll('.header-metadata-tnew-display');

            let avatar_element = document.body.querySelector('.source-album-art img');
            let avatar = fallback_cover_art;
            if (avatar_element != undefined)
                avatar = avatar_element.getAttribute('src');

            let header_track_data = {
                avatar: avatar,
                name: track_header.querySelector('.header-new-title').textContent,
                artist: track_header.querySelector('.header-new-crumb span').textContent,
                artist_link: track_header.querySelector('.header-new-crumb').getAttribute('href'),
                link: window.location.href,
                plays: abbr_statistic(track_metadata[1].querySelector('abbr')),
                listeners: track_metadata[0].querySelector('abbr').getAttribute('title'),
                primary_album: document.body.querySelector('.source-album-name a')
            }
            page.name = header_track_data.name;
            page.sister = header_track_data.artist;


            let track_video_element = document.body.querySelector('.video-preview');
            let track_video = '';
            if (track_video_element != null)
                track_video = track_video_element.outerHTML;


            let tags_html = '';
            let tags = page.structure.main.querySelectorAll('.tag a');
            let tags_see_more = page.structure.main.querySelector('.tags-view-all');

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

            let first_meta = page.structure.main.querySelector('.catalogue-metadata-description');
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
                        <p>On ${(header_track_data.primary_album != null) ? header_track_data.primary_album.outerHTML : 'no albums'} <strong><a href="${header_track_data.link}/+albums">see all</a></strong></p>
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

            page.structure.row.insertBefore(navlist, page.structure.main);
            page.structure.main.insertBefore(new_header, page.structure.main.firstChild);
            track_header.style.setProperty('display', 'none');

            prep_bookmark_btn();
            prep_love_btn();


            // about this track
            let about_this_track = document.createElement('section');
            about_this_track.classList.add('about-this-track');
            about_this_track.innerHTML = (`
                <h2><a href="${window.location.href}/+wiki">About this track</a></h2>
                <div class="wiki">
                    ${get_wiki()}
                </div>
            `);
            new_header.after(about_this_track);

            // sidebar
            let scrobble_count_element = page.structure.main.querySelector('.personal-stats-item--scrobbles .header-metadata-display a');
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
            page.structure.side.insertBefore(your_scrobbles, page.structure.side.firstChild);

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
            page.structure.side.insertBefore(track_stats, page.structure.side.firstChild);
        } else {
            patch_tab_overview_btn(navlist);

            // which subpage is it?
            let subpage_type = document.body.classList[2].replace('namespace--', '');
            page.subpage = subpage_type;
            deliver_notif(`Subpage type of ${subpage_type}`, true);

            let subpage_title = document.body.querySelector('.subpage-title');
            if (subpage_title == undefined)
                subpage_title = page.structure.main.querySelector(':scope > h2');

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
            page.name = header_track_data.name;
            page.sister = header_track_data.artist;

            let new_header = generic_subpage_header(
                header_track_data.avatar,
                header_track_data.page,
                'track'
            );

            page.structure.row.insertBefore(navlist, page.structure.main);
            page.structure.main.insertBefore(new_header, page.structure.main.firstChild);
            track_header.style.setProperty('display', 'none');

            if (subpage_type.includes('wiki')) {
                if (subpage_type.includes('wiki_history')) {
                    bwaa_wiki_history();
                } else {
                    generic_wiki_patch();

                    return;
                }
            }

            document.body.querySelector('.container.page-content').classList.add('subpage');

            if (subpage_type.includes('tags_overview')) {
                generic_tag_patch();
            }
        }
    }


    /**
     * subpage header creator for profiles, artists, albums, and tracks
     * @param {string} avatar avatar url
     * @param {string} header_title main header text
     * @param {string} link_type type of header, controls how top link is created (defaults to user)
     * @returns subpage header
     */
    function generic_subpage_header(avatar, header_title, link_type='user') {
        // determines top text link
        let link_field = `<a href="${root}user/${sanitise(page.name)}">${page.name}</a>`;

        // not a user
        if (link_type == 'artist')
            link_field = `<a href="${root}music/${sanitise(page.name)}">${page.name}</a>`;
        else if (link_type == 'album')
            link_field = `<a href="${root}music/${sanitise(page.sister)}/${sanitise(page.name)}">${page.name}</a>`;
        else if (link_type == 'track')
            link_field = `<a href="${root}music/${sanitise(page.sister)}/_/${sanitise(page.name)}">${page.name}</a>`;

        let new_header = document.createElement('section');
        new_header.classList.add('profile-header-subpage-section');
        new_header.innerHTML = (`
            <div class="badge-avatar">
                <img src="${avatar}" alt="${page.name}">
            </div>
            <div class="badge-info">
                ${link_field}
                <h1 id="artist-subpage-text">${header_title}</h1>
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
     */
    function generic_wiki_patch() {
        let factbox = page.structure.main.querySelector('.factbox');

        page.structure.side.innerHTML = '';
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

        let wiki_author_element = page.structure.main.querySelector('.wiki-author');
        if (wiki_author_element == null)
            return;

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
        let wiki_edit_link = page.structure.main.querySelector('.qa-wiki-edit');
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
        let alerts = page.structure.main.querySelectorAll('.alert');
        alerts.forEach((alert) => {
            factbox.appendChild(alert);
        });

        page.structure.side.appendChild(factbox);
    }


    /**
     * patch wiki history to fit
     */
    function bwaa_wiki_history() {
        page.structure.container = document.body.querySelector('.page-content');
        let buffer_to_remove = page.structure.container.querySelector('.row + .buffer-4');

        let table = buffer_to_remove.querySelector('.wiki-history');
        let pagination = buffer_to_remove.querySelector('.pagination');


        let revision_numbers = table.querySelectorAll('.wiki-history-revision-number');
        revision_numbers.forEach((number) => {
            number.textContent = `Version ${number.textContent}`;
        });


        page.structure.main.appendChild(table);
        if (pagination != null) page.structure.main.appendChild(pagination);

        page.structure.container.removeChild(buffer_to_remove);
    }


    /**
     * retrieves longest wiki content on page
     * @returns retrieved wiki or cta if missing
     */
    function get_wiki() {
        let wiki = page.structure.main.querySelector('.wiki-block.visible-lg');
        if (wiki == null)
            wiki = page.structure.main.querySelector('.wiki-block-cta');

        return wiki.outerHTML;
    }


    /**
     * converts tag page on artists/albums/tracks into a tag cloud
     */
    function generic_tag_patch() {
        let tag_section_container = page.structure.main.querySelector('.profile-header-subpage-section + section');

        // similar albums?
        let similar_albums = page.structure.main.querySelector('.similar-albums-body');
        if (similar_albums != null)
            page.structure.main.removeChild(similar_albums);

        // buffer standard in between
        let buffer = page.structure.main.querySelector(':scope > .buffer-standard');
        if (buffer != null)
            page.structure.main.removeChild(buffer);

        let btn_add = tag_section_container.querySelector('.btn-add');
        if (btn_add != null) {
            btn_add.classList.add('btn-add-tag');
            btn_add.innerHTML = '<strong>Tag</strong>';
        }

        let tags = tag_section_container.querySelectorAll('.big-tags-item-name a');

        // let's make a new one now we have the info
        let new_tag_section = document.createElement('section');
        new_tag_section.classList.add('tag-section');

        let tag_cloud = document.createElement('div');
        tag_cloud.classList.add('tag-cloud');

        tags.forEach((tag) => {
            tag.classList.remove('link-block-target');
            tag.classList.add('tag-cloud-item');

            tag.setAttribute('data-tag', tag.textContent.trim());

            tag_cloud.appendChild(tag);
        });

        new_tag_section.appendChild(tag_cloud);

        if (btn_add != null)
            new_tag_section.appendChild(btn_add);

        page.structure.main.appendChild(new_tag_section);
        page.structure.main.removeChild(tag_section_container);
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

        let uploaded_image_title = document.querySelector('.gallery-image-title');

        let artist_subpage_text = document.getElementById('artist-subpage-text');
        artist_subpage_text.textContent = `${document.querySelector('.subpage-title').textContent.trim()}: ${uploaded_image_title.textContent}`;

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
    /**
     * loads settings from localStorage, applies to page, then stores as 'settings' variable
     */
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




    /**
     * actual obsession view
     */
    function bwaa_obsessions() {
        let obsession_container = document.querySelector('.obsession-container:not([data-bwaa="true"])');

        if (obsession_container == null)
            return;

        obsession_container.setAttribute('data-bwaa', 'true');

        page.structure.container = obsession_container.querySelector('.page-content');
        page.structure.container.classList.add('subpage');

        let row = document.createElement('div');
        page.structure.row.classList.add('row');

        page.structure.main = document.createElement('div');
        page.structure.main.classList.add('col-main');

        let obsession_wrap = page.structure.container.querySelector('.obsession-details-wrap');


        let obsession_author = obsession_wrap.querySelector('.obsession-details-intro a').textContent;

        let new_header = generic_subpage_header(
            obsession_wrap.querySelector('.obsession-details-intro-avatar-wrap img').getAttribute('src'),
            `Music <a href="${root}user/${obsession_author}/obsessions">Obsession</a>`
        );


        let next = page.structure.container.querySelector('.obsession-pagination-next a');
        let previous = page.structure.container.querySelector('.obsession-pagination-previous a');

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
        page.structure.row.appendChild(navlist_switcher);
        page.structure.main.appendChild(new_header);
        page.structure.main.appendChild(obsession_wrap);

        page.structure.row.appendChild(page.structure.main);

        page.structure.container.appendChild(row);

        let adaptive_skin = document.querySelector('.adaptive-skin-container');
        let content_top = adaptive_skin.querySelector('.content-top');
        adaptive_skin.removeChild(content_top);
    }




    /**
     * global last.fm settings injector, used to remove .content-form styling and inject bwaa navlist
     */
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

        page.type = 'settings';
        page.name = auth;

        page.structure.container = document.querySelector('.page-content');

        if (page.structure.container.hasAttribute('data-bwaa'))
            return;
        page.structure.container.setAttribute('data-bwaa', 'true');
        page.structure.container.classList.add('lastfm-settings', 'subpage');

        let row = page.structure.container.querySelector(':scope > .row');


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
        page.structure.row.insertBefore(navlist_switcher, page.structure.row.firstElementChild);


        page.structure.main = page.structure.row.querySelector('.col-main');

        let adaptive_skin = document.querySelector('.adaptive-skin-container');
        let content_top = adaptive_skin.querySelector('.content-top');

        let navlist = content_top.querySelector('.navlist');
        page.structure.main.insertBefore(navlist, page.structure.main.firstElementChild);

        adaptive_skin.removeChild(content_top);

        let new_header = generic_subpage_header(
            my_avi,
            'Your Account Settings'
        );
        page.structure.main.insertBefore(new_header, page.structure.main.firstElementChild);
    }




    function bwaa_settings() {
        console.info('bwaa - loading custom settings');
        let adaptive_skin = document.querySelector('.adaptive-skin-container:not([data-bwaa="true"])');

        if (adaptive_skin == null)
            return;
        adaptive_skin.setAttribute('data-bwaa', 'true');

        page.type = 'bwaa_settings';
        page.name = auth;

        adaptive_skin.innerHTML = '';
        document.title = 'configure your bwaa | Last.fm';

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
                                    <a class="secondary-nav-item-link bwaa-settings-tab" data-bwaa-tab="about" onclick="_change_settings_page('about')">
                                        About
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

    /**
     * render a bwaa settings page
     * @param {string} page page id (eg. home)
     * @param {element} injector element to create html inside of
     */
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
                                    All personal preference, check out <a href="${root}music/Nirvana" target="_blank">Nirvana</a>’s <a href="${root}music/Nirvana/Nevermind" target="_blank">Nevermind</a> or more fittingly <a href="${root}music/Kanye+West" target="_blank">Kanye</a>’s <a href="${root}music/Kanye+West/Yeezus" target="_blank">Yeezus</a> for an example.
                                </div>
                            </div>
                        </div>
                        <div class="sep"></div>
                        <h3 class="control-label">Newer feature visibility</h3>
                        <div class="form-group">
                            <div class="checkbox">
                                <label for="setting--hide_obsessions">
                                    <input id="setting--hide_obsessions" type="checkbox" onchange="_notify_checkbox_change(this)">
                                    Hide obsessions
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="checkbox">
                                <label for="setting--hide_your_progress">
                                    <input id="setting--hide_your_progress" type="checkbox" onchange="_notify_checkbox_change(this)">
                                    Hide your weekly progress
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="checkbox">
                                <label for="setting--hide_listening_reports">
                                    <input id="setting--hide_listening_reports" type="checkbox" onchange="_notify_checkbox_change(this)">
                                    Hide listening reports
                                </label>
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
                        <div class="form-group">
                            <div class="checkbox">
                                <label for="setting--hide_extra_grid_item">
                                    <input id="setting--hide_extra_grid_item" type="checkbox" onchange="_notify_checkbox_change(this)">
                                    Hide extra grid item on profiles
                                </label>
                                <div class="alert">
                                    If your top artists/albums display is set to ‘default’, an extra grid item will display otherwise.
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
                                    Hide notifications, only display inbox
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
                    <div class="more-link align-right">
                        <a onclick="_register_activity('test', ['cutensilly'])">Register a new test activity</a>
                    </div>
                    <div class="more-link align-right">
                        <a onclick="_register_activity('shout', [{name: 'LAST.HQ', type: 'user'}], '${root}user/LAST.HQ')">Register a new shout activity</a>
                    </div>
                    <div class="more-link align-right">
                        <a onclick="_register_activity('image_upload', [{name: 'Sabrina Carpenter', type: 'artist'}], '${root}music/Sabrina+Carpenter/+images/blaflasf')">Register a new image upload activity</a>
                    </div>
                    <div class="more-link align-right">
                        <a onclick="_register_activity('shout', [{name: 'Short n\\' Sweet', type: 'album', sister: 'Sabrina Carpenter'}], '${root}music/Sabrina+Carpenter/+images/blaflasf')">Register a new shout (album) activity</a>
                    </div>
                    <div class="more-link align-right">
                        <a onclick="_register_activity('obsess', [{name: 'Taste', type: 'album', sister: 'Sabrina Carpenter'}], '${root}music/Sabrina+Carpenter/+images/blaflasf')">Register a new obsession activity</a>
                    </div>
                    <div class="more-link align-right">
                        <a onclick="_register_activity('shout', [{name: 'cutensilly', type: 'user'}, {name: 'cutensilly', type: 'user'}, {name: 'cutensilly', type: 'user'}], '${root}user/LAST.HQ')">Register a new shout activity</a>
                    </div>
                </section>
            `);

            request_checkbox_update();
        } else if (page == 'corrections') {
            injector.innerHTML = (`
                <section id="welcome" class="form-section settings-form">
                    <h2 class="form-header">Media Corrections</h2>
                    <div class="alert">In-built capitalisation corrections for artists, albums, and tracks are <strong>currently not supported</strong>. Sorry for the inconvenience.</div>
                    <div class="more-link align-left space-self">
                        <a href="https://github.com/katelyynn/bleh/issues/new" target="_blank">Submit a correction in bleh</a>
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
        } else if (page == 'about') {
            injector.innerHTML = (`
                <section id="welcome" class="form-section settings-form">
                    <h2 class="form-header">About</h2>
                    <p>bwaa is an extension for Last.fm by <a href="${root}user/cutensilly">cutensilly</a> with the aim to bring back the 2012 look of Last.fm. At the moment, it is a one girl project - but community contributions are welcome! <i class="subtext">(if the code is readable that is)</i></p>
                    <div class="alert alert-danger">
                        bwaa is beta software, this is a large project so adjust your expectations to fit <3
                    </div>
                    <fieldset>
                        <legend>Did you find a bug?</legend>
                        <div class="form-group">
                            <div class="more-link align-left space-self">
                                <a href="https://github.com/katelyynn/bwaa/issues/" target="_blank">Submit a report or browse for one existing</a>
                            </div>
                        </div>
                        <div class="alert">
                            If you are using an ESR version of Firefox, please consider switching to the usual stable builds for stability.
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>How can I support?</legend>
                        <div class="form-group">
                            <p>At the moment, the best way to support is sharing the word around to others you think may enjoy and giving the project a star.</p>
                            <p>If you would like to donate, that will be available in the future but that is obviously not expected.</p>
                            <div class="more-link align-left space-self">
                                <a href="https://github.com/katelyynn/bwaa/" target="_blank">Star the project</a>
                            </div>
                        </div>
                    </fieldset>
                </section>
            `);
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




    /**
     * creates the realistic 2012-esc footer
     */
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
                <strong>bwaa</strong> is a creation by <a href="${root}user/cutensilly">cutensilly</a> in an attempt to restore the look of Last.fm during 2012. All original works are by Last.fm. Re-creations found within the script and stylesheet are based on Last.fm's designs with some flair of my own where applicable. <a href="https://github.com/katelyynn/bwaa/issues">bwaa is early software, stability is not guaranteed.</a>
            </div>
        `);

        footer_container.appendChild(bwaa_legal);
    }




    /**
     * profile library component
     */
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
    /**
     * very small profile library header function to replace separators with '|'
     */
    function bwaa_library_header() {
        let library_header = document.querySelector('.library-header:not([data-bwaa])');

        if (library_header == null)
            return;
        library_header.setAttribute('data-bwaa', 'true');

        library_header.innerHTML = library_header.innerHTML.replaceAll('·', '|');
    }




    /**
     * first-time bwaa setup loader
     */
    function bwaa_setup() {
        console.info('bwaa - loading first-time setup');
        let adaptive_skin = document.querySelector('.adaptive-skin-container:not([data-bwaa="true"])');

        if (adaptive_skin == null)
            return;
        adaptive_skin.setAttribute('data-bwaa', 'true');

        page.type = 'bwaa_settings';
        page.name = auth;

        deliver_notif(`bwaa has installed successfully, welcome aboard!`);

        adaptive_skin.innerHTML = '';
        document.title = 'first-time bwaa | Last.fm';

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
                                            Keep in mind, this will hide features such as obsessions, listening reports, and more. This is configurable on a case-by-case basis in <a href="${root}bwaa">the settings</a>.
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
                                <div class="alert">If you find yourself enjoying bwaa, share the word around to others! You can additionally <a href="https://github.com/katelyynn/bwaa" target="_blank">star the project</a> <i class="subtext">(if you have GitHub)</i> if you would like. <3</alert>
                            </fieldset>
                        </section>
                    </div>
                </div>
            </div>
        `);
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

    /**
     * fixes modals not inheriting styles by creating a temporary element to trigger reflow or whatever
     */
    function fix_modal() {
        let fix = document.createElement('div');
        fix.classList.add('modal-fixer');
        fix.style.setProperty('display', 'none');

        document.body.appendChild(fix);

        setTimeout(function() {
            document.body.removeChild(fix);
        }, 10);
    }




    /**
     * notify user if new update and stores in localStorage for next time
     * @returns if first-time installing, redirect to setup
     */
    function notify_if_new_update() {
        let last_version_used = localStorage.getItem('bwaa_last_version_used') || '';

        // enter first-time setup
        if (last_version_used == '') {
            window.location.href = `${root}bwaa/setup`;
            localStorage.setItem('bwaa_last_version_used', version.build);
            register_activity('install_bwaa', [], `${root}bwaa`);
            return;
        }

        // otherwise, it's a usual update
        if (last_version_used != version.build) {
            deliver_notif(`bwaa has updated to ${version.build}.${version.sku}, welcome aboard!`, false, false, true);
            register_activity('update_bwaa', [{name: version.build, type: 'bwaa'}], `${root}bwaa`);
            localStorage.setItem('bwaa_last_version_used', version.build);
        }
    }




    /**
     * if legacy_cover_art is enabled, cover arts will be ran thru and replaced if contained in 'legacy_cover_art' array, along with replacing fallback artwork
     */
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

            // or maybe it's blank?
            if (
                url_split[6] == '4128a6eb29f94943c9d206c08e625904.jpg' || // track
                url_split[6] == 'c6f59c1e5e7240a4c0d427abd71f3dbb.jpg' // album
            ) {
                media_item.setAttribute('src', fallback_cover_art);
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

            // or maybe it's blank?
            if (
                url_split[6] == '4128a6eb29f94943c9d206c08e625904.jpg' || // track
                url_split[6] == 'c6f59c1e5e7240a4c0d427abd71f3dbb.jpg' // album
            ) {
                chartlist_image.setAttribute('src', fallback_cover_art);
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

            // or maybe it's blank?
            if (
                url_split[6] == '4128a6eb29f94943c9d206c08e625904.jpg' || // track
                url_split[6] == 'c6f59c1e5e7240a4c0d427abd71f3dbb.jpg' // album
            ) {
                grid_image.setAttribute('src', fallback_cover_art);
            }
        });

        let cover_arts = document.querySelectorAll('.cover-art img:not([data-bwaa])');
        cover_arts.forEach((cover_art) => {
            cover_art.setAttribute('data-bwaa', 'true');

            let url = cover_art.getAttribute('src');
            let url_split = url.split('/');

            if (legacy_cover_art.hasOwnProperty(url_split[6])) {
                cover_art.setAttribute('src', url.replace(url_split[6], legacy_cover_art[url_split[6]]));
            }

            // or maybe it's blank?
            if (
                url_split[6] == '4128a6eb29f94943c9d206c08e625904.jpg' || // track
                url_split[6] == 'c6f59c1e5e7240a4c0d427abd71f3dbb.jpg' // album
            ) {
                cover_art.setAttribute('src', fallback_cover_art);
            }
        });
    }

    function request_media_item_check(url) {
        let url_split = url.split('/');

        if (legacy_cover_art.hasOwnProperty(url_split[6])) {
            return url.replace(url_split[6], legacy_cover_art[url_split[6]]);
        }

        // or maybe it's blank?
        if (
            url_split[6] == '4128a6eb29f94943c9d206c08e625904.jpg' || // track
            url_split[6] == 'c6f59c1e5e7240a4c0d427abd71f3dbb.jpg' // album
        ) {
            return fallback_cover_art;
        }

        return url;
    }




    /**
     * create playlist view
     */
    function bwaa_playlists() {
        console.info('bwaa - playlists');

        // are we on a playlist?
        let playlist_header = document.querySelector('.playlisting-playlist-header:not([data-bwaa])');

        if (playlist_header == null)
            return;
        playlist_header.setAttribute('data-bwaa', 'true');

        console.info('bwaa - user is on a playlist');

        page.structure.container = document.body.querySelector('.page-content');
        page.structure.row = page.structure.container.querySelector('.row');
        page.structure.main = page.structure.row.querySelector('.col-main');


        let playlist_info = {
            cover: playlist_header.querySelector('.playlisting-playlist-header-image').getAttribute('src'),
            user_name: playlist_header.querySelector('.subpage-breadcrumb a').textContent,
            name_form: playlist_header.querySelector('.inplace-form'),
            play_btn: playlist_header.querySelector('.js-playlink-station'),
            menu: playlist_header.querySelector('.dropdown-menu-clickable')
        }
        playlist_info.publishing_btn = playlist_info.menu.querySelector('li:first-child > div');
        playlist_info.delete_btn = playlist_info.menu.querySelector('li:nth-child(2) > div');
        playlist_info.export_btn = playlist_info.menu.querySelector('li:nth-child(3) > div');

        let new_header = generic_subpage_header(
            my_avi,
            'Playlists'
        );

        let navlist = document.createElement('nav');
        navlist.classList.add('navlist', 'secondary-nav', 'navlist--more');
        navlist.setAttribute('aria-label', 'Secondary navigation');
        navlist.setAttribute('data-require', 'components/collapsing-nav-v2');

        let base_link = `${root}user/${playlist_info.user_name}`;

        navlist.innerHTML = (`
            <ul class="navlist-items js-navlist-items" style="position: relative;">
                <li class="navlist-item secondary-nav-item secondary-nav-item--overview">
                    <a class="secondary-nav-item-link" href="${base_link}">
                        Overview
                    </a>
                </li>
                <li class="navlist-item secondary-nav-item secondary-nav-item--listening-report">
                    <a class="secondary-nav-item-link" href="${base_link}/listening-report">
                        Reports
                    </a>
                </li>
                <li class="navlist-item secondary-nav-item secondary-nav-item--library">
                    <a class="secondary-nav-item-link" href="${base_link}/library">
                        Library
                    </a>
                </li>
                <li class="navlist-item secondary-nav-item secondary-nav-item--playlists">
                    <a class="secondary-nav-item-link secondary-nav-item-link--active" href="${base_link}/playlists">
                        Playlists
                    </a>
                </li>
                <li class="navlist-item secondary-nav-item secondary-nav-item--following">
                    <a class="secondary-nav-item-link" href="${base_link}/following">
                        Following
                    </a>
                </li>
                <li class="navlist-item secondary-nav-item secondary-nav-item--followers">
                    <a class="secondary-nav-item-link" href="${base_link}/followers">
                        Followers
                    </a>
                </li>
                <li class="navlist-item secondary-nav-item secondary-nav-item--loved">
                    <a class="secondary-nav-item-link" href="${base_link}/loved">
                        Loved Tracks
                    </a>
                </li>
                <li class="navlist-item secondary-nav-item secondary-nav-item--obsessions">
                    <a class="secondary-nav-item-link" href="${base_link}/obsessions">
                        Obsessions
                    </a>
                </li>
                <li class="navlist-item secondary-nav-item secondary-nav-item--events">
                    <a class="secondary-nav-item-link" href="${base_link}/events">
                        Events
                    </a>
                </li>
                <li class="navlist-item secondary-nav-item secondary-nav-item--neighbours">
                    <a class="secondary-nav-item-link" href="${base_link}/neighbours">
                        Neighbours
                    </a>
                </li>
                <li class="navlist-item secondary-nav-item secondary-nav-item--tags">
                    <a class="secondary-nav-item-link" href="${base_link}/tags">
                        Tags
                    </a>
                </li>
                <li class="navlist-item secondary-nav-item secondary-nav-item--shoutbox">
                    <a class="secondary-nav-item-link" href="${base_link}/shoutbox">
                        Shouts
                    </a>
                </li>
                <li class="navlist-item secondary-nav-item secondary-nav-item--journal">
                    <a class="secondary-nav-item-link" href="${base_link}/journal">
                        Journal
                    </a>
                </li>
            </ul>
        `);


        // grab the playlist name field h1
        /*let inplace_name_field_wrapper = playlist_info.name_form.querySelector('.inplace-field--wrapper');
        let inplace_name_field = playlist_info.name_form.querySelector('.inplace-field');
        // let's make a clone of it as an input
        let inplace_name_field_clone = document.createElement('input');
        inplace_name_field_clone.setAttribute('placeholder', inplace_name_field.getAttribute('placeholder'));
        inplace_name_field_clone.setAttribute('maxlength', inplace_name_field.getAttribute('maxlength'));
        inplace_name_field_clone.setAttribute('data-h1-to-copy-to', 'playlist-name-field');
        inplace_name_field_clone.setAttribute('data-textbox-to-copy-to', 'playlist-title');
        inplace_name_field_clone.setAttribute('name', 'title');
        inplace_name_field_clone.setAttribute('oninput', '_update_textbox(this)');
        inplace_name_field_clone.value = inplace_name_field.textContent;

        inplace_name_field.setAttribute('id', 'playlist-name-field');
        inplace_name_field.removeAttribute('aria-labelledby');
        inplace_name_field_wrapper.appendChild(inplace_name_field_clone);*/


        let playlist_section = document.createElement('section');
        playlist_section.classList.add('playlist-view-section');
        playlist_section.innerHTML = (`
            <div class="name-top">
                ${playlist_info.name_form.outerHTML}
                <div class="alert alert-side">
                    While typing, the input box will lose focus but your inputs are saved!
                </div>
            </div>
            <div class="cover-and-desc">
                <div class="cover">
                    <img src="${playlist_info.cover}">
                </div>
                <div class="desc">
                    ${page.structure.main.querySelector('form').outerHTML}
                </div>
            </div>
            <div class="alert">This page is a work in progress</div>
        `);
        page.structure.main.insertBefore(playlist_section, page.structure.main.firstElementChild);

        let adaptive_skin = document.querySelector('.adaptive-skin-container');

        page.structure.row.insertBefore(navlist, page.structure.main);
        page.structure.main.insertBefore(new_header, page.structure.main.firstChild);
        adaptive_skin.removeChild(playlist_header);
    }

    unsafeWindow._update_textbox = function(element) {
        let companion = document.getElementById(element.getAttribute('data-h1-to-copy-to'));
        let companion_textbox = document.getElementById(element.getAttribute('data-textbox-to-copy-to'));

        companion.textContent = element.value;
        companion_textbox.value = element.value;
        companion.dispatchEvent(new Event('focus'));
        companion.dispatchEvent(new Event('paste'));
        companion.dispatchEvent(new Event('keydown'));
        companion.dispatchEvent(new Event('input'));
        companion_textbox.dispatchEvent(new Event('input'));
    }




    /**
     * creates profile obsession list by looping thru obsession items and created grid-items
     */
    function bwaa_obsessions_list() {
        let obsession_list = document.createElement('section');
        obsession_list.classList.add('obsession-list', 'grid-items');

        let obsessions = document.querySelectorAll('.obsession-history-item-inner');
        obsessions.forEach((obsession) => {
            let cover_original = obsession.querySelector('.obsession-history-item-background').getAttribute('style').trim();
            let cover_substr = cover_original.indexOf('url');
            let cover = cover_original.substring(cover_substr).replace('url(', '').replace(');', '').trim();

            let link = obsession.querySelector('.obsession-history-item-heading-link').getAttribute('href');

            let track_name = obsession.querySelector('.obsession-history-item-heading').textContent.trim();
            let artist_name = obsession.querySelector('.obsession-history-item-artist a');
            let obsession_date = obsession.querySelector('.obsession-history-item-date a').textContent.trim();

            let obsession_is_first = (obsession.querySelector('.obsession-first') != null);


            let obsession_item = document.createElement('li');
            obsession_item.classList.add('grid-items-item', 'link-block');
            obsession_item.innerHTML = (`
                <div class="grid-items-cover-image">
                    <div class="grid-items-cover-image-image">
                        <img src="${cover}" alt="Image for '${track_name}'" loading="lazy">
                        ${(obsession_is_first) ? `<div class="image-sticker first-obsession">#1</div>` : ''}
                    </div>
                    <div class="grid-items-item-details">
                        <p class="grid-items-item-main-text">
                            <a class="link-block-target" href="${link}" title="${track_name}">
                                ${track_name}
                            </a>
                        </p>
                        <p class="grid-items-item-aux-text">
                            <a class="grid-items-item-aux-block" href="${artist_name}">
                                ${artist_name.textContent.trim()}
                            </a>
                            <a href="${link}">
                                ${obsession_date}
                            </a>
                        </p>
                    </div>
                    <a class="link-block-cover-link" href="${link}" tabindex="-1" aria-hidden="true"></a>
                </div>
            `);

            obsession_list.appendChild(obsession_item);
        });

        page.structure.main.appendChild(obsession_list);

        let obsession_btn_section = document.createElement('div');
        obsession_btn_section.classList.add('obsession-button-section');

        let section_controls = document.querySelector('.section-controls');
        let obsession_btn = section_controls.querySelector('.section-controls .btn-primary');
        if (obsession_btn != null)
            obsession_btn_section.appendChild(obsession_btn);
        page.structure.container.removeChild(section_controls);

        let pagination = document.querySelector('.pagination');
        if (pagination != null)
            obsession_btn_section.appendChild(pagination);

        page.structure.main.appendChild(obsession_btn_section);


        // remove leftovers
        let row_buffer = document.querySelector('.page.structure.row._buffer');
        page.structure.container.removeChild(row_buffer);
    }




    /**
     * abbreviate scrobble statistic if necessary
     * @param {element} element specifically an artist/album/track SCROBBLE count's .abbr element
     * @returns abbreviated scrobble count if over 100M or raw count
     */
    function abbr_statistic(element) {
        let count = parseInt(element.getAttribute('title').replaceAll(',', '').replaceAll('.', ''));

        console.info(count);

        if (count >= 100_000_000)
            return element.textContent;
        else
            return element.getAttribute('title');
    }




    function load_activities() {
        recent_activity_list = JSON.parse(localStorage.getItem('bwaa_recent_activity')) || [];
        console.info('bwaa - loaded recent activities', recent_activity_list);

        // check if over 10
        check_activities_length();

        console.info('bwaa - saved recent activities', recent_activity_list);
        localStorage.setItem('bwaa_recent_activity', JSON.stringify(recent_activity_list));
    }

    function check_activities_length() {
        if (recent_activity_list.length > 10) {
            let to_delete = recent_activity_list.length - 10;

            recent_activity_list.splice(0, to_delete);
            console.info('bwaa - list was over 10, removed leftovers');
        }

        return recent_activity_list;
    }

    unsafeWindow._register_activity = function(type, involved, context, date=new Date()) {
        register_activity(type, involved, context, date);
    }
    function register_activity(type, involved, context, date=new Date()) {
        recent_activity_list.push({
            type: type,
            involved: involved,
            context: context,
            date: date
        });

        console.info('bwaa - registered new activity', {
            type: type,
            involved: involved,
            context: context,
            date: date
        });

        // check if over 10
        check_activities_length();

        console.info('bwaa - saved recent activities', recent_activity_list);
        localStorage.setItem('bwaa_recent_activity', JSON.stringify(recent_activity_list));
    }




    function subscribe_to_events() {
        let love_track = document.body.querySelectorAll(`form[action$="${auth}/loved"]:not([data-bwaa-subscribed])`);
        love_track.forEach((form) => {
            form.setAttribute('data-bwaa-subscribed', 'true');

            let track = form.querySelector('[name="track"]').getAttribute('value');
            let artist = form.querySelector('[name="artist"]').getAttribute('value');

            let btn = form.querySelector('button');

            btn.addEventListener('click', (event) => {
                console.info('bwaa - heard event', event);

                let action = btn.getAttribute('data-analytics-action');

                register_activity((action == 'LoveTrack') ? 'love' : 'unlove', [{name: track, type: 'track', sister: artist}], `${root}music/${sanitise(artist)}/_/${sanitise(track)}`);

                if (page.type == 'track')
                    update_love_btn(btn);
            }, false);
        });


        let bookmark_item = document.body.querySelectorAll(`form[action="/music/+bookmarks"]:not([data-bwaa-subscribed])`);
        bookmark_item.forEach((form) => {
            form.setAttribute('data-bwaa-subscribed', 'true');

            let btn = form.querySelector('button');

            btn.addEventListener('click', (event) => {
                console.info('bwaa - heard event', event);

                let action = btn.getAttribute('data-analytics-action');

                register_activity((action.startsWith('Bookmark')) ? 'bookmark' : 'unbookmark', [{name: page.name, type: page.type, sister: page.sister}], window.location.href);

                update_bookmark_btn(btn);
            }, false);
        });


        let obsess = document.body.querySelectorAll(`.settings-form form[action$="${auth}/obsessions"]:not([data-bwaa-subscribed])`);
        obsess.forEach((form) => {
            form.setAttribute('data-bwaa-subscribed', 'true');

            let track = form.querySelector('[name="name"]').getAttribute('value');
            let artist = form.querySelector('[name="artist_name"]').getAttribute('value');

            let btn = form.querySelector('button');

            btn.addEventListener('click', (event) => {
                console.info('bwaa - heard event', event);

                // TODO: investigate this may be firing twice
                register_activity('obsess', [{name: track, type: 'track', sister: artist}], window.location.href);
            }, false);
        });


        let post_shouts_btn = document.body.querySelector('.btn-post-shout:not([data-bwaa-subscribed])');
        if (post_shouts_btn != null) {
            post_shouts_btn.setAttribute('data-bwaa-subscribed', 'true');

            post_shouts_btn.addEventListener('click', (event) => {
                console.info('bwaa - heard event', event);

                // wait 0.15s
                window.setTimeout(function() {
                    let actual_btn = event.target.parentElement;

                    let is_loading = actual_btn.classList.contains('btn--loading');
                    console.info('is button loading', is_loading, actual_btn, event.target);

                    if (!is_loading)
                        return;

                    register_activity('shout', [{name: page.name, type: page.type, sister: page.sister}], window.location.href);
                }, 150);
            }, false);
        }


        let save_wiki_form = document.body.querySelector('.wiki-edit-form:not([data-bwaa-subscribed])');
        if (save_wiki_form != null) {
            save_wiki_form.setAttribute('data-bwaa-subscribed', 'true');

            let btn = save_wiki_form.querySelector('.form-submit button');

            btn.addEventListener('click', (event) => {
                console.info('bwaa - heard event', event);

                register_activity('wiki', [{name: page.name, type: page.type, sister: page.sister}], window.location.href);
            }, false);
        }
    }




    unsafeWindow._dev_request_scrobble_since = function() {
        return document.body.querySelector('.header-scrobble-since').textContent.trim();
    }
})();