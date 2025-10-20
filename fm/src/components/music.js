//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { html, render } from 'lighterhtml';
import { patch_avatar, style_name_from_badge } from '../avatar';
import { settings } from '../build/config';
import { log } from '../build/log';
import { auth, page, root } from '../build/page';
import { clean_number, romanise, sanitise } from '../build/tools';
import { lang, tl, trans } from '../build/trans';
import { refresh_all } from '../config';
import { create_divider } from '../pages/gallery';
import { ff } from '../sku';
import { parse_scrobbles_as_rank } from './colourful_counts';
import {
    correct_item_by_artist,
    create_correction,
    name_includes,
    smart_title
} from './lotus';
import { register_menu } from './menu';
import { other_listener } from './profile_shortcut';
import tippy from 'tippy.js';
import { Chart } from '../main.js';
import { DateTime } from 'luxon';
import { oracle_credits } from './oracle.js';

unsafeWindow._other_listener = function (id) {
    other_listener(id);
};

export async function show_your_scrobbles() {
    let katsune = ff('katsune');
    show_numbers_on_side(page.type);

    // commonly nsbm pages are stripped of all social interaction and only have three tabs,
    // this is a simple way to detect it
    const page_is_blocked = !page.structure.main.querySelector('#shoutbox');
    log(
        `${page_is_blocked ? 'page is blocked' : 'page is not blocked'}`,
        'music'
    );

    if (page.subpage == 'overview') {
        let tabs = document.createElement('nav');
        tabs.classList.add(
            'navlist',
            'secondary-nav',
            'navlist--more',
            'redesigned-navigation'
        );

        if (page.type == 'artist') {
            tabs.appendChild(html.node`
                <ul class="navlist-items">
                    <li class="navlist-item secondary-nav-item secondary-nav-item--overview">
                        <a class="secondary-nav-item-link secondary-nav-item-link--active" href="${window.location.href}">
                            ${tl(trans.home)}
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--tracks">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+tracks">
                            ${tl(trans.tracks)}
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--albums">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+albums">
                            ${tl(trans.albums)}
                        </a>
                    </li>
                    ${
                        !page_is_blocked ?
                            html.node`
                    <li class="navlist-item secondary-nav-item secondary-nav-item--images">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+images">
                            ${tl(trans.photos)}
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--similar">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+similar">
                            ${tl(trans.similar_artists)}
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--wiki">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+wiki">
                            ${tl(trans.biography)}
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--listeners">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+listeners">
                            ${tl(trans.listeners)}
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--shoutbox">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+shoutbox">
                            ${tl(trans.shouts)}
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--events">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+events">
                            ${tl(trans.events)}
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--tags">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+tags">
                            ${tl(trans.tags)}
                        </a>
                    </li>
                    `
                        :   ''
                    }
                </ul>
            `);
        } else if (page.type == 'album') {
            tabs.appendChild(html.node`
                <ul class="navlist-items">
                    <li class="navlist-item secondary-nav-item secondary-nav-item--overview">
                        <a class="secondary-nav-item-link secondary-nav-item-link--active" href="${window.location.href}">
                            ${tl(trans.home)}
                        </a>
                    </li>
                    ${
                        !page_is_blocked ?
                            html.node`
                    <li class="navlist-item secondary-nav-item secondary-nav-item--wiki">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+wiki">
                            ${tl(trans.wiki)}
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--images">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+images">
                            ${tl(trans.artwork)}
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--shoutbox">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+shoutbox">
                            ${tl(trans.shouts)}
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--tags">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+tags">
                            ${tl(trans.tags)}
                        </a>
                    </li>
                    `
                        :   ''
                    }
                </ul>
            `);
        } else if (page.type == 'track') {
            tabs.appendChild(html.node`
                <ul class="navlist-items">
                    <li class="navlist-item secondary-nav-item secondary-nav-item--overview">
                        <a class="secondary-nav-item-link secondary-nav-item-link--active" href="${window.location.href}">
                            ${tl(trans.home)}
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--albums">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+albums">
                            ${tl(trans.albums)}
                        </a>
                    </li>
                    ${
                        !page_is_blocked ?
                            html.node`
                    <li class="navlist-item secondary-nav-item secondary-nav-item--wiki">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+wiki">
                            ${tl(trans.wiki)}
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--shoutbox">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+shoutbox">
                            ${tl(trans.shouts)}
                        </a>
                    </li>
                    <li class="navlist-item secondary-nav-item secondary-nav-item--tags">
                        <a class="secondary-nav-item-link" href="${window.location.href}/+tags">
                            ${tl(trans.tags)}
                        </a>
                    </li>
                    `
                        :   ''
                    }
                </ul>
            `);
        }

        page.structure.container.insertBefore(tabs, page.structure.row);
        page.structure.tabs = tabs;
    }

    let col_main = page.structure.container.querySelector(
        '.top-overview-panel'
    );
    if (!col_main) col_main = document.body.querySelector('.col-main');

    if (page.type == 'track') {
        let new_panel = document.createElement('section');
        new_panel.classList.add('track-info-panel');
        new_panel.innerHTML = col_main.innerHTML;

        page.structure.main.insertBefore(
            new_panel,
            page.structure.main.firstElementChild
        );

        col_main.style.setProperty('display', 'none');
        // make last-child
        page.structure.row.appendChild(col_main);

        console.info(col_main, new_panel);

        // now redirect later code
        col_main = new_panel;
    }

    // create container
    let top_container = document.createElement('div');
    top_container.classList.add('top-container');
    if (katsune) top_container.classList.add('katsune-button-row');

    let listen_container = document.createElement('div');
    listen_container.classList.add('listen-container');

    const no_auth_callout =
        page.structure.main.querySelector('.catalogue-callout');
    if (no_auth_callout) no_auth_callout.remove();

    // page url
    let page_url = window.location.href;
    let page_url_split = page_url.split('/');
    let page_url_length = page_url_split.length - 1;

    // artist
    let scrobble_page = page_url_split[page_url_length];
    if (page.type == 'album') {
        scrobble_page =
            page_url_split[page_url_length - 1] +
            '/' +
            page_url_split[page_url_length];
    } else if (page.type == 'track') {
        scrobble_page =
            page_url_split[page_url_length - 2] +
            '/_/' +
            page_url_split[page_url_length];
    }

    // you
    let your_listens = {
        name: auth.name,
        listens: 0,
        link: scrobble_page,
        avi: auth.avatar,
        katsune: katsune
    };
    // check to see if you have scrobbles
    let scrobble_button = col_main.querySelector(
        '.personal-stats-item--scrobbles .hidden-xs a'
    );
    if (scrobble_button) {
        your_listens.listens = clean_number(scrobble_button.textContent.trim());
    }
    // create child for u
    create_listen_item(listen_container, your_listens, page.type);

    // profile shortcut :3

    // other user
    if (page.type != 'artist') listen_container.appendChild(create_divider());
    create_listen_item(
        listen_container,
        {
            name: 'other',
            listens: -3,
            link: scrobble_page,
            button: true,
            katsune: katsune
        },
        page.type
    );

    // append
    col_main.insertBefore(listen_container, col_main.firstElementChild);

    if (!katsune)
        col_main.insertBefore(top_container, col_main.firstElementChild);
    else
        page.structure.container
            .querySelector('.bleh-background')
            .after(top_container);

    // other listeners
    if (page.type == 'artist') {
        //
        let other_container = col_main.querySelector(
            '.personal-stats-item--listeners'
        );
        if (other_container) {
            let listen_divider = document.createElement('div');
            listen_divider.classList.add('listen-divider');

            listen_container.appendChild(listen_divider);

            let avatars = other_container.querySelectorAll(
                '.personal-stats-listener-avatar img'
            );
            let count = other_container.querySelector(
                '.header-metadata-display a'
            );

            let other_listeners = {
                name: 'others',
                listens: -2,
                link: scrobble_page,
                avi: avatars,
                count:
                    count != null ? clean_number(count.textContent.trim()) : 5,
                katsune: katsune
            };
            // create child for them
            create_listen_item(listen_container, other_listeners, page.type);
        }
    }

    // interactables on the right
    let interact_container = document.createElement('section');
    interact_container.classList.add('side-actions');

    let text = document.body
        .querySelector('.header-new-title')
        .textContent.replaceAll(' ', '+')
        .replaceAll('&', '%26');

    let artist = document.body.querySelector('.header-new-crumb');
    if (artist != undefined)
        text = `${text}+${artist.textContent.replaceAll(' ', '+').replaceAll('&', '%26')}`;

    // temp probably
    let header_actions = document.body.querySelector('.header-new-actions');

    interact_container.innerHTML = header_actions.innerHTML;

    let buttons = interact_container.querySelectorAll('button');
    buttons.forEach((button) => {
        if (button.classList[0] != 'header-new-playlink')
            button.classList.add('btn', 'side-action');
        else button.classList.add('dropdown-menu-clickable-item');

        if (button.classList[0] == 'header-new-more-button')
            interact_container.removeChild(button.parentElement);

        if (button.classList[1] == 'header-new-love-button') {
            button.setAttribute('data-type', 'love');
            let new_text = document.createElement('span');
            new_text.textContent = tl(trans.love);
            button.appendChild(new_text);
        }
    });
    let links = interact_container.querySelectorAll('a');
    links.forEach((button) => {
        if (button.classList[0] != 'header-new-playlink')
            button.classList.add('btn', 'side-action');
        else button.classList.add('dropdown-menu-clickable-item');
    });

    // obsession
    let obsession_form = header_actions.querySelector(
        'form[action$="obsessions"]'
    );
    if (obsession_form) {
        let obsession_btn = obsession_form.querySelector('button');
        obsession_btn.classList = 'btn side-action';
        obsession_btn.setAttribute('data-type', 'obsession');
        obsession_btn.textContent = tl(trans.obsession);

        interact_container.appendChild(obsession_form);
    }

    if (
        ff('credits') &&
        ff('oracle') &&
        settings.oracle_beta &&
        ['album', 'track'].includes(page.type)
    ) {
        interact_container.appendChild(html.node`
            <button class="btn side-action" data-type="credits" onclick=${() => oracle_credits()}>
                ${tl(trans.credits)}
            </button>
        `);
    }

    // search similar!
    /*let search_btn = document.createElement('a');
    search_btn.classList.add('btn', 'side-action', 'search-similar-btn');
    search_btn.textContent = trans_legacy.en.music.search_variations.name;
    search_btn.href = `${root}search/${page.type}s?q=${text}`;
    search_btn.target = '_blank';

    tippy(search_btn, {
        content: trans_legacy.en.music.search_variations.tooltip
    });

    interact_container.appendChild(search_btn);*/

    const play_btn = interact_container.querySelector('.header-new-playlink');
    if (play_btn) interact_container.removeChild(play_btn);

    if (auth.name) {
        if (!page.mobile)
            page.structure.side.insertBefore(
                interact_container,
                page.structure.side.firstElementChild
            );
        else
            page.structure.main.insertBefore(
                interact_container,
                page.structure.main.firstElementChild
            );
    }

    // new playlist
    const new_playlist = page.structure.side.querySelector(':scope > form');
    if (new_playlist) {
        let header = new_playlist.querySelector('h3');
        header.remove();

        let playlist_button = new_playlist.querySelector('button');
        playlist_button.classList = 'btn side-action';
        playlist_button.setAttribute('data-type', 'playlist');
        playlist_button.textContent = tl(trans.create_playlist);

        interact_container.appendChild(new_playlist);
    }

    const metadata = col_main.querySelector('.metadata-column');
    if (metadata) {
        metadata.classList.remove('hidden-xs');

        let groups = [];

        let headers = metadata.querySelectorAll(
            '.catalogue-metadata-heading:not(.visible-xs)'
        );
        headers.forEach((item, index) => {
            groups[index] = {
                header: item
            };
        });
        let values = metadata.querySelectorAll(
            '.catalogue-metadata-description:not(.visible-xs)'
        );
        values.forEach((item, index) => {
            groups[index].value = item;
        });

        render(
            metadata,
            html`
                ${groups.map(
                    (group) => html.node`
                <div class="metadata-group">
                    ${group.header}
                    ${group.value}
                </div>
            `
                )}
            `
        );

        if (groups.length > 2) {
            if (settings.simulate_scroll) {
                metadata.addEventListener('wheel', (e) => {
                    e.preventDefault();

                    if (e.deltaY > 0) {
                        metadata.scrollBy({
                            top: 0,
                            left: +200,
                            behavior: 'smooth'
                        });
                    } else {
                        metadata.scrollBy({
                            top: 0,
                            left: -200,
                            behavior: 'smooth'
                        });
                    }
                });
            } else {
                metadata.classList.add('no-scroll-simulation');
            }
        }
    }

    if (page_is_blocked) {
        page.structure.main.insertBefore(
            html.node`
            <section class="cta blocked-cta">
                <strong>${tl(trans.blocked_page)}</strong>
            </section>
        `,
            page.structure.main.firstElementChild
        );

        return;
    }

    let play_on;
    let play_links;

    let link_container;
    const link_group = html.node`
        <div class="metadata-row">
            <div class="metadata-group">
                <div class="sub-text music-small-header">
                    ${tl(trans.find_on)}
                </div>
                <div class="music-links" ref=${(el) => (link_container = el)} />
            </div>
        </div>
    `;

    if (page.type == 'track') {
        play_on = page.structure.side.querySelector(
            '.play-this-track-playlinks'
        );
        play_on.parentElement.remove();

        play_links = play_on.querySelectorAll('li');

        play_links.forEach((item) => {
            const link = item.querySelector(
                '.play-this-track-playlink:not(.visible-xs)'
            );

            link.classList.remove('play-this-track-playlink');
            link.classList.add('music-link');

            const replace = item.querySelector('.replace-playlink');

            if (link.classList.contains('play-this-track-playlink--youtube')) {
                link.textContent = 'YouTube';

                if (!settings.music_links.includes('youtube')) return;
            } else if (
                link.classList.contains('play-this-track-playlink--spotify')
            ) {
                link.textContent = 'Spotify';

                if (!settings.music_links.includes('spotify')) return;
            } else if (
                link.classList.contains('play-this-track-playlink--itunes')
            ) {
                link.textContent = 'Apple';

                if (!settings.music_links.includes('itunes')) return;
            }

            if (replace) {
                replace.classList.add('dropdown-menu-clickable-item');
                item.removeChild(replace);

                let menu = tippy(link, {
                    theme: 'context-menu',
                    content: replace,
                    placement: 'right-start',
                    trigger: 'manual',
                    interactive: true,
                    interactiveBorder: 10,
                    offset: [0, 0],
                    appendTo: document.body,

                    onShow(instance) {
                        instance.popper.addEventListener('click', (event) => {
                            instance.hide();
                        });
                    }
                });

                register_menu(link, menu);
            }

            link_container.appendChild(item);
        });

        if (
            ['genius', 'tidal', 'deezer', 'qobuz'].some((service) =>
                settings.music_links.includes(service)
            )
        ) {
            link_container.appendChild(html.node`
                ${
                    settings.music_links.includes('genius') ?
                        html.node`
                    <a class="music-link play-this-track-playlink--genius" href="https://genius.com/search?q=${sanitise(page.sister)}+${sanitise(page.name)}" target="_blank">
                        Genius
                    </a>
                `
                    :   ''
                }
                ${
                    settings.music_links.includes('tidal') ?
                        html.node`
                    <a class="music-link play-this-track-playlink--tidal" href="https://listen.tidal.com/search?q=${sanitise(page.sister, ' ')} ${sanitise(page.name, ' ')}" target="_blank">
                        Tidal
                    </a>
                `
                    :   ''
                }
                ${
                    settings.music_links.includes('deezer') ?
                        html.node`
                    <a class="music-link play-this-track-playlink--deezer" href="https://www.deezer.com/search/${sanitise(page.sister, ' ')} ${sanitise(page.name, ' ')}" target="_blank">
                        Deezer
                    </a>
                `
                    :   ''
                }
                ${
                    settings.music_links.includes('qobuz') ?
                        html.node`
                    <a class="music-link play-this-track-playlink--qobuz" href="https://www.qobuz.com/search/tracks/${sanitise(page.sister, ' ')}%20${sanitise(page.name, ' ')}" target="_blank">
                        Qobuz
                    </a>
                `
                    :   ''
                }
            `);
        }
    } else {
        if (page.type == 'album') {
            render(
                link_container,
                html`
                    ${settings.music_links.includes('spotify') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--spotify"
                                href="https://open.spotify.com/search/${sanitise(
                                    page.sister,
                                    ' '
                                )} ${sanitise(page.name, ' ')}"
                                target="_blank"
                            >
                                Spotify
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('itunes') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--itunes"
                                href="https://music.apple.com/gb/search?term=${sanitise(
                                    page.sister,
                                    ' '
                                )} ${sanitise(page.name, ' ')}"
                                target="_blank"
                            >
                                Apple
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('youtube') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--youtube-music"
                                href="https://music.youtube.com/search?q=${sanitise(
                                    page.sister
                                )}+${sanitise(page.name)}"
                                target="_blank"
                            >
                                YouTube
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('tidal') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--tidal"
                                href="https://listen.tidal.com/search?q=${sanitise(
                                    page.sister,
                                    ' '
                                )} ${sanitise(page.name, ' ')}"
                                target="_blank"
                            >
                                Tidal
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('deezer') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--deezer"
                                href="https://www.deezer.com/search/${sanitise(
                                    page.sister,
                                    ' '
                                )} ${sanitise(page.name, ' ')}"
                                target="_blank"
                            >
                                Deezer
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('discogs') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--discogs"
                                href="https://www.discogs.com/search?q=${sanitise(
                                    page.sister
                                )}+${sanitise(page.name)}&type=all"
                                target="_blank"
                            >
                                Discogs
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('qobuz') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--qobuz"
                                href="https://www.qobuz.com/search/albums/${sanitise(
                                    page.sister,
                                    ' '
                                )}%20${sanitise(page.name, ' ')}"
                                target="_blank"
                            >
                                Qobuz
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('aoty') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--aoty"
                                href="https://www.albumoftheyear.org/search/?q=${sanitise(
                                    page.sister
                                )}+${sanitise(page.name)}"
                                target="_blank"
                            >
                                AOTY
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('rym') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--rym"
                                href="https://rateyourmusic.com/search?searchterm=${sanitise(
                                    page.sister,
                                    ' '
                                )} ${sanitise(page.name, ' ')}"
                                target="_blank"
                            >
                                RYM
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('genius') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--genius"
                                href="https://genius.com/search?q=${sanitise(
                                    page.sister
                                )}+${sanitise(page.name)}"
                                target="_blank"
                            >
                                Genius
                            </a>
                    `
                    :   ''}
                `
            );
        } else {
            render(
                link_container,
                html`
                    ${settings.music_links.includes('spotify') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--spotify"
                                href="https://open.spotify.com/search/${sanitise(
                                    page.name,
                                    ' '
                                )}"
                                target="_blank"
                            >
                                Spotify
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('itunes') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--itunes"
                                href="https://music.apple.com/gb/search?term=${sanitise(
                                    page.name,
                                    ' '
                                )}"
                                target="_blank"
                            >
                                Apple
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('youtube') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--youtube-music"
                                href="https://music.youtube.com/search?q=${sanitise(
                                    page.name
                                )}"
                                target="_blank"
                            >
                                YouTube
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('tidal') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--tidal"
                                href="https://listen.tidal.com/search?q=${sanitise(
                                    page.name,
                                    ' '
                                )}"
                                target="_blank"
                            >
                                Tidal
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('deezer') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--deezer"
                                href="https://www.deezer.com/search/${sanitise(
                                    page.name,
                                    ' '
                                )}"
                                target="_blank"
                            >
                                Deezer
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('discogs') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--discogs"
                                href="https://www.discogs.com/search?q=${sanitise(
                                    page.name
                                )}&type=artist"
                                target="_blank"
                            >
                                Discogs
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('qobuz') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--qobuz"
                                href="https://www.qobuz.com/search/artists/${sanitise(
                                    page.name,
                                    ' '
                                )}"
                                target="_blank"
                            >
                                Qobuz
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('aoty') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--aoty"
                                href="https://www.albumoftheyear.org/search/?q=${sanitise(
                                    page.name
                                )}"
                                target="_blank"
                            >
                                AOTY
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('rym') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--rym"
                                href="https://rateyourmusic.com/search?searchterm=${sanitise(
                                    page.name,
                                    ' '
                                )}"
                                target="_blank"
                            >
                                RYM
                            </a>
                    `
                    :   ''}
                    ${settings.music_links.includes('genius') ?
                        html.node`
                            <a
                                class="music-link play-this-track-playlink--genius"
                                href="https://genius.com/search?q=${sanitise(
                                    page.name
                                )}"
                                target="_blank"
                            >
                                Genius
                            </a>
                    `
                    :   ''}
                `
            );

            let externals = page.structure.side.querySelector(
                '.resource-external-links'
            );
            if (externals) {
                page.structure.side.removeChild(externals.parentElement);
                let externals_links = externals.querySelectorAll(
                    '.resource-external-link'
                );
                externals_links.forEach((link) => {
                    link.classList.add('music-link');

                    let type = link.classList[1];
                    if (type == 'resource-external-link--homepage')
                        link.textContent = tl(trans.website);
                    else if (type == 'resource-external-link--twitter')
                        link.textContent = 'Twitter';
                    else if (type == 'resource-external-link--facebook')
                        link.textContent = 'Facebook';

                    link_container.appendChild(link);
                });
            }
        }
    }

    if (link_container.childNodes.length > 0) col_main.appendChild(link_group);

    const tags = col_main.querySelector('.catalogue-tags');
    if (tags) {
        link_group.appendChild(html.node`
            <div class="metadata-group">
                <div class="sub-text music-small-header">
                    ${tl(trans.tags)}
                </div>
                ${tags}
            </div>
        `);
    }

    // no album info
    const no_info = col_main.querySelector(
        ':scope > .section-with-separator.buffer-4'
    );
    if (no_info) {
        no_info.classList = 'loading-data-container';

        render(
            no_info,
            html`
                <div class="loading-data-text info">
                    ${tl(trans.missing_album_info)}
                </div>
            `
        );
    }

    // lotus
    if (!settings.corrections) return;

    page.structure.side.appendChild(html.node`
        <section class="lotus cta">
            <strong>${tl(trans.lotus_cta[page.corrected]).replace('{t}', tl(trans[`${page.type}_lower`]))}</strong>
            ${
                ff('refreshed_lotus') ?
                    html.node`
                <button class="see-more" onclick=${() => create_correction(page.type)}>${tl(trans.suggest_correction)}</button>
            `
                :   html.node`
                <a class="see-more" href="https://github.com/katelyynn/lotus/issues/new/choose" target="_blank">${tl(trans.suggest_correction)}</a>
            `
            }
        </section>
    `);
}

function create_listen_item(
    parent,
    { name, listens, link, avi, count = 0, button = false, katsune = false },
    header_type
) {
    if (!name) return;

    log(
        `creating listen item of ${name}, ${count}, ${listens}`,
        'artist',
        'info',
        { avi: avi, link: link }
    );

    let listen_item;

    if (button) listen_item = html.node`<button />`;
    else listen_item = html.node`<a />`;

    listen_item.classList.add('btn', 'listen-item');
    listen_item.setAttribute(
        'href',
        `${root}user/${name}/library/music/${redirect()}${link}`
    );
    listen_item.setAttribute('data-listens', listens);
    listen_item.setAttribute('id', `listen-item--${name}`);

    let p;

    if (listens > -1) {
        // your listens
        render(
            listen_item,
            html`
                <img class="view-item-avatar" src=${avi} alt=${name} />
                <div class="info">
                    <h3>${name}</h3>
                    <p class="colourful" ref=${(el) => (p = el)}>
                        ${tl(trans.listens.count).replace(
                            '{c}',
                            listens.toLocaleString(lang)
                        )}
                    </p>
                </div>
            `
        );

        let menu = tippy(listen_item, {
            theme: 'context-menu',
            content: html.node`
                <a class="dropdown-menu-clickable-item" href="${root}user/${name}" data-menu-item="view_profile">
                    ${tl(trans.profile)}
                </a>
            `,
            placement: 'right-start',
            trigger: 'manual',
            interactive: true,
            interactiveBorder: 10,
            offset: [0, 0],

            onShow(instance) {
                instance.popper.addEventListener('click', (event) => {
                    instance.hide();
                });
            }
        });

        register_menu(listen_item, menu);
    } else if (listens > -2) {
        // loading listens
        render(
            listen_item,
            html`
                <img class="view-item-avatar" src=${avi} alt=${name} />
                <div class="listen-badge star colourful">
                    <div class="bleh-icon" />
                </div>
                <div class="info">
                    <h3>${name}</h3>
                    <p class="colourful" ref=${(el) => (p = el)}>
                        ${tl(trans.listens)}
                    </p>
                </div>
            `
        );
    } else if (listens == -3) {
        listen_item.classList.add('listen-item-other');

        listen_item.removeAttribute('href');
        listen_item.setAttribute('onclick', `_other_listener('${link}')`);

        tippy(listen_item, {
            content: tl(trans.view_others_library)
        });
    } else {
        // other listeners by clicking this link (artist)
        render(
            listen_item,
            html`
                ${avi[0] ?
                    html.node`<img class="view-item-avatar" src=${avi[0].getAttribute('src')} alt="">`
                :   ''}
                ${avi[1] ?
                    html.node`<img class="view-item-avatar" src=${avi[1].getAttribute('src')} alt="">`
                :   ''}
                ${avi[2] ?
                    html.node`<img class="view-item-avatar" src=${avi[2].getAttribute('src')} alt="">`
                :   ''}
                <div class="info">
                    <h3>${tl(trans.following)}</h3>
                    <p class="colourful" ref=${(el) => (p = el)}>
                        ${tl(trans.others_count).replace('{c}', count)}
                    </p>
                </div>
            `
        );
        listen_item.setAttribute(
            'href',
            `${window.location.href}/+listeners/you-know`
        );
    }

    // colourful counts
    if (settings.colourful_counts && listens > -1 && header_type == 'artist') {
        let parsed_scrobble_as_rank = parse_scrobbles_as_rank(listens);

        listen_item.setAttribute(
            'data-bwaa--scrobble-milestone',
            parsed_scrobble_as_rank.milestone
        );
        p.style.setProperty('--hue-user', parsed_scrobble_as_rank.hue);
        p.style.setProperty('--sat-user', parsed_scrobble_as_rank.sat);
        p.style.setProperty('--lit-user', parsed_scrobble_as_rank.lit);
    }

    if (katsune) listen_item.classList.add('icon');

    parent.appendChild(listen_item);

    return listen_item;
}

function show_numbers_on_side(header_type) {
    let metadata = document.body.querySelectorAll('.header-metadata-tnew-item');

    let listeners = {};
    let scrobbles = {};
    let metascore = {};

    metadata.forEach((item, index) => {
        let text = item
            .querySelector('.header-metadata-tnew-title')
            .textContent.trim();
        let value = item.querySelector('.header-metadata-tnew-display abbr');

        if (index == 0) {
            listeners.text = text;
            listeners.value = clean_number(value.getAttribute('title'));
            listeners.abbr = value.textContent.trim();
        } else if (index == 1) {
            scrobbles.text = text;
            scrobbles.value = clean_number(value.getAttribute('title'));
            scrobbles.abbr = value.textContent.trim();
        } else if (index == 2) {
            let link = item.querySelector('a');
            if (!link) return;

            metascore.text = text;
            metascore.abbr = value.textContent.trim();
            metascore.link = link.getAttribute('href');
        }
    });

    page.structure.side.classList.remove('hidden-xs');

    // get panel
    let panel = page.structure.side.querySelector(
        'section.section-with-separator:has(.listener-trend)'
    );

    if (!panel) {
        panel = document.createElement('section');
        panel.classList.add('section-with-separator');

        if (!page.mobile)
            page.structure.side.insertBefore(
                panel,
                page.structure.side.firstElementChild
            );
        else
            page.structure.main.insertBefore(
                panel,
                page.structure.main.firstElementChild
            );
    }

    panel.classList.add('listen-panel');
    panel.setAttribute('data-auth-name', auth.name);

    let row = html.node`
        <div class="listener-row">
            <div class="listener-side">
                <h3>${listeners.text}</h3>
                <p>${listeners.abbr}</p>
            </div>
            <div class="scrobble-side">
                <h3>${scrobbles.text}</h3>
                <p>${scrobbles.abbr}</p>
            </div>
            ${
                metascore.text ?
                    html.node`
            <div class="metascore-side">
                <h3>${metascore.text}</h3>
                <p><a href="${metascore.link}" target="_blank">${metascore.abbr}</a></p>
            </div>
            `
                :   ''
            }
        </div>
    `;

    panel.insertBefore(row, panel.firstElementChild);

    if (page.mobile)
        page.structure.main.insertBefore(
            panel,
            page.structure.main.firstElementChild
        );

    tippy(row.querySelector('.listener-side p'), {
        content: tl(trans.count_listeners).replace(
            '{c}',
            listeners.value.toLocaleString(lang)
        )
    });
    tippy(row.querySelector('.scrobble-side p'), {
        content: tl(trans.count_scrobbles).replace(
            '{c}',
            scrobbles.value.toLocaleString(lang)
        )
    });

    // is there album artwork?
    if (page.type == 'album') {
        let album_artwork = document.body.querySelector(
            '.artwork-and-metadata-row'
        );

        if (album_artwork)
            page.structure.side.insertBefore(
                album_artwork,
                page.structure.side.firstElementChild
            );
    }

    let masonry = page.structure.row.querySelector(
        ':scope > .col-sidebar.masonry-right'
    );
    if (masonry) {
        // make last-child
        page.structure.row.appendChild(masonry);
    }

    if (page.type == 'album' || page.type == 'artist') {
        let upper = document.body.querySelector('.col-main');
        upper.classList.add('upper-overview-to-hide');
        // make last-child
        page.structure.row.appendChild(upper);

        let new_upper = document.createElement('section');
        new_upper.classList.add('top-overview-panel');
        new_upper.setAttribute('data-page-type', page.type);
        new_upper.innerHTML = upper.innerHTML;

        page.structure.main.insertBefore(
            new_upper,
            page.structure.main.firstElementChild
        );
    }

    // is there a video?
    if (page.type == 'track') {
        let video_col = document.body.querySelector(
            '.track-overview-video-column.col-sidebar'
        );

        if (!video_col) {
            video_unavailable(video_col);
            return;
        }

        video_col.classList.remove('col-sidebar');
        page.structure.side.insertBefore(
            video_col,
            page.structure.side.firstElementChild
        );

        let video = video_col.querySelector('.video-preview');

        if (!video) {
            video_unavailable(video_col);
            return;
        }

        video_col.classList.remove('col-sidebar');
        page.structure.side.insertBefore(
            video_col,
            page.structure.side.firstElementChild
        );

        let playlink = video.querySelector('.video-preview-playlink a');
        let replace = video_col.querySelector('.video-preview-replace a');

        video.appendChild(html.node`
            <a class="link-block-cover-link" href=${playlink.href} target="_blank" />
        `);

        playlink.classList = 'see-more';
        replace.classList = 'see-more add';

        video.after(html.node`
            <div class="video-actions sub-text">
                ${replace}
                ${playlink}
            </div>
        `);

        playlink.textContent = tl(trans.watch_video);
        playlink.removeAttribute('title');

        replace.textContent = tl(trans.replace);
    }
}

function video_unavailable(video_col = null) {
    let cta = page.structure.side.querySelector('.video-preview-upload-cta');
    if (cta) return;

    if (video_col) page.structure.side.removeChild(video_col);

    page.structure.side.insertBefore(
        html.node`
        <section class="video-placeholder">
            <div class="bleh-icon" style="--icon: var(--icon-16-video-broken)"></div>
            ${tl(trans.video_removed)}
        </section>
    `,
        page.structure.side.firstElementChild
    );
}

export function bleh_top_listeners() {
    if (!ff('unify_top_listeners')) return;

    const panel = page.structure.main.querySelector(
        ':scope > .buffer-standard'
    );

    // view-related buttons
    let view_buttons = document.createElement('div');
    view_buttons.classList.add('view-buttons-wrapper');
    view_buttons.innerHTML = `
        <div class="view-buttons">
            <button class="btn view-item" id="toggle-list_view-1" data-toggle="list_view" data-toggle-value="1" onclick="_update_item('list_view', 1)">
                ${tl(trans.grid)}
            </button>
            <button class="btn view-item" id="toggle-list_view-0" data-toggle="list_view" data-toggle-value="0" onclick="_update_item('list_view', 0)">
                ${tl(trans.list)}
            </button>
        </div>
    `;
    panel.insertBefore(view_buttons, panel.firstElementChild);

    refresh_all();

    let legacy_top_listeners_container = panel.querySelector('.top-listeners');
    let legacy_top_listeners = legacy_top_listeners_container.querySelectorAll(
        '.top-listeners-item'
    );

    const new_container = html.node`
        <ul class="user-list top-listeners-list" />
    `;

    legacy_top_listeners.forEach((listener, index) => {
        new_container.appendChild(convert_top_listener(listener, index));
    });

    view_buttons.after(new_container);
    legacy_top_listeners_container.remove();
}

export function convert_top_listener(listener, index, key = 'top-listeners') {
    let position = index + 1;
    if (
        page.requested.page != null &&
        page.requested.page != '1' &&
        key == 'top-listeners'
    )
        position += (parseInt(page.requested.page) - 1) * 30;

    let avatar = listener.querySelector(`.${key}-item-image`);
    let name_wrap = listener.querySelector(`.${key}-item-name a`);
    let name = name_wrap.textContent;

    let track_wrap = listener.querySelector(`.${key}-track`);

    let follow = listener.querySelector('.class');

    let name_link;
    let user_list_avatar;
    let about_me;
    const new_listener = html.node`
        <li class="user-list-item listener-list-item" data-position=${position}>
            <div class="user-list-inner-wrap">
                <span class="listener-list-position">
                    ${position}
                </span>
                <h4 class="user-list-name">
                    <a class="user-list-link link-block-target" href=${name_wrap.getAttribute('href')} ref=${(el) => (name_link = el)}>
                        ${name}
                    </a>
                </h4>
                <span class="avatar user-list-avatar" ref=${(el) => (user_list_avatar = el)}>
                    ${{ html: avatar.innerHTML }}
                </span>
                ${follow}
                ${
                    track_wrap ?
                        html.node`
                <div class="user-list-description">
                    <p class="user-list-about-me" ref=${(el) => (about_me = el)}>
                        ${{ html: track_wrap.innerHTML }}
                    </p>
                </div>
                `
                    :   ''
                }
            </div>
        </li>
    `;

    const badge = patch_avatar(user_list_avatar, name, 'listener');
    style_name_from_badge(name_link, badge);

    if (track_wrap) {
        let track_link = about_me.querySelector('a');

        track_link.classList.add('top-track');
        if (settings.format_guest_features) {
            const formatted = name_includes(
                track_link.textContent.trim(),
                page.sister
            );

            track_link.classList.add('smart-title');
            render(track_link, smart_title(formatted[0], formatted[1]));
        } else if (settings.corrections) {
            track_link.textContent = romanise(
                correct_item_by_artist(
                    track_link.textContent.trim(),
                    page.sister
                )
            );
        }
    }

    return new_listener;
}

// allows controlling auto +noredirect
export function redirect() {
    if (settings.prefer_no_redirect) return '+noredirect/';
    else return '';
}

export function prepare_music() {
    page.state.music_links = {
        spotify: {
            name: 'Spotify',
            icon: '',
            host: 'spotify.com'
        },
        itunes: {
            name: 'Apple',
            icon: '',
            host: 'music.apple.com'
        },
        youtube: {
            name: 'YouTube',
            icon: '',
            host: 'youtube.com'
        },
        tidal: {
            name: 'Tidal',
            icon: '',
            host: 'tidal.com'
        },
        deezer: {
            name: 'Deezer',
            icon: '',
            host: 'deezer.com'
        },
        discogs: {
            name: 'Discogs',
            icon: '',
            host: 'discogs.com'
        },
        qobuz: {
            name: 'Qobuz',
            icon: '',
            host: 'qobuz.com'
        },
        aoty: {
            name: 'AOTY',
            icon: '',
            host: 'albumoftheyear.org'
        },
        rym: {
            name: 'RYM',
            icon: '',
            host: 'rateyourmusic.com'
        },
        genius: {
            name: 'Genius',
            icon: '',
            host: 'genius.com'
        },
        website: {
            name: tl(trans.website),
            icon: 'link'
        },
        twitter: {
            name: 'Twitter',
            icon: '',
            host: 'twitter.com'
        },
        facebook: {
            name: 'Facebook',
            icon: '',
            host: 'facebook.com'
        },
        soundcloud: {
            name: 'SoundCloud',
            icon: '',
            host: 'soundcloud.com'
        },
        instagram: {
            name: 'Instagram',
            icon: '',
            host: 'instagram.com'
        }
    };
}
