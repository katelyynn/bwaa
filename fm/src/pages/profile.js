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
import { redesign_profile_header } from '../components/profile_header';
import {
    select,
    select_prepare
} from '../components/select';
import {
    checkup_page_structure,
    convert_to_toolbar
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
    let title_wrap = profile_header.querySelector('.header-title-label-wrap');
    let sub_wrap = profile_header.querySelector('.header-title-secondary');

    // new account
    if (!avatar) {
        avatar = profile_header.querySelector('.header-avatar-add');
        new_account = true;
    }

    // me :3
    if (
        sponsor_list &&
        sponsor_list.special &&
        sponsor_list.special.includes(page.name)
    ) {
        title_wrap
            .querySelector('.header-title a')
            .classList.add('bleh--name-is-cute');
    }

    let expander;
    let redesigned_profile_header = html.node`
        <section class="redesigned-header redesigned-profile-header no-background">
            <div class="avatar-side">
                ${avatar}
            </div>
            <div class="info-side">
                <div class="sub-text">${tl(trans.profile)}</div>
                ${title_wrap ? html.node`<div class="title-container">${title_wrap}</div>` : ''}
                ${
                    sub_wrap ? sub_wrap
                    : cache.aka || cache.created ?
                        html.node`
                <p class="header-title-secondary">
                    ${
                        cache.aka ?
                            html.node`
                    <span class="header-title-secondary--pre">
                        ${pronouns ? tl(trans.account_pronouns) : tl(trans.aka)}
                    </span>
                    <span class="header-title-display-name">
                        ${cache.aka}
                    </span>
                    `
                        :   ''
                    }
                    <span class="header-title-secondary--pre">
                        ${tl(trans.account_created)}
                    </span>
                    <span class="header-scrobble-since">
                        ${cache.created}
                    </span>
                </p>
                `
                    :   ''
                }
            </div>
        </section>
    `;

    page.structure.container.insertBefore(
        redesigned_profile_header,
        page.structure.container.firstElementChild
    );
    profile_header.classList.add('legacy-header');

    // translations in other languages
    let library_tab = page.structure.nav.querySelector(
        '.secondary-nav-item--library a'
    );
    library_tab.textContent = tl(trans.library);

    let is_own_profile = page.name == auth.name;
    if (is_own_profile)
        profile_header.setAttribute('data-is-own-profile', 'true');

    let loved_tab = page.structure.nav.querySelector(
        '.secondary-nav-item--loved a'
    );
    if (loved_tab) loved_tab.textContent = tl(trans.loved);

    if (!is_subpage) {
        let is_following = page.structure.container.querySelector('.label.user-follow');


        if (settings.bio_markdown) {
            let about_me_text = about_me_sidebar.querySelector('p');
            let result = bio_parse(about_me_text);

            about_me_text.after(result);
            about_me_text.remove();
        }


        //

        profile_recents();
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

        // acquire info
        let scrobbles = 0;
        let average = 0;
        let artists = 0;
        let loved = 0;

        let metadata = profile_header.querySelectorAll(
            '.header-metadata-display'
        );
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

        let scrobble_text;
        let listen_container = html.node`
            <section class="listen-panel listen-profile-panel">
                <div class="listener-row">
                    <div class="scrobble-side">
                        <h3>${tl(trans.scrobbles)}</h3>
                        <p ref=${(el) => (scrobble_text = el)}><a href="${root}user/${page.name}/library">${scrobbles.toLocaleString(lang)}</a></p>
                    </div>
                    <div class="artist-side">
                        <h3>${tl(trans.artists)}</h3>
                        <p><a href="${root}user/${page.name}/library/artists">${artists.toLocaleString(lang)}</a></p>
                    </div>
                    <div class="loved-side">
                        <h3>${tl(trans.loved)}</h3>
                        <p><a href="${root}user/${page.name}/loved">${loved.toLocaleString(lang)}</a></p>
                    </div>
                </div>
                ${
                    scrobbles > 0 ?
                        html.node`
                <div class="scrobble-canvas-container mini">
                    <div class="loading-data-container">
                        <div class="loading-data-text">${tl(trans.loading_count_days).replace('{c}', '90')}</div>
                    </div>
                </div>
                <div class="more-link">
                    <a href="${root}user/${page.name}/library/artists?date_preset=LAST_90_DAYS&page=1">
                        ${tl(trans.explore_in_library)}
                    </a>
                </div>
                `
                    : auth.name ?
                        html.node`
                <div class="scrobble-canvas-container mini">
                    <div class="loading-data-container">
                        <div class="loading-data-text failed">${tl(trans.profile_does_not_have_enough_scrobbles)}</div>
                    </div>
                </div>
                `
                    :   html.node``
                }
            </section>
        `;

        if (scrobbles > 0) {
            tippy(scrobble_text, {
                content: average
            });
        }

        if (sponsor_list && page.name != sponsor_list.sponsor_account) {
            if (!page.mobile)
                page.structure.side.insertBefore(
                    listen_container,
                    page.structure.side.firstChild
                );
            else
                page.structure.main.insertBefore(
                    listen_container,
                    page.structure.main.firstChild
                );
        }

        // secondary text
        const profile_sub_text = page.structure.container.querySelector(
            '.redesigned-profile-header .header-title-secondary'
        );
        if (profile_sub_text)
            parse_sub_text(profile_sub_text, page.name);

        // featured track
        let featured_track_panel = profile_header.querySelector(
            '.header-featured-track'
        );
        if (featured_track_panel)
            bleh_featured_profile_track(featured_track_panel);

        let about_me_header = about_me_sidebar.querySelector('h2');
        about_me_header.remove();

        let profile_note;

        if (!is_own_profile) {
            let notes =
                JSON.parse(localStorage.getItem('bleh_profile_notes')) || {};
            profile_note = notes[page.name];
        }

        let settings_btn;
        let add_note;
        let info_tip;
        about_me_sidebar.insertBefore(
            html.node`
            <div class="top-container">
                <h2>
                    ${tl(trans.about)}
                    <span class="info-tip" ref=${(el) => (info_tip = el)}>
                        <span class="bleh-icon" data-type="info" style="--icon: var(--mask)" />
                    </span>
                </h2>
                <div class="view-buttons blend blend-v2">
                    ${
                        is_own_profile ?
                            html.node`
                    <a class="left-icon blend-v2-btn" data-type="edit" href="${root}settings#id_about_me">
                        ${tl(trans.edit)}
                    </a>
                    `
                        : !profile_note ?
                            html.node`
                    <button class="left-icon blend-v2-btn" data-type="add" ref=${(el) => (add_note = el)} onclick=${() => {
                        create_profile_note_panel(page.name, profile_note);
                        add_note.remove();
                    }}>
                        ${tl(trans.add_note)}
                    </button>
                    `
                        :   ''
                    }
                    <button class="left-icon blend-v2-btn" data-type="settings" ref=${(el) => (settings_btn = el)}>
                        ${tl(trans.settings)}
                    </button>
                </div>
            </div>
        `,
            about_me_sidebar.firstChild
        );

        if (ff('redesigned_profile_header'))
            redesign_profile_header(is_own_profile, is_following);
    } else {
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
        }
    }

    log('status is', 'page', 'info', page);
    update_page();

    patch_profile_following();

    // badges
    log(`querying badges for ${page.name}`, 'profile');

    let profile_name_obj;
    profile_name_obj = page.structure.container.querySelector(
        '.redesigned-profile-header .title-container'
    );

    if (ff('badges')) {
        let stock_badges = profile_name_obj.querySelectorAll('.label');
        stock_badges.forEach((badge) => {
            if (badge.classList[1] == 'user-status-None') return;

            badge.classList.add('expand');

            tippy(badge, {
                theme: 'badge',
                placement: 'bottom',
                content: html.node`
                    <div class="badge-name">${badge.textContent}</div>
                    <div class="badge-reason">${tl(trans.badges[badge.classList[1]].reason)}</div>
                `
            });
        });
    }

    let badges = load_badges(page.name);

    if (badges) {
        badges.forEach((badge) => {
            profile_name_obj.appendChild(create_badge(badge, false, true));
        });
    }

    let badge_elements = profile_name_obj.querySelectorAll('.label');
    let label_container = document.createElement('div');
    label_container.classList.add('badges');
    badge_elements.forEach((badge) => {
        label_container.appendChild(badge);
    });
    profile_name_obj.appendChild(label_container);
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
        <div class="toolbar">
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

    page.structure.row.insertBefore(
        friends_nav,
        page.structure.row.firstElementChild
    );
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

    const user_panel = html.node`
        <section class="users">
            ${view_buttons}
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

    let artist_elem_full = artist_elem;

    const img = art.querySelector('.cover-art');
    hoshino(
        img.querySelector(':scope > img'),
        name_elem.textContent.trim(),
        artist_elem.textContent.trim()
    );

    if (settings.format_guest_features) {
        let song_title = name_elem.textContent;

        let formatted_title = name_includes(
            song_title,
            artist_elem.textContent
        );
        let song_tags = {};

        if (formatted_title) {
            song_title = formatted_title[0];
            song_tags = formatted_title[1];
        }

        // combine
        render(
            name_elem,
            html.node`
            <div class="title">${romanise(song_title.trim())}</div>
            ${song_tags.map(
                (tag) => html.node`
                <div class="feat" data-bwaa--tag-type="${tag.type}" data-bwaa--tag-group="${tag.group}">${romanise(tag.text)}</div>
            `
            )}
        `
        );

        artist_elem_full = html.node`
            <div class="source-album-artist">
                <a href="${root}music/${redirect()}${sanitise(formatted_title[2])}">${romanise(formatted_title[2])}</a>
            </div>
        `;

        // append guests
        let song_guests = formatted_title[3];
        for (let guest in song_guests) {
            // &
            artist_elem_full.innerHTML = `${artist_elem_full.innerHTML},`;

            let guest_element = document.createElement('a');
            guest_element.setAttribute(
                'href',
                `${root}music/${redirect()}${sanitise(song_guests[guest])}`
            );
            guest_element.textContent = romanise(song_guests[guest]);

            artist_elem_full.appendChild(guest_element);
        }
    } else if (settings.corrections) {
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
        <section class="featured-item-panel">
            <div class="sub-text">
                ${
                    form ?
                        html.node`
                <a class="has-icon" data-type="obsession" href=${link}>
                    <div class="bleh-icon" style="--icon: var(--mask)" />
                    ${tl(trans.obsession)}
                </a>
                ${form}
                `
                    :   html.node`
                <div class="has-icon" data-type="track">
                    <div class="bleh-icon" style="--icon: var(--mask)" />
                    ${tl(trans.top_track)}
                </div>
                `
                }
            </div>
            <div class="source-album js-link-block link-block">
                <div class="source-album-art small">
                    ${img}
                </div>
                <div class="source-album-details">
                    <h4 class="source-album-name">${name_elem}</h4>
                    ${artist_elem_full}
                </div>
                <a class="js-link-block-cover-link link-block-cover-link" href=${name_elem.getAttribute('href')} />
            </div>
        </section>
    `;

    page.structure.side.insertBefore(
        panel,
        page.structure.side.firstElementChild
    );
}

function profile_recents() {
    let panel = page.structure.main.querySelector('#recent-tracks-section');
    if (!panel) return;

    let more_link = panel.nextElementSibling;
    panel.appendChild(more_link);

    let form = panel.querySelector('#recent-tracks-settings');
    let link = panel.querySelector('[aria-controls="recent-tracks-settings"]');
    let tooltip;

    let view_buttons = document.createElement('div');
    view_buttons.classList.add('view-buttons', 'blend', 'blend-v2');

    let header = document.createElement('div');
    header.classList.add('top-container');

    let header_text = panel.querySelector('h2');
    header.appendChild(header_text);

    let refresh_btn;

    // refresh
    refresh_btn = html.node`
        <button class="left-icon blend-v2-btn" data-type="refresh" onclick=${() => refresh_tracks(refresh_btn, {})}>
            ${tl(trans.refresh)}
        </button>
    `;
    view_buttons.appendChild(refresh_btn);

    header.appendChild(view_buttons);
    panel.insertBefore(header, panel.firstElementChild);

    if (!form) return;

    if (page.token == '')
        page.token = form
            .querySelector('[name="csrfmiddlewaretoken"]')
            .getAttribute('value');

    let original_chart_settings = {};

    let settings_btn = html.node`
        <button class="left-icon blend-v2-btn" data-type="settings">
            ${tl(trans.settings)}
        </button>
    `;

    let count = form.querySelector('[name="chart_length_recent_tracks"]');
    original_chart_settings = {
        recent_artwork: form.querySelector('#id_show_recent_tracks_artwork')
            .checked,
        recent_realtime: form.querySelector('#id_auto_refresh_recent_tracks')
            .checked
    };

    form.classList = '';
    render(
        form,
        html`
            <input
                type="hidden"
                name="csrfmiddlewaretoken"
                value="${page.token}"
            />
            <div class="setting-group blend">
                <div class="setting" data-type="select">
                    <div class="heading">
                        <h5>${tl(trans.amount_to_display)}</h5>
                    </div>
                    ${select(
                        select_prepare(count),
                        count.value,
                        'chart_length_recent_tracks'
                    )}
                </div>
                <div
                    class="setting"
                    data-type="toggle"
                    id="container-recent_artwork"
                    onclick="_update_inbuilt_item('recent_artwork')"
                >
                    <div class="heading">
                        <h5>${tl(trans.recent_artwork)}</h5>
                    </div>
                    <div class="toggle-wrap">
                        <input
                            class="companion-checkbox"
                            type="checkbox"
                            name="show_recent_tracks_artwork"
                            id="inbuilt-companion-checkbox-recent_artwork"
                        />
                        <span
                            class="btn toggle"
                            id="toggle-recent_artwork"
                            aria-checked="false"
                        >
                            <div class="dot"></div>
                        </span>
                    </div>
                </div>
                <div
                    class="setting"
                    data-type="toggle"
                    id="container-recent_realtime"
                    onclick="_update_inbuilt_item('recent_realtime')"
                >
                    <div class="heading">
                        <h5>${tl(trans.recent_realtime.name)}</h5>
                        <p>${tl(trans.recent_realtime.body)}</p>
                    </div>
                    <div class="toggle-wrap">
                        <input
                            class="companion-checkbox"
                            type="checkbox"
                            name="auto_refresh_recent_tracks"
                            id="inbuilt-companion-checkbox-recent_realtime"
                        />
                        <span
                            class="btn toggle"
                            id="toggle-recent_realtime"
                            aria-checked="false"
                            type="button"
                        >
                            <div class="dot"></div>
                        </span>
                    </div>
                </div>
                ${setting({ id: 'format_guest_features' })}
                ${setting({ id: 'stacked_chartlist_info' })}
                <div class="settings-footer">
                    <button type="submit" class="btn-primary save">
                        ${tl(trans.save)}
                    </button>
                    <a
                        class="btn icon settings not-a-view-button"
                        href="${root}bleh"
                    >
                        ${tl(trans.settings)}
                    </a>
                </div>
            </div>
        `
    );

    for (let setting in original_chart_settings) {
        update_inbuilt_item(
            setting,
            original_chart_settings[setting],
            false,
            form
        );
    }

    refresh_all(form);

    tooltip = tippy(settings_btn, {
        theme: 'window',
        content: form,
        allowHTML: true,
        placement: 'bottom',
        interactive: true,
        interactiveBorder: 10,
        trigger: 'click',
        appendTo: document.body,
        hideOnClick: 'toggle',

        onClickOutside(instance) {
            if (instance.popper.querySelector('[aria-expanded="true"]')) {
                return;
            }

            instance.hide();
        }
    });

    view_buttons.appendChild(settings_btn);
}

function profile_artists() {
    let panel = page.structure.main.querySelector('#top-artists');
    if (!panel) return;

    panel.classList.remove('section-with-settings');

    let form = panel.querySelector('#artist-chart-settings');
    let list = panel.querySelector('#artists_range');

    let collage_btn;
    let select_btn = panel.querySelector('.dropdown-menu-clickable-button');
    let settings_btn;

    panel.insertBefore(
        html.node`
        <div class="top-container">
            ${panel.querySelector('h2')}
            <div class="accompany view-buttons blend blend-v2">
                ${() => {
                    select_btn.classList.add(
                        'select-button',
                        'link-select',
                        'blend-v2-btn'
                    );
                    select_btn.classList.remove(
                        'section-control',
                        'dropdown-menu-clickable-button'
                    );
                    return select_btn;
                }}
            </div>
            <div class="view-buttons blend blend-v2">
                <button class="left-icon blend-v2-btn" data-type="collage" ref=${(el) => (collage_btn = el)} onclick=${() => {
                    let btn = list.querySelector(
                        '.dropdown-menu-clickable-item--selected'
                    );
                    let link = new URL(
                        'https://www.last.fm' + btn.getAttribute('href')
                    );
                    let selected = link.searchParams.get('artists_date_preset');

                    window.location.href = `${root}bleh/minis/collage?type=artists&timeframe=date_preset=${selected}`;
                }}>${tl(trans.collage)}</button>
                ${
                    form ?
                        html.node`
                <button class="left-icon blend-v2-btn" data-type="settings" ref=${(el) => (settings_btn = el)}>
                    ${tl(trans.settings)}
                </button>
                `
                    :   ''
                }
            </div>
        </div>
    `,
        panel.firstElementChild
    );

    // own profile only

    if (!form) return;
    if (page.token == '')
        page.token = form
            .querySelector('[name="csrfmiddlewaretoken"]')
            .getAttribute('value');

    let timeframe = form.querySelector('[name="chart_range_top_artists"]');
    let style = form.querySelector('[name="chart_style_top_artists"]');
    let grid_length = form.querySelector('[name="artists_image_grid_length"]');
    let chartlist_length = form.querySelector(
        '[name="artists_chartlist_length"]'
    );

    form.classList = '';
    render(
        form,
        html`
            <input
                type="hidden"
                name="csrfmiddlewaretoken"
                value="${page.token}"
            />
            <div class="setting-group blend">
                <div class="setting" data-type="select">
                    <div class="heading">
                        <h5>${tl(trans.default_timeframe)}</h5>
                    </div>
                    ${select(
                        select_prepare(timeframe),
                        timeframe.value,
                        'chart_range_top_artists'
                    )}
                </div>
                <div class="setting" data-type="select">
                    <div class="heading">
                        <h5>${tl(trans.chart_style)}</h5>
                    </div>
                    ${select(
                        select_prepare(style),
                        style.value,
                        'chart_style_top_artists'
                    )}
                </div>
                <div class="setting hide-if-artist-list" data-type="select">
                    <div class="heading">
                        <h5>${tl(trans.chart_size)}</h5>
                    </div>
                    ${select(
                        select_prepare(grid_length),
                        grid_length.value,
                        'artists_image_grid_length'
                    )}
                </div>
                <div class="setting hide-if-artist-grid" data-type="select">
                    <div class="heading">
                        <h5>${tl(trans.chart_size)}</h5>
                    </div>
                    ${select(
                        select_prepare(chartlist_length),
                        chartlist_length.value,
                        'artists_chartlist_length'
                    )}
                </div>
                <div class="settings-footer">
                    <button type="submit" class="btn-primary save">
                        ${tl(trans.save)}
                    </button>
                </div>
            </div>
        `
    );

    tippy(settings_btn, {
        theme: 'window',
        content: form,
        placement: 'bottom',
        interactive: true,
        interactiveBorder: 10,
        trigger: 'click',
        appendTo: document.body,
        hideOnClick: 'toggle',

        onClickOutside(instance) {
            if (instance.popper.querySelector('[aria-expanded="true"]')) {
                return;
            }

            instance.hide();
        }
    });
}

function profile_albums() {
    let panel = page.structure.main.querySelector('#top-albums');
    if (!panel) return;

    panel.classList.remove('section-with-settings');

    let form = panel.querySelector('#albums-chart-settings');
    let list = panel.querySelector('#albums_range');

    let collage_btn;
    let select_btn = panel.querySelector('.dropdown-menu-clickable-button');
    let settings_btn;

    panel.insertBefore(
        html.node`
        <div class="top-container">
            ${panel.querySelector('h2')}
            <div class="accompany view-buttons blend blend-v2">
                ${() => {
                    select_btn.classList.add(
                        'select-button',
                        'link-select',
                        'blend-v2-btn'
                    );
                    select_btn.classList.remove(
                        'section-control',
                        'dropdown-menu-clickable-button'
                    );
                    return select_btn;
                }}
            </div>
            <div class="view-buttons blend blend-v2">
                <button class="left-icon blend-v2-btn" data-type="collage" ref=${(el) => (collage_btn = el)} onclick=${() => {
                    let btn = list.querySelector(
                        '.dropdown-menu-clickable-item--selected'
                    );
                    let link = new URL(
                        'https://www.last.fm' + btn.getAttribute('href')
                    );
                    let selected = link.searchParams.get('albums_date_preset');

                    window.location.href = `${root}bleh/minis/collage?type=albums&timeframe=date_preset=${selected}`;
                }}>${tl(trans.collage)}</button>
                ${
                    form ?
                        html.node`
                <button class="left-icon blend-v2-btn" data-type="settings" ref=${(el) => (settings_btn = el)}>
                    ${tl(trans.settings)}
                </button>
                `
                    :   ''
                }
            </div>
        </div>
    `,
        panel.firstElementChild
    );

    // own profile only

    if (!form) return;
    if (page.token == '')
        page.token = form
            .querySelector('[name="csrfmiddlewaretoken"]')
            .getAttribute('value');

    let timeframe = form.querySelector('[name="chart_range_top_albums"]');
    let style = form.querySelector('[name="chart_style_top_albums"]');
    let grid_length = form.querySelector('[name="albums_image_grid_length"]');
    let chartlist_length = form.querySelector(
        '[name="albums_chartlist_length"]'
    );

    form.classList = '';
    render(
        form,
        html`
            <input
                type="hidden"
                name="csrfmiddlewaretoken"
                value="${page.token}"
            />
            <div class="setting-group blend">
                <div class="setting" data-type="select">
                    <div class="heading">
                        <h5>${tl(trans.default_timeframe)}</h5>
                    </div>
                    ${select(
                        select_prepare(timeframe),
                        timeframe.value,
                        'chart_range_top_albums'
                    )}
                </div>
                <div class="setting" data-type="select">
                    <div class="heading">
                        <h5>${tl(trans.chart_style)}</h5>
                    </div>
                    ${select(
                        select_prepare(style),
                        style.value,
                        'chart_style_top_albums'
                    )}
                </div>
                <div class="setting hide-if-album-list" data-type="select">
                    <div class="heading">
                        <h5>${tl(trans.chart_size)}</h5>
                    </div>
                    ${select(
                        select_prepare(grid_length),
                        grid_length.value,
                        'albums_image_grid_length'
                    )}
                </div>
                <div class="setting hide-if-album-grid" data-type="select">
                    <div class="heading">
                        <h5>${tl(trans.chart_size)}</h5>
                    </div>
                    ${select(
                        select_prepare(chartlist_length),
                        chartlist_length.value,
                        'albums_chartlist_length'
                    )}
                </div>
                <div class="settings-footer">
                    <button type="submit" class="btn-primary save">
                        ${tl(trans.save)}
                    </button>
                </div>
            </div>
        `
    );

    tippy(settings_btn, {
        theme: 'window',
        content: form,
        placement: 'bottom',
        interactive: true,
        interactiveBorder: 10,
        trigger: 'click',
        appendTo: document.body,
        hideOnClick: 'toggle',

        onClickOutside(instance) {
            if (instance.popper.querySelector('[aria-expanded="true"]')) {
                return;
            }

            instance.hide();
        }
    });
}

function profile_tracks() {
    let panel = page.structure.main.querySelector('#top-tracks');
    if (!panel) return;

    panel.classList.remove('section-with-settings');

    let form = panel.querySelector('#track-chart-settings');
    let list = panel.querySelector('#tracks_range');

    let collage_btn;
    let select_btn = panel.querySelector('.dropdown-menu-clickable-button');
    let settings_btn;

    panel.insertBefore(
        html.node`
        <div class="top-container">
            ${panel.querySelector('h2')}
            <div class="accompany view-buttons blend blend-v2">
                ${() => {
                    select_btn.classList.add(
                        'select-button',
                        'link-select',
                        'blend-v2-btn'
                    );
                    select_btn.classList.remove(
                        'section-control',
                        'dropdown-menu-clickable-button'
                    );
                    return select_btn;
                }}
            </div>
            <div class="view-buttons blend blend-v2">
                <button class="left-icon blend-v2-btn" data-type="collage" ref=${(el) => (collage_btn = el)} onclick=${() => {
                    let btn = list.querySelector(
                        '.dropdown-menu-clickable-item--selected'
                    );
                    let link = new URL(
                        'https://www.last.fm' + btn.getAttribute('href')
                    );
                    let selected = link.searchParams.get('tracks_date_preset');

                    window.location.href = `${root}bleh/minis/collage?type=tracks&timeframe=date_preset=${selected}`;
                }}>${tl(trans.collage)}</button>
                ${
                    form ?
                        html.node`
                <button class="left-icon blend-v2-btn" data-type="settings" ref=${(el) => (settings_btn = el)}>
                    ${tl(trans.settings)}
                </button>
                `
                    :   ''
                }
            </div>
        </div>
    `,
        panel.firstElementChild
    );

    // own profile only

    if (!form) return;
    if (page.token == '')
        page.token = form
            .querySelector('[name="csrfmiddlewaretoken"]')
            .getAttribute('value');

    let timeframe = form.querySelector('[name="chart_range_top_tracks"]');
    let chartlist_length = form.querySelector(
        '[name="chart_length_top_tracks"]'
    );

    form.classList = '';
    render(
        form,
        html`
            <input
                type="hidden"
                name="csrfmiddlewaretoken"
                value="${page.token}"
            />
            <div class="setting-group blend">
                <div class="setting" data-type="select">
                    <div class="heading">
                        <h5>${tl(trans.default_timeframe)}</h5>
                    </div>
                    ${select(
                        select_prepare(timeframe),
                        timeframe.value,
                        'chart_range_top_tracks'
                    )}
                </div>
                <div class="setting hide-if-track-grid" data-type="select">
                    <div class="heading">
                        <h5>${tl(trans.chart_size)}</h5>
                    </div>
                    ${select(
                        select_prepare(chartlist_length),
                        chartlist_length.value,
                        'chart_length_top_tracks'
                    )}
                </div>
                <div class="sep" />
                ${setting({ id: 'format_guest_features' })}
                ${setting({ id: 'show_guest_features' })}
                <div class="more-link">
                    <a href="${root}bleh/music">${tl(trans.settings)}</a>
                </div>
                <div class="settings-footer">
                    <button type="submit" class="btn-primary save">
                        ${tl(trans.save)}
                    </button>
                </div>
            </div>
        `
    );

    tippy(settings_btn, {
        theme: 'window',
        content: form,
        placement: 'bottom',
        interactive: true,
        interactiveBorder: 10,
        trigger: 'click',
        appendTo: document.body,
        hideOnClick: 'toggle',

        onClickOutside(instance) {
            if (instance.popper.querySelector('[aria-expanded="true"]')) {
                return;
            }

            instance.hide();
        }
    });
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

function parse_sub_text(profile_sub_text, name = page.name) {
    const display_name = profile_sub_text.querySelector(
        '.header-title-display-name'
    );
    const scrobble_since = profile_sub_text.querySelector(
        '.header-scrobble-since'
    );
    scrobble_since.textContent = scrobble_since.textContent
        .slice(2)
        .replace(tl(trans.account_scrobbling_since_replace), '');

    profile_sub_text.insertBefore(
        html.node`
        <span class="header-title-secondary--pre">
            ${tl(trans.aka)}
        </span>
    `,
        display_name
    );

    profile_sub_text.insertBefore(
        html.node`
        <span class="header-title-secondary--pre">
            ${tl(trans.account_created)}
        </span>
    `,
        scrobble_since
    );
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
