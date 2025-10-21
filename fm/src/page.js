//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { load_activities, subscribe_to_events } from './activity';
import { settings } from './build/config';
import { log } from './build/log';
import {
    auth,
    auth_link,
    bwaa_url,
    page,
    root,
    setup_url,
    shout_parse_queue,
    sponsor_url
} from './build/page';
import { stored_season } from './build/seasonal';
import { lang, lookup_lang, tl, trans, translation_stats } from './build/trans';
import { dialog, load_dialogs } from './components/dialog';
import {
    correct_artist,
    correct_generic_artist,
    correct_generic_combo,
    correct_generic_combo_no_artist,
    correct_item_by_artist,
    lotus
} from './components/lotus';
import { music_grids } from './components/music_grid';
import { nag_bar } from './components/nag_bar';
import { load_notifications } from './components/notify';
import { patch_titles } from './components/track';
import { load_settings } from './config';
import { theme_version, version } from './main';
import { append_nav } from './navigation';
import { bleh_albums } from './pages/album';
import { bleh_artists } from './pages/artist';
import { bwaa_settings } from './pages/bwaa_config';
import { bleh_setup, notify_if_new_update } from './pages/bleh_setup';
import { bleh_error } from './pages/error';
import { bleh_events } from './pages/event';
import { bleh_gallery, bleh_gallery_upload_check } from './pages/gallery';
import { bleh_home, bleh_home_legacy } from './pages/home';
import { bleh_inbox } from './pages/inbox';
import { bleh_profiles } from './pages/profile';
import { bleh_search } from './pages/search';
import { bleh_tags } from './pages/tag';
import { bleh_tracks } from './pages/track';
import { patch_wiki } from './pages/wiki';
import { start_rain } from './rain';
import { seasonal_timer_end, set_season } from './seasonal';
import {
    parse_shout_queue,
    patch_shouts,
    shout_header,
    shout_messages
} from './shout';
import { ff } from './sku';
import { bleh_sponsor_page, sponsors } from './sponsor';
import { append_style, update_check } from './style';
import { bleh_radio } from './components/radio';
import { bleh_users } from './pages/users';
import { html, render } from 'lighterhtml';
import { bleh_footer } from './footer.js';
import { dialog_extender } from './components/dialog_extender.js';
import { bleh_labs } from './pages/labs.js';
import { load_status } from './components/status.js';
import { load_dismissed } from './components/dismissed.js';
import { oracle_data } from './components/oracle.js';
import { dynamic_theming } from './components/dynamic_theming.js';
import { prepare_music } from './components/music.js';
import { page_menu } from './components/menu.js';
import { seasonal_colour_switch } from './components/settings.js';
import florence from '@tealmiku/florence';

export function bleh() {
    florence({
        page,
        on_head_load: () => {
            append_style();
            favi();
            page.state.previous_title = document.title;
            document.title = '...';
        },
        on_body_load: () => {
            favi();

            auth_link.state = document.querySelector('a.auth-link');
            if (auth_link.state)
                auth.name = auth_link.state
                    .querySelector('img')
                    .getAttribute('alt');

            load_settings();

            dynamic_theming();

            solarium();

            translation_stats();

            page_menu();

            // messaging
            load_dialogs();

            lookup_lang();

            theme_version.state = getComputedStyle(document.body)
                .getPropertyValue('--version-build')
                .replaceAll("'", '')
                .replaceAll('"', ''); // remove quotations

            update_check(false, null);

            load_notifications();
            load_status();

            // load seasonal data
            set_season();

            start_rain();

            load_activities();
            notify_if_new_update();

            lotus();
            oracle_data();
            sponsors();
        },
        on_mutation: main_flow,
        on_page_change: load_page,
        on_subpage_change: () => {
            load_settings();

            if (page.state.settings_reload) {
                page.state.settings_reload = false;
            }

            if (page.structure.indicator) page_indicator();
        },
        on_error: handle_error
    });
}

function solarium() {
    document.body.appendChild(html.node`
        <svg style="position:absolute; width:0; height:0">
            <filter id="solarium" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
                <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.001 0.005"
                    numOctaves="1"
                    seed="17"
                    result="turbulence"
                />
                <feGaussianBlur in="turbulence" stdDeviation="10" result="softMap" />
                <feFlood flood-color="white" result="flood" />
                <feComposite in="flood" in2="SourceAlpha" operator="in" result="circleBase" />
                <feMorphology in="circleBase" operator="erode" radius="0" result="innerCircle" />
                <feGaussianBlur in="innerCircle" stdDeviation="150" result="radialFade" />
                <feComponentTransfer in="radialFade" result="edgeMask">
                    <feFuncR type="table" tableValues="0 1" />
                    <feFuncG type="table" tableValues="0 1" />
                    <feFuncB type="table" tableValues="0 1" />
                </feComponentTransfer>
                <feBlend in="softMap" in2="edgeMask" mode="multiply" result="edgeDistortion" />
                <feDisplacementMap
                    in="SourceGraphic"
                    in2="edgeDistortion"
                    scale="200"
                    xChannelSelector="R"
                    yChannelSelector="G"
                />
            </filter>
        </svg>
    `);
}

function handle_error(e = null) {
    document.body.classList.add('florence-loaded');

    dialog({
        id: 'error',
        title: 'An error has occurred',
        body: html.node`
            <div class="modal-vertical-inner error-inner">
                <div class="bleh-icon" style="--icon: var(--icon-error)"></div>
                <h1>oops.. something broke</h1>
                <p>An error prevented ${version.brand} from finishing loading, it's recommended to leave the page and refresh.</p>
                <pre class="error-info">${e ? html.node`<span class="error-type">${e.name}</span>: ${e.message}` : ''}${e.stack ? html.node`<br><span class="error-stack">${e.stack}</span>` : ''}<br>on: ${page.type}/${page.subpage}<br>    ${window.location.pathname}<br>    ${version.build}</pre>
                <p>It would be helpful if you could report this bug on Github, including the error message above.</p>
            </div>
            <div class="modal-footer">
                <div class="fill"></div>
                <a class="see-more" href="https://github.com/katelyynn/bleh/issues/new/choose" target="_blank">
                    Report bug now
                </a>
                <div class="fill"></div>
            </div>
        `,
        type: 'error'
    });

    if (e != null) {
        log('fatal failure', 'load');
        console.error(
            '\n\n%cBLEH ERROR',
            'font-size: 30px; color: aqua; text-shadow: 0 0 20px white',
            e,
            'BLEH ERROR ABOVE\n^\n^\n^\n^\n^\n^\n^'
        );
    }

    log('current page', 'page', 'info', page);
}

export function handle_error_500() {
    document.body.classList.add('bleh-loaded');
    log('halted as root is inaccessible', 'load');
}

function main_flow() {
    lookup_lang();

    if (page.state.error) return;

    if (page.type == 'artist' || page.type == 'album') {
        bleh_gallery();
        bleh_gallery_upload_check();
    }

    if (
        page.type == 'user' ||
        page.type == 'search' ||
        page.type == 'tag' ||
        page.type == 'events'
    )
        music_grids();

    if (
        page.type == 'user' ||
        page.type == 'artist' ||
        page.type == 'album' ||
        page.type == 'track' ||
        page.type == 'events' ||
        page.type == 'festival' ||
        page.type == 'tag'
    ) {
        patch_shouts();

        if (shout_parse_queue.length > 0) parse_shout_queue();
    }

    if (
        page.type == 'user' ||
        page.type == 'artist' ||
        page.type == 'album' ||
        page.type == 'events' ||
        page.type == 'festival' ||
        page.type == 'tag' ||
        page.type == 'overview' ||
        page.type == 'bookmarks'
    ) {
        patch_titles();
    }

    if (settings.corrections) {
        correct_generic_combo('resource-list--release-list-item');
        correct_generic_combo('similar-albums-item');
        correct_generic_combo('track-similar-tracks-item');
        correct_generic_combo('similar-items-sidebar-item');

        if (page.type == 'bookmarks' || page.type == 'releases') {
            correct_generic_artist('music-bookmarks-artists-item');
            correct_generic_combo('music-bookmarks-albums-item');
        }
    }

    if (page.type == 'overview' && page.subpage == 'music') {
        let items = page.structure.main.querySelectorAll(
            '.music-featured-item:not(.music-featured-tag, [data-passed="true"])'
        );
        items.forEach((item) => {
            item.setAttribute('data-passed', 'true');

            const bg = item.querySelector('.music-featured-item-background');
            if (!bg) return;

            let style = bg.style.getPropertyValue('background-image');
            if (!style) style = bg.style.getPropertyValue('background');
            let cover_substr = style.indexOf('url');
            let cover = style.substring(cover_substr);

            bg.style.setProperty('background', cover);
        });
    }

    shout_messages();

    subscribe_to_events();

    dialog_extender();
}

function load_page(main_content = null) {
    if (page.state.activity_preview_timer)
        clearInterval(page.state.activity_preview_timer);

    page.state.settings_page = '';
    //hideAll({duration: 0});

    if (main_content) {
        auth.pro = !!main_content.querySelector(
            ':scope > .masthead > .masthead-pro-wrap'
        );
    }

    page.structure.notifications.setAttribute('data-auth-open', 'false');

    set_season();
    seasonal_timer_end();

    bleh_footer();

    let masthead = document.body.querySelector('.masthead');
    window.addEventListener('scroll', (e) => {
        detect_scroll();
    });

    detect_scroll();

    function detect_scroll() {
        return;

        if (scroll > 30) masthead.classList.add('scrolled');
        else masthead.classList.remove('scrolled');
    }

    prepare_music();

    detect_mobile();
    page.platform = detect_platform();

    if (window.location.pathname.startsWith(setup_url.replace('{root}', root))) {
        bleh_setup();
    } else if (window.location.pathname.startsWith(sponsor_url.replace('{root}', root))) {
        bleh_sponsor_page();
    } else if (window.location.pathname.startsWith(bwaa_url.replace('{root}', root))) {
        page.type = 'bwaa_settings';
        bwaa_settings();
    } else {
        bleh_error();

        if (page.state.error) {
            append_nav();
            page_title();
            return;
        }

        if (
            page.type == 'user' ||
            page.type == 'artist' ||
            page.type == 'album' ||
            page.type == 'track'
        ) {
            nag_bar();
        }

        if (settings.corrections) {
            if (page.type == 'artist') {
                correct_generic_combo_no_artist('artist-top-albums-item');
            } else if (page.type == 'track') {
                correct_generic_combo('source-album-details');
            }
        }

        if (page.type == 'user') bleh_profiles();
        else if (page.type == 'artist') bleh_artists();
        else if (page.type == 'album') bleh_albums();
        else if (page.type == 'track') bleh_tracks();
        else if (page.type == 'events' || page.type == 'festival')
            bleh_events();
        else if (page.type == 'tag') bleh_tags();
        else if (page.type == 'search') bleh_search();
        else if (page.type == 'inbox') bleh_inbox();
        else if (page.type == 'home') bleh_home_legacy();
        else if (
            page.type == 'overview' ||
            page.type == 'recommended' ||
            page.type == 'releases' ||
            page.type == 'bookmarks' ||
            page.type == 'charts' ||
            page.type == 'settings'
        )
            bleh_home();
        else if (page.type == 'labs') bleh_labs();

        if (page.type == 'user' || page.type == 'events') {
            bleh_users();
        }

        if (
            (page.type == 'artist' ||
                page.type == 'album' ||
                page.type == 'track' ||
                page.type == 'tag') &&
            page.subpage == 'overview'
        )
            patch_wiki();

        if (
            (page.type == 'user' ||
                page.type == 'tag' ||
                page.type == 'events') &&
            (page.subpage == 'overview' || page.subpage == 'event_overview')
        )
            bleh_radio();

        if (page.subpage == 'images_overview') {
            let sort_button = page.structure.main.querySelector(
                '.dropdown-menu-clickable-button'
            );
            let sort_menu = page.structure.main.querySelector(
                '.dropdown-menu-clickable'
            );

            if (sort_button && sort_menu) {
                page.structure.main.insertBefore(
                    html.node`
                    <div class="dropdown-top-wrap">
                        ${sort_button}
                        ${sort_menu}
                    </div>
                `,
                    page.structure.main.firstElementChild
                );
            }
        }

        if (page.subpage == 'image') {
            let images = page.structure.row.querySelectorAll('.gallery-image');
            images.forEach((image) => {
                let star = image.querySelector(
                    '.gallery-image-preferred-container'
                );
                if (!star) return;

                render(
                    star,
                    html`
                        <div class="bleh-icon" />
                        ${tl(trans.starred)}
                    `
                );
            });
        }

        if (['artist', 'album', 'track', 'user', 'tag'].includes(page.type)) {
            if (
                !['user', 'tag'].includes(page.type) &&
                page.subpage.startsWith('shoutbox')
            )
                shout_header(
                    page.structure.main.querySelector('.section-controls')
                );
            else if (page.subpage == 'overview' || page.subpage == 'image')
                shout_header(page.structure.main.querySelector('.shoutbox'));
        }
    }

    seasonal_colour_switch();

    append_nav();

    page_title();

    setTimeout(() => {
        if (page.structure.row) {
            const rect = page.structure.row.getBoundingClientRect();
            const y = rect.top + window.scrollY;

            if (page.structure.rain)
                page.structure.rain.style.setProperty('--y', `${y}px`);
        }
    }, 10);

    setTimeout(() => {
        load_dismissed();
    }, 1000);
}

function page_title() {
    if (ff('page_title')) {
        let template = tl(trans.page_templates.type);
        if (!page.state.error) {
            if (
                (page.type == 'user' ||
                    page.type == 'artist' ||
                    page.type == 'events' ||
                    page.type == 'tag') &&
                page.subpage != 'home'
            )
                template = tl(trans.page_templates.name_type);
            else if (page.type == 'album' || page.type == 'track')
                template = tl(trans.page_templates.name_sister_type);
        }

        let name = page.name;
        let sister = page.sister;

        if (page.type == 'album' || page.type == 'track') {
            name = correct_item_by_artist(name, sister);
            sister = correct_artist(sister);
        } else if (page.type == 'artist') {
            name = correct_artist(name);
        }

        let title;
        if (
            page.subpage != 'overview' &&
            page.subpage != 'event_overview' &&
            page.subpage != 'home' &&
            (page.type == 'user' ||
                page.type == 'artist' ||
                page.type == 'album' ||
                page.type == 'track' ||
                page.type == 'events' ||
                page.type == 'tag')
        )
            title = tl(trans[page.subpage]);

        if (page.type == 'settings' || page.type == 'bleh_settings')
            title = tl(trans.settings);
        else if (page.type == 'bleh_setup') title = tl(trans.bleh_setup);
        else if (page.type == 'bleh_sponsor') title = tl(trans.sponsor);
        else if (page.type == 'search') title = tl(trans.search);
        else if (page.type == 'overview' || page.type == 'home')
            title = tl(trans.home);
        else if (page.type == 'recommended') title = tl(trans.recommendations);
        else if (page.type == 'releases') title = tl(trans.releases);
        else if (page.type == 'events' && page.subpage == 'home')
            title = tl(trans.events);
        else if (page.type == 'bookmarks') title = tl(trans.bookmarks);
        else if (page.type == 'charts') title = tl(trans.charts);
        else if (page.type == 'labs') title = tl(trans.labs.name);
        else if (page.type == 'minis') title = tl(trans.minis);

        if (page.type == 'inbox') {
            if (page.subpage == 'notifications')
                title = tl(trans.notifications);
            else title = tl(trans.messages);
        }

        if (page.subpage.replace('event_', '').startsWith('shoutbox'))
            title = tl(trans.shouts);
        else if (page.subpage.startsWith('library')) title = tl(trans.library);
        else if (page.subpage == 'obsessions_overview')
            title = tl(trans.obsessions);
        else if (page.subpage == 'obsessions_obsession')
            title = tl(trans.obsession);
        else if (page.subpage.startsWith('tags')) title = tl(trans.tags);
        else if (page.subpage.startsWith('listening-report'))
            title = tl(trans.reports);
        else if (page.subpage.startsWith('event_attendance'))
            title = tl(trans.attendance);
        else if (page.subpage == 'event_lineup') title = tl(trans.lineup);
        else if (page.subpage == 'playlists_playlists')
            title = tl(trans.playlists);
        else if (page.subpage == 'auth') title = tl(trans.connect_app);
        else if (page.subpage.startsWith('image') && page.type == 'artist')
            title = tl(trans.photos);
        else if (page.subpage.startsWith('image') && page.type == 'album')
            title = tl(trans.artwork);
        else if (page.subpage.startsWith('listeners'))
            title = tl(trans.listeners);
        else if (page.subpage == 'similar') title = tl(trans.similar_artists);
        else if (page.subpage.startsWith('wiki')) title = tl(trans.wiki);
        else if (page.subpage == 'lyrics') title = tl(trans.lyrics);

        if (page.subpage == 'overview' || page.subpage == 'event_overview') {
            if (page.type == 'user') title = tl(trans.profile);
            else if (page.type == 'artist') title = tl(trans.artist);
            else if (page.type == 'album') title = tl(trans.album);
            else if (page.type == 'track') title = tl(trans.track);
            else if (page.type == 'events') title = tl(trans.event);
            else if (page.type == 'tag') title = tl(trans.tag);
        }

        if (page.state.error) title = tl(trans.error);

        template = template
            .replace('{page}', title)
            .replace('{name}', name)
            .replace('{sister}', sister)
            .replace('{build}', version.build)
            .replace('{sku}', version.sku);

        if (settings.branding_type == 'bleh')
            template = template.replace('{brand}', version.brand);
        else if (settings.branding_type == 'lastfm')
            template = template.replace(
                '{brand}',
                `Last.fm (${version.brand})`
            );

        document.title = template;
    }

    if (page.structure.indicator) page_indicator();
}

function detect_mobile() {
    if (window.innerWidth <= 600) {
        page.mobile = true;

        let theme = document.createElement('meta');
        theme.setAttribute('name', 'theme-color');
        theme.setAttribute('content', '#000000');
        document.head.appendChild(theme);

        let icon = document.head.querySelector('[rel="apple-touch-icon"]');
        icon.setAttribute(
            'href',
            'https://github.com/katelyynn/bleh/raw/uwu/fm/app.png'
        );

        let capable = document.createElement('meta');
        capable.setAttribute('name', 'apple-mobile-web-app-capable');
        capable.setAttribute('content', 'yes');
        document.head.appendChild(capable);

        let manifest = document.createElement('link');
        manifest.setAttribute('rel', 'manifest');
        manifest.setAttribute(
            'href',
            'https://github.com/katelyynn/bleh/raw/uwu/fm/app.webmanifest'
        );
        document.head.appendChild(manifest);
    } else {
        page.mobile = false;
    }
}

function detect_platform() {
    const platform =
        navigator.userAgentData?.platform || navigator.platform || '';
    const ua = navigator.userAgent || '';
    if (/^Win/i.test(platform)) {
        return 'win32';
    } else if (/^Mac/i.test(platform)) {
        return 'darwin';
    } else if (/iP(hone|ad|od)/i.test(ua)) {
        return 'ios';
    } else if (/Android/i.test(ua)) {
        return 'android';
    } else if (/^Linux/i.test(platform) || /Linux/i.test(ua)) {
        return 'linux';
    } else {
        return 'other';
    }
}

function page_indicator() {
    render(
        page.structure.indicator,
        html`
            <div class="bleh">
                <strong>ver</strong>
                <span>${version.brand}</span>
                <span>${version.build}</span>
                <span>${version.sku}</span>
            </div>
            <div class="page">
                <strong>auth</strong>
                <span>${auth.name}</span>
                <span>${lang}</span>
            </div>
            <div class="page">
                <strong onclick=${() => console.info(page)}>page</strong>
                <span>${page.type}</span>
                <span>${page.subpage}</span>
            </div>
            <div class="page">
                <strong></strong>
                <span>${page.name}</span>
                <span>${page.sister}</span>
            </div>
            <div class="page">
                <strong>season</strong>
                <span>${stored_season.id}</span>
                <span>${stored_season.year}</span>
                <span>${stored_season.offset}</span>
            </div>
            <div class="page">
                <strong>solarium</strong>
                <span>${settings.solarium}</span>
            </div>
        `
    );
}

export function update_page() {
    page.structure.container.setAttribute('data-page-type', page.type);
    page.structure.container.setAttribute('data-page-subpage', page.subpage);
    page.structure.container.setAttribute('data-beret', ff('beret'));
    page.structure.container.setAttribute('data-short', ff('short'));
}

function favi() {
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) return;

    favicon.href = 'https://katelyynn.github.io/bwaa/fm/res/favicon.2.ico';
}
