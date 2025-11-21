//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { render_activity_list } from '../activity';
import { settings } from '../build/config';
import { log } from '../build/log';
import { auth, page, root } from '../build/page';
import { sponsor_list } from '../build/sponsor';
import {
    clean_number,
    romanise,
    sanitise,
    set_storage
} from '../build/tools';
import { lang, tl, trans } from '../build/trans';
import { create_badge, load_badges } from '../components/badge';
import { dialog } from '../components/dialog';
import {
    correct_artist,
    correct_item_by_artist,
    name_includes
} from '../components/lotus';
import { markdown } from '../components/markdown';
import {
    select,
    select_prepare
} from '../components/select';
import {
    checkup_page_structure,
    convert_to_toolbar,
    tab_replace
} from '../components/structure';
import { refresh_all, update_inbuilt_item } from '../config';
import { update_page } from '../page';
import { ff } from '../sku';
import { use_pronouns } from './lastfm_settings';
import { bleh_obsession } from './obsession';
import { html, render } from 'lighterhtml';
import { save_setting, setting } from '../components/settings.js';
import { redirect } from '../components/music.js';
import tippy from 'tippy.js';
import { expand_avatar } from '../avatar.js';
import { hoshino } from '../components/hoshino.js';
import { generic_subpage_header } from '../components/header.js';

export async function bleh_profiles() {
    // the obsessions page is a user subpage but works very differently
    if (page.subpage == 'obsessions_obsession') {
        bleh_obsession();
        return;
    }

    let profile_header = document.body.querySelector('.header--user');
    if (!profile_header) return;

    page.name = profile_header.querySelector('.header-title a').textContent;

    // are we on the overview page?
    let is_subpage = page.subpage != 'overview';

    page.structure.container = document.body.querySelector(
        '.page-content:not(.profile-cards-container, .report-box-container .page-content)'
    );
    try {
        page.structure.row = page.structure.container.querySelector('.row:not(._buffer)');
        page.structure.main = page.structure.row.querySelector('.col-main');
        page.structure.side = page.structure.row.querySelector('.col-sidebar');
    } catch (e) {
        log('unable to find elements', 'page structure');
    }

    checkup_page_structure(is_subpage, profile_header);

    page.supports_shoutbox = page.structure.nav.querySelector(
        '.secondary-nav-item--shoutbox'
    );

    let new_account = false;

    let about_me_sidebar = page.structure.row.querySelector('.about-me-sidebar');

    let avatar = profile_header.querySelector('.avatar');
    const profile_name_obj = profile_header.querySelector('.header-title-label-wrap');
    const profile_sub_text = profile_header.querySelector('.header-title-secondary');

    // new account
    if (!avatar) {
        avatar = profile_header.querySelector('.header-avatar-add');
        page.avatar = '';
        new_account = true;
    } else {
        avatar = avatar.querySelector('img');
        page.avatar = avatar.src;
        avatar.src = avatar.src.replace('/avatar170s/', '/arXL/');
    }

    profile_header.classList.add('legacy-header');

    // translations in other languages
    tab_replace('listening-report', tl(trans.charts));
    tab_replace('library', tl(trans.library));

    page.structure.nav.querySelector(':scope > .navlist-items').appendChild(html.node`
        <li class="navlist-item secondary-nav-item secondary-nav-item--journal">
            <a class="secondary-nav-item-link ${page.subpage.startsWith('journal') ? 'secondary-nav-item-link--active' : ''}" href="${root}user/${page.name}/journal">
                ${tl(trans.journal)}
            </a>
        </li>
    `);

    let is_own_profile = page.name == auth.name;
    if (is_own_profile)
        profile_header.setAttribute('data-is-own-profile', 'true');

    if (!is_subpage) {
        profile_recents();

        // acquire info
        let scrobbles = 0;
        let average = 0;
        let artists = 0;
        let loved = 0;

        const metadata = profile_header.querySelectorAll('.header-metadata-display');
        metadata.forEach((item, index) => {
            if (index == 0) {
                let para = item.querySelector('p');

                scrobbles = clean_number(para.textContent.trim());
                average = para.getAttribute('title');
            } else if (index == 1) {
                artists = clean_number(item.textContent.trim());
            } else if (index == 2) {
                loved = clean_number(item.textContent.trim());
            }
        });

        page.state.scrobbles = scrobbles;
        page.state.artists = artists;
        page.state.loved = loved;

        const display_name = profile_sub_text.querySelector('.header-title-display-name');
        const scrobble_since = profile_sub_text.querySelector('.header-scrobble-since');
        scrobble_since.textContent = scrobble_since.textContent
            .slice(2)
            .replace(tl(trans.account_scrobbling_since_replace), '');


        // badges
        log(`querying badges for ${page.name}`, 'profile');

        const types = html.node`
            <div class="user-types" />
        `;

        const stock_badges = profile_name_obj.querySelectorAll('.label');
        stock_badges.forEach((badge) => {
            const type = badge.classList[1]?.replace('user-status-', '');
            if (['None', 'label--fade'].includes(type)) return;

            badge.classList = `user-type user-type--${type}`;
            render(badge, html`
                <a>${badge.textContent.trim()}</a>
            `);
            types.appendChild(badge);
        });

        const badges = load_badges(page.name);
        log('got badges', 'profile', 'info', { badges });

        if (badges) {
            badges.forEach((badge) => {
                types.insertBefore(create_badge(badge, false, true), types.firstChild);
            });
        }

        const type_badges = types.querySelectorAll(':scope > .user-type');
        type_badges.forEach((badge, index) => {
            if (type_badges.length > 1) {
                if (index == 0) {
                    types.appendChild(html.node`
                        <div class="user-type user-type-extras">
                            <a>+${type_badges.length - 1}</a>
                        </div>
                    `);
                } else {
                    badge.classList.add('user-type-overflow');
                }
            }
        });


        const header = html.node`
            <section class="profile-header-section" data-page-style=${settings.page_style}>
                <div class="badge-avatar">
                    ${avatar}
                    ${types}
                </div>
                <div class="badge-info">
                    <h1>${page.name}</h1>
                    <div class="user-info" data-page-style=${settings.page_style}>
                        <div class="top">
                            <strong>${display_name.textContent.trim()}</strong>
                        </div>
                        <div class="url" ref=${el => page.state.profile_url = el} data-hidden="true" />
                        <div class="bottom user-last-seen">
                            ${tl(trans.last_seen, {v: (page.state.active_now) ? tl(trans.last_seen.now) : page.state.active_now})}
                        </div>
                    </div>
                    <div class="user-data">
                        <div class="user-plays">
                            <div class="count">
                                ${{ html: tl(trans.count_plays, {c: scrobble_flip(scrobbles, average)}) }}
                            </div>
                            <div class="since">
                                ${tl(trans.since, {v: scrobble_since.textContent})}
                            </div>
                        </div>
                    </div>
                    <div class="user-activity">
                        <a href="${root}user/${page.name}/loved">${tl(trans.count_loved, {c: loved})}</a> |
                         <a href="${root}user/${page.name}/library/artists">${tl(trans.count_artists, {c: artists})}</a> |
                         <a href="${root}user/${page.name}/shoutbox">${tl(trans.shouts)}</a>
                    </div>
                </div>
            </section>
        `;
        page.structure.main.insertBefore(header, page.structure.main.firstElementChild);

        const sponsor_profile = sponsor_list ? page.name == sponsor_list.sponsor_account : false;

        if (!is_own_profile) {
            const follow_button = profile_header.querySelector('.header-avatar [data-toggle-button=""]');
            const message_button = profile_header.querySelector('.header-message-user');

            let taste = '';
            let taste_percentage = '';
            let taste_artists = [];

            let taste_meter = profile_header.querySelector('.tasteometer');

            if (taste_meter) {
                taste = taste_meter.classList[1].replace('tasteometer-compat-', '');

                let artists = taste_meter.querySelectorAll('a');
                artists.forEach((artist) => {
                    taste_artists.push(
                        correct_artist(artist.getAttribute('title'))
                    );
                });

                taste_percentage = taste_meter
                    .querySelector('.tasteometer-viz')
                    .getAttribute('title');
                if (taste_percentage == '99%') taste_percentage = '100%';
            }

            let text;
            if (taste_artists.length == 3) {
                text = tl(trans.music_in_common.three, { v1: `<a href="${root}music/${taste_artists[0]}">${correct_artist(taste_artists[0])}</a>`, v2: `<a href="${root}music/${taste_artists[1]}">${correct_artist(taste_artists[1])}</a>`, v3: `<a href="${root}music/${taste_artists[2]}">${correct_artist(taste_artists[2])}</a>` });
            } else if (taste_artists.length == 2) {
                text = tl(trans.music_in_common.two, { v1: `<a href="${root}music/${taste_artists[0]}">${correct_artist(taste_artists[0])}</a>`, v2: `<a href="${root}music/${taste_artists[1]}">${correct_artist(taste_artists[1])}</a>` });
            } else if (taste_artists.length == 1) {
                text = `<a href="${root}music/${taste_artists[0]}">${correct_artist(taste_artists[0])}</a>`;
            }

            header.after(html.node`
                <section class="profile-actions-section">
                    <div class="options">
                        ${!sponsor_profile ? follow_button : ''}
                        ${message_button ? html.node`<a class="has-icon send-a-msg" href="${root}inbox/compose?to=${page.name}">${tl(trans.send_a_message)}</a>` : ''}
                        ${!sponsor_profile ? html.node`<a class="has-icon leave-a-shout" href="${root}user/${page.name}/shoutbox">${tl(trans.leave_a_shout)}</a>` : ''}
                    </div>
                    <div class="tasteometer tasteometer-compact-${taste}" data-taste=${taste}>
                        <p>${{ html: tl(trans.music_compat, { u: `<strong>${page.name}</strong>`, v: `<strong>${tl(trans.music_compat[taste]).toUpperCase()}</strong>` }) }}</p>
                        <div class="bar">
                            <div class="fill" style="width: ${taste_percentage}" />
                        </div>
                        <p>${{ html: tl(trans.music_in_common, { v: text }) }}</p>
                    </div>
                </section>
            `);
        }

        let is_following = page.structure.container.querySelector('.label.user-follow');


        let about_me_text = about_me_sidebar?.querySelector('p');
        if (settings.bio_markdown && about_me_text) {
            let result = bio_parse(about_me_text);

            about_me_text.after(result);
            about_me_text.remove();
        }


        //

        profile_artists();
        profile_albums();
        profile_tracks();

        if (is_own_profile && settings.activities) {
            let recent_activity_section = html.node`
                <section class="recent-activity-section">
                    <h2>${tl(trans.activity)}</h2>
                    ${render_activity_list()}
                    <div class="more-link">
                        <a href="${root}bleh/profile">${tl(trans.activity_settings)}</a>
                    </div>
                </section>
            `;

            page.structure.side.appendChild(recent_activity_section);
        }

        if (page.name == sponsor_list.sponsor_account && !is_own_profile) {
            page.structure.container.removeChild(page.structure.nav);
            page.structure.main.innerHTML = '';
            page.structure.side.innerHTML = '';

            page.structure.main.appendChild(html.node`
                <section class="cta">
                    <strong>${tl(trans.sponsor_info)}</strong>
                </section>
            `);
        }

        // recent tracks
        let recent_tracks = page.structure.main.querySelector(
            '#recent-tracks-section'
        );
        if (!recent_tracks) {
            recent_tracks =
                page.structure.main.querySelector('.no-data-message');
            if (recent_tracks) {
                recent_tracks.classList = 'recent-tracks-section';
                recent_tracks.innerHTML = `
                    <h2>
                        <a class="text-colour-link" href="${window.location.href}/library">${tl(trans.recent_tracks)}</a>
                    </h2>
                    <div class="loading-data-container">
                        <div class="loading-data-text private">
                            ${recent_tracks.textContent}
                        </div>
                    </div>
                `;
            }
        }

        // featured track
        let featured_track_panel = profile_header.querySelector(
            '.header-featured-track'
        );
        if (featured_track_panel)
            bleh_featured_profile_track(featured_track_panel);
    } else {
        page.structure.row.insertBefore(generic_subpage_header(page.structure.content_top.querySelector('h1').textContent), page.structure.row.firstElementChild);

        let btn_add = page.structure.side.querySelector('.add-button');
        if (btn_add) btn_add.setAttribute('data-page-subpage', page.subpage);

        if (page.subpage == 'events') {
            convert_to_toolbar();

            const no_events = page.structure.main.querySelector(
                ':scope > .no-events'
            );

            if (!no_events) bleh_profile_events();
        } else if (page.subpage.startsWith('listening-report')) {
            page.structure.content_top.classList.add(
                'listening-report-navlist'
            );
            page.structure.row.classList.add('listening-report');

            convert_to_toolbar();

            let report_box_container = document.body.querySelector(
                '.report-box-container--overview'
            );
            if (report_box_container) {
                document.documentElement.setAttribute(
                    'data-bwaa--theme',
                    'oled'
                );
                document.documentElement.setAttribute(
                    'data-bwaa--theme_type',
                    'dark'
                );

                page.structure.row.after(report_box_container);
            } else {
                let dashboard =
                    page.structure.container.querySelector('.user-dashboard');
                if (dashboard) {
                    // v2
                    dialog({
                        id: 'listening_report_v2',
                        title: 'oh no :c',
                        body: html.node`
                            <div class="alert alert-error">This listening report is too old</div>
                            <br>
                            <p>Legacy listening reports are not properly viewable yet in bleh for now. Sorry for the inconvenience.</p>
                        `
                    });
                }
            }
        } else if (page.subpage == 'obsessions_overview') {
            let section_controls =
                page.structure.container.querySelector('.section-controls');
            let buttons;
            if (section_controls != null) {
                section_controls.classList.add('legacy-section-controls');
                buttons = section_controls.querySelectorAll(':is(button, a)');

                let header = page.structure.container.querySelector(
                    '.content-top-header'
                );
                page.structure.content_top.innerHTML = `
                    <div class="content-top-inner-wrap">
                        <div class="container content-top-lower">
                            <h1 class="content-top-header">${header.textContent.trim()}</h1>
                        </div>
                    </div>
                `;
            }

            let count_text = page.structure.content_top
                .querySelector('h1')
                .textContent.trim();
            let chr = count_text.indexOf('(');

            let count = 0;
            if (chr != -1)
                count = count_text
                    .substring(chr)
                    .replace('(', '')
                    .replace(')', '');

            page.structure.nav.querySelector(
                '.secondary-nav-item--obsessions a'
            ).appendChild(html.node`
                <div class="new-badge count-badge">${count}</div>
            `);

            let new_panel = document.createElement('section');
            new_panel.classList.add('obsessions-panel');

            let wrap = document.createElement('div');
            wrap.classList.add('view-buttons-wrapper');
            let button_header = document.createElement('div');
            button_header.classList.add(
                'view-buttons',
                'obsession-buttons',
                'blend'
            );

            buttons.forEach((button) => {
                if (button.classList.contains('btn-sm')) {
                    button.classList = [];
                    button.classList.add('obsession-btn');

                    tippy(button, {
                        content: button.textContent
                    });

                    button.textContent = tl(trans.obsess);
                }

                button.classList.add(
                    'btn',
                    'view-item',
                    'interact-item',
                    'obsession-top-item'
                );

                button_header.appendChild(button);
            });
            wrap.appendChild(button_header);
            new_panel.appendChild(wrap);

            page.structure.main.appendChild(new_panel);

            //

            let grid = document.createElement('ol');
            grid.classList.add(
                'grid-items',
                'grid-items--numbered',
                'obsessions-grid'
            );

            let items = page.structure.container.querySelectorAll(
                '.obsession-history-item'
            );
            items.forEach((item) => {
                let link = item.querySelector(
                    '.obsession-history-item-heading-link'
                );

                let artist = item.querySelector(
                    '.obsession-history-item-artist a'
                );
                let artist_link = artist.getAttribute('href');
                artist = artist.textContent.trim();

                let title = link.textContent.trim();
                link = link.getAttribute('href');
                let date = item
                    .querySelector('.obsession-history-item-date')
                    .textContent.trim();

                let bg = item
                    .querySelector('.obsession-history-item-background')
                    .style.getPropertyValue('background-image')
                    .trim();
                let cover_substr = bg.indexOf('url');
                const cover = html.node`
                    <img
                    src=${bg
                        .substring(cover_substr)
                        .replace('url("', '')
                        .replace('")', '')
                        .trim()}
                    alt=${title} loading="lazy">
                `;

                hoshino(cover, title, artist);

                let obsession_is_first =
                    item.querySelector('.obsession-first') != null;

                const grid_item = html.node`
                    <li class="grid-items-item obsessions-item ${obsession_is_first ? 'first' : ''}">
                        <div class="grid-items-cover-image">
                            <div class="grid-items-cover-image-image ${cover.src.endsWith('4128a6eb29f94943c9d206c08e625904.jpg') ? 'grid-items-cover-default' : ''}">
                                ${cover}
                            </div>
                            <div class="grid-items-item-details">
                                <p class="grid-items-item-main-text">
                                    <a class="link-block-target" href="${link}" title="${title}">
                                        ${title}
                                    </a>
                                </p>
                                <p class="grid-items-item-aux-text obsessions-item-aux">
                                    <a class="grid-items-item-aux-block" href="${artist_link}">
                                        ${artist}
                                    </a>
                                    <a class="obsessions-item-date" href="${link}">
                                        ${date}
                                    </a>
                                </p>
                            </div>
                            <a class="link-block-cover-link" href="${link}" tabindex="-1" aria-hidden="true"></a>
                        </div>
                    </li>
                `;

                if (obsession_is_first) {
                    tippy(grid_item, {
                        content: tl(trans.obsession_first)
                    });
                }

                grid.appendChild(grid_item);
            });

            new_panel.appendChild(grid);

            let no_data = page.structure.container.querySelector(
                '.no-data-message--obsession-history'
            );
            if (no_data) wrap.after(no_data);

            let pagination =
                page.structure.container.querySelector('.pagination');
            if (pagination) new_panel.appendChild(pagination);
        } else if (page.subpage == 'playlists_playlists') {
            let section_controls = page.structure.container.querySelector(
                '.section-controls-full-width'
            );
            let buttons;
            if (section_controls) {
                section_controls.classList.add('legacy-section-controls');
                buttons = section_controls.querySelectorAll(':is(button, a)');

                let header = page.structure.container.querySelector(
                    '.content-top-header'
                );
                page.structure.content_top.innerHTML = `
                    <div class="content-top-inner-wrap">
                        <div class="container content-top-lower">
                            <h1 class="content-top-header">${header.textContent.trim()}</h1>
                        </div>
                    </div>
                `;
            }

            let new_panel = document.createElement('section');
            new_panel.classList.add('obsessions-panel');

            page.structure.main.appendChild(new_panel);

            if (buttons.length > 0) {
                let wrap = document.createElement('div');
                wrap.classList.add('view-buttons-wrapper');
                wrap.innerHTML = `<div class="info"><div class="alert alert-info">Playlists are a work in progress</div></div>`;

                let button_header = html.node`
                    <div class="view-buttons playlist-home-buttons blend" />
                `;

                buttons.forEach((button) => {
                    if (
                        button.getAttribute('data-analytics-action') == 'create'
                    ) {
                        button.classList.add('primary');
                        button.innerHTML = `${tl(trans.new)} <div class="new-badge">${tl(trans.beta)}</div>`; //button.textContent = tl(trans.new);
                    }

                    button.classList.add(
                        'btn',
                        'view-item',
                        'interact-item',
                        'playlist-home-top-item'
                    );

                    button_header.appendChild(button);
                });
                wrap.appendChild(button_header);
                new_panel.appendChild(wrap);
            }

            //

            let playlists = page.structure.container.querySelector(
                '.playlisting-playlists'
            );
            if (playlists) {
                page.structure.container.removeChild(playlists.parentElement);
                new_panel.appendChild(playlists);
            } else {
                let no_data = page.structure.container.querySelector(
                    '.no-data-message--playlists'
                );
                page.structure.container.removeChild(no_data.parentElement);
                new_panel.appendChild(no_data);
            }
        } else if (page.subpage == 'loved') {
            let count_text = page.structure.content_top
                .querySelector('h1')
                .textContent.trim();
            let chr = count_text.indexOf('(');

            let count = 0;
            if (chr != -1)
                count = count_text
                    .substring(chr)
                    .replace('(', '')
                    .replace(')', '');

            page.structure.nav.querySelector('.secondary-nav-item--loved a')
                .appendChild(html.node`
                <div class="new-badge count-badge">${count}</div>
            `);
        } else if (page.subpage.startsWith('library')) {
            const date_range = page.structure.side.querySelector('.date-range-picker-form');

            if (date_range) {
                date_range.classList.remove('content-form');
            }
        }
    }

    log('status is', 'page', 'info', page);
    update_page();

    patch_profile_following();
}

function create_profile_note_panel(username, has_note) {
    let about_me_sidebar =
        page.structure.row.querySelector('.about-me-sidebar');

    let note;

    about_me_sidebar.after(html.node`
        <section class="bleh--panel bleh--profile-note-panel">
            <h2>${tl(trans.notes)}</h2>
            <div class="content-form">
                <textarea id="bleh--profile-note" placeholder=${tl(trans.anything_you_can_imagine)} ref=${(el) => (note = el)}>${has_note ?? has_note}</textarea>
            </div>
            <div class="actions">
                <button class="see-more cancel" onclick=${() => {
                    let notes =
                        JSON.parse(
                            localStorage.getItem('bleh_profile_notes')
                        ) || {};
                    delete notes[page.name];

                    note.value = '';
                    set_storage('bleh_profile_notes', JSON.stringify(notes));
                }}>${tl(trans.clear)}</button>
                <button class="btn primary icon" data-type="save" onclick=${() => {
                    let notes =
                        JSON.parse(
                            localStorage.getItem('bleh_profile_notes')
                        ) || {};

                    notes[page.name] = note.value
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');

                    set_storage('bleh_profile_notes', JSON.stringify(notes));
                }}>${tl(trans.save)}</button>
            </div>
        </section>
    `);
}

// patch following
function patch_profile_following() {
    let navlist = page.structure.nav.querySelector('.navlist-items');
    let following_tab = navlist.querySelector('.secondary-nav-item--following');

    let link = following_tab.querySelector('a');

    if (
        page.subpage != 'following' &&
        page.subpage != 'followers' &&
        page.subpage != 'neighbours'
    ) {
        // if we're not on one of these tabs we don't need to preserve the 'Following' text
        link.href = `${root}user/${page.name}/friends`;
        link.textContent = tl(trans.friends);
        return;
    }

    if (page.subpage != 'following')
        link.classList.add('secondary-nav-item-link--active');

    let followers_tab = navlist.querySelector('.secondary-nav-item--followers');
    let neighbours_tab = navlist.querySelector(
        '.secondary-nav-item--neighbours'
    );

    navlist.removeChild(followers_tab);
    navlist.removeChild(neighbours_tab);

    // create nav
    let friends_nav = html.node`
        <div class="friend-tabs">
            <nav class="navlist secondary-nav redesigned-navigation">
                <ul class="navlist-items">
                    ${{ html: following_tab.outerHTML }}
                    ${{ html: followers_tab.outerHTML }}
                    ${{ html: neighbours_tab.outerHTML }}
                </ul>
            </nav>
        </div>
    `;

    // we do this later to preserve the 'Following' text
    link.href = `${root}user/${page.name}/friends`;
    link.textContent = tl(trans.friends);

    page.structure.main.insertBefore(friends_nav, page.structure.main.firstElementChild);
    page.structure.row.classList.add('col-main-is-primary');

    following_tab = friends_nav.querySelector(
        '.secondary-nav-item--following a'
    );

    let highlighted_tab = following_tab;
    if (page.subpage == 'followers')
        highlighted_tab = friends_nav.querySelector(
            '.secondary-nav-item--followers a'
        );
    else if (page.subpage == 'neighbours')
        highlighted_tab = friends_nav.querySelector(
            '.secondary-nav-item--neighbours a'
        );

    if (page.subpage != 'following') {
        following_tab.classList.remove('secondary-nav-item-link--active');
    }

    if (ff('katsune') && page.subpage != 'neighbours') {
        let count_text = page.structure.content_top
            .querySelector('h1')
            .textContent.trim();
        let chr = count_text.indexOf('(');

        let count = 0;
        if (chr != -1)
            count = count_text.substring(chr).replace('(', '').replace(')', '');

        highlighted_tab.appendChild(html.node`
            <div class="new-badge count-badge">${count}</div>
        `);
    }

    const user_panel = html.node`
        <section class="users">
            ${html.node([page.structure.main.innerHTML])}
        </section>
    `;

    render(page.structure.main, user_panel);

    refresh_all();
}

function bleh_featured_profile_track(object) {
    let art = object.querySelector('.featured-item-art');
    let details = object.querySelector('.featured-item-details');
    let form = document.body.querySelector('.header-info-primary form');

    let heading = details.querySelector('.featured-item-heading');
    let link = heading.querySelector('a')?.getAttribute('href');
    details.removeChild(heading);

    let name_elem = details.querySelector('.featured-item-name');
    let artist_elem = details.querySelector('.featured-item-artist');

    name_elem.classList = '';
    artist_elem.classList = 'source-album-artist';

    const img = art.querySelector('.cover-art');
    hoshino(
        img.querySelector(':scope > img'),
        name_elem.textContent.trim(),
        artist_elem.textContent.trim()
    );

    if (settings.corrections) {
        name_elem.textContent = romanise(
            correct_item_by_artist(
                name_elem.textContent.trim(),
                artist_elem.textContent.trim()
            )
        );
        artist_elem.textContent = romanise(
            correct_artist(artist_elem.textContent.trim())
        );
    }

    if (form) {
        let button = form.querySelector('button');
        button.classList = 'featured-item-manage';
        button.setAttribute('data-type', 'delete');
        button.textContent = tl(trans.remove);
    }

    let panel = html.node`
        <section class="featured-item-section">
            <h2>
                ${form ? html.node`
                <a href=${link}>
                    ${tl(trans.obsession)}
                </a>
                ${form}
                ` : html.node`
                ${tl(trans.top_track)}
                `}
            </h2>
            <div class="grid-items">
                <li class="grid-items-item link-block">
                    <div class="grid-items-cover-image">
                        <div class="grid-items-cover-image-image">
                            ${img}
                        </div>
                        <div class="grid-items-item-details">
                            <p class="grid-items-item-main-text">${name_elem}</p>
                            <p class="grid-items-item-aux-text">${artist_elem}</p>
                        </div>
                        <a class="js-link-block-cover-link link-block-cover-link" href=${name_elem.getAttribute('href')} />
                    </div>
                </li>
            </div>
        </section>
    `;

    page.structure.side.appendChild(panel);
}

function profile_recents() {
    let panel = page.structure.main.querySelector('#recent-tracks-section');
    if (!panel) return;

    let more_link = panel.nextElementSibling;
    panel.appendChild(more_link);

    panel.classList.remove('content-form');
    panel.classList.add('settings-form');

    const settings_btn = panel.querySelector('.section-settings-toggle');
    if (settings_btn) settings_btn.textContent = tl(trans.settings);

    const header = panel.querySelector('h2 > a');
    if (header) header.textContent = tl(trans.recently_listened_tracks);

    page.state.active_now = panel.querySelector('tbody > .chartlist-row:first-child > .chartlist-timestamp > span:not(.chartlist-now-scrobbling)');
}

function profile_artists() {
    let panel = page.structure.main.querySelector('#top-artists');
    if (!panel) return;

    panel.classList.remove('content-form');
    panel.classList.add('settings-form');

    const settings_btn = panel.querySelector('.section-settings-toggle');
    if (settings_btn) settings_btn.textContent = tl(trans.settings);
}

function profile_albums() {
    let panel = page.structure.main.querySelector('#top-albums');
    if (!panel) return;

    panel.classList.remove('content-form');
    panel.classList.add('settings-form');

    const settings_btn = panel.querySelector('.section-settings-toggle');
    if (settings_btn) settings_btn.textContent = tl(trans.settings);
}

function profile_tracks() {
    let panel = page.structure.main.querySelector('#top-tracks');
    if (!panel) return;

    panel.classList.remove('content-form');
    panel.classList.add('settings-form');

    const settings_btn = panel.querySelector('.section-settings-toggle');
    if (settings_btn) settings_btn.textContent = tl(trans.settings);
}

function bio_parse(text) {
    let temp = document.createElement('div');
    temp.classList.add('markdown-body');

    render(
        temp,
        markdown(text.textContent, {
            allow_headers: true,
            allow_banners: true,
            allow_icons: true,
            allow_hue: true,
            allow_socials: true,
            allow_alignment: true
        })
    );

    return temp;
}

function bleh_profile_events() {
    const selected_tab = page.structure.toolbar?.querySelector(
        '.secondary-nav-item-link--active'
    );

    let value_panel = html.node`
        <section class="value-panel">
            <h2 class="text-18">${selected_tab ? selected_tab.firstChild.textContent : tl(trans.events)}</h2>
        </section>
    `;

    if (page.structure.toolbar) {
        const tabs = page.structure.toolbar.querySelectorAll(
            '.secondary-nav-item-link'
        );
        tabs.forEach((tab, index) => {
            if (index < 1) return;

            tab.classList.add('has-tab-num');

            const num = tab.firstChild.textContent.trim().slice(-2);
            tab.appendChild(html.node`
                <span class="tab-num">
                    ${num}
                </span>
            `);
        });
    }

    let values = page.structure.main.querySelectorAll('.metadata-display');

    let value_header = html.node`
        <div class="glacier-library-metadata" />
    `;

    values.forEach((value, index) => {
        let text = tl(trans.going);
        if (index == 1) text = tl(trans.interested);

        value_header.appendChild(html.node`
            <div class="glacier-library-metadata-item">
                <div class="sub-text">${text}</div>
                <div class="glacier-library-metadata-item-value">${value.textContent}</div>
            </div>
        `);
    });

    value_panel.appendChild(value_header);

    let total_value = page.structure.side.querySelector('.metadata-display');
    if (total_value) {
        value_panel.appendChild(html.node`
            <h2 class="text-18">${tl(trans.all_time)}</h2>
            <div class="glacier-library-metadata">
                <div class="glacier-library-metadata-item">
                    <div class="sub-text">${tl(trans.total)}</div>
                    <div class="glacier-library-metadata-item-value">${total_value.textContent}</div>
                </div>
            </div>
        `);
    }

    let legacy_metadata = page.structure.main.querySelector('.metadata-list');
    if (legacy_metadata) page.structure.main.removeChild(legacy_metadata);

    page.structure.side.innerHTML = '';
    page.structure.side.appendChild(value_panel);
}

function scrobble_flip(scrobbles, average) {
    const scrobbles_split = scrobbles.toString().split('');

    return html.node`
        <div class="flipper-wrap" title=${average}>
            ${scrobbles_split.map(split => html.node`
                <div class="flip">
                    ${split}
                </div>
            `)}
        </div>
    `.outerHTML;
}
