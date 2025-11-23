//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { settings } from '../build/config';
import { log } from '../build/log';
import { auth, page, root } from '../build/page';
import {
    clamp_lit,
    clamp_sat,
    hex_to_hsl,
    sanitise
} from '../build/tools';
import { lang, tl, trans } from '../build/trans';
import { bleh_about_artist } from '../components/about_artist';
import { correct_artist, correct_item_by_artist } from '../components/lotus';
import {
    get_listen_stats,
    get_similar_artists,
    get_tags,
    redirect,
    show_your_scrobbles
} from '../components/music';
import { checkup_page_structure } from '../components/structure';
import { update_page } from '../page';
import { ff } from '../sku';
import { bleh_gallery_list, bleh_gallery_upload } from './gallery';
import { bleh_tags_mini } from './tag';
import { bleh_wiki, bleh_wiki_editor, bleh_wiki_history } from './wiki';
import { html, render } from 'lighterhtml';
import { oracle_process } from '../components/oracle.js';
import { breadcrumb } from '../components/header.js';

export function bleh_albums() {
    let album_header = document.body.querySelector('.header-new--album');

    page.sister = album_header.querySelector('.header-new-crumb span').textContent;
    page.name = document.body.querySelector('[data-page-resource-name]').getAttribute('data-page-resource-name');

    let is_subpage = album_header.classList.contains('header-new--subpage');

    // without pro theres two containers
    if (auth.pro) {
        // pro

        page.structure.container = document.body.querySelector('.page-content:not(:has(.content-top-lower-row, a + .js-gallery-heading))');
    } else {
        // not pro

        if (!is_subpage) {
            // normal, is there an ad then a container?
            page.structure.container = document.body.querySelector(
                '.full-bleed-ad-container + .page-content:not(.visible-xs)'
            );

            // death grips for some reason
            if (!page.structure.container)
                page.structure.container =
                    document.body.querySelector('.page-content');
        } else {
            page.structure.container = document.body.querySelector(
                '.page-content:not(:has(.content-top-lower-row, a + .js-gallery-heading))'
            );
        }
    }
    page.structure.row = page.structure.container.querySelector('.row');
    try {
        page.structure.main = page.structure.row.querySelector(
            '.col-main:not(.visible-xs, .hidden-xs, .upper-overview)'
        );
        if (!is_subpage)
            page.structure.side = page.structure.row.querySelector(
                '.col-sidebar.hidden-xs.masonry-right-bottom'
            );
        else
            page.structure.side = page.structure.row.querySelector(
                '.col-sidebar.hidden-xs'
            );
    } catch (e) {
        log('unable to find elements', 'page structure');
    }

    checkup_page_structure(is_subpage, album_header);

    if (page.subpage == 'overview') {
        const avatar = album_header.querySelector('.header-new-background-image');
        const position = album_header.querySelector('.header-new-chart-position-number');

        const avatar_img = avatar?.getAttribute('content').replace('/ar0/', '/avatar300s/');

        const { listeners, scrobbles, metascore } = get_listen_stats();
        const { tags, see_more } = get_tags();

        const header = html.node`
            ${breadcrumb()}
            <section class="profile-album-section">
                <div class="album-info">
                    <h1>${{html: tl(trans.value_by_user, {
                        v: correct_item_by_artist(page.name, page.sister),
                        u: `<a href="${root}music/${sanitise(page.sister)}">${correct_artist(page.sister)}</a>`
                    })}}</h1>
                    <div class="stats">
                        ${tl(trans.plays_and_listeners, {
                            l: listeners.value.toLocaleString(lang),
                            p: scrobbles.value.toLocaleString(lang)
                        })}
                    </div>
                    <div class="actions">

                    </div>
                    <div class="tags">
                        ${tl(trans.popular_tags)}: ${tags.map((tag, i, list) => html.node`
                            ${tag}${i < list.length - 1 ? ', ' : ''}
                        `)} ${see_more}
                    </div>
                    <div class="shouts">
                        ${tl(trans.shouts)}: <a href="${root}music/${sanitise(page.sister)}/${sanitise(page.name)}/+shoutbox">${tl(trans.leave_a_shout)}</a>
                    </div>
                    <div class="share-bar">
                        <strong>${tl(trans.share_this_album)}</strong>
                        <a class="btn-primary" href=${window.location.href}>${tl(trans.share_link)}</a>
                    </div>
                </div>
                <div class="album-image-side">
                    <a class="image">
                        ${avatar ? html.node`
                            <img src=${avatar_img}>
                        ` : html.node`
                            <img class="missing-album mega">
                        `}
                    </a>
                </div>
        `;
        page.structure.main.insertBefore(header, page.structure.main.firstElementChild);
    } else {
        page.structure.main.insertBefore(breadcrumb(), page.structure.main.firstElementChild);
    }

    album_header.classList.add('legacy-header');

    // cover
    if (settings.hue_from_album) {
        let header_inner = album_header.querySelector('.header-new-inner');
        try {
            let bg = header_inner
                .getAttribute('style')
                .replace('background: #', '');
            let hsl = hex_to_hsl(bg);

            let sat = clamp_sat((hsl.s / 100) * 3);
            let lit = clamp_lit(sat, hsl.l / 100 + 0.35);

            document.body.style.setProperty('--hue-album', hsl.h);
            document.body.style.setProperty('--sat-album', sat);
            document.body.style.setProperty('--lit-album', lit);

            log(
                `sourced hsl of (${hsl.h}, ${hsl.s}, ${hsl.l}) - using final value of (${hsl.h}, ${sat}, ${lit})`,
                'hue from album'
            );
        } catch (e) {
            log('no cover present', 'hue from album');
        }
    }

    if (!is_subpage) {
        show_your_scrobbles();

        bleh_about_artist();

        bleh_tags_mini();

        album_tracklist();

        let similar_albums =
            page.structure.main.querySelector('.similar-albums');
        if (similar_albums) {
            let similar_panel = similar_albums.parentElement;
            similar_panel.classList.add('similar-panel');
        }
    } else {
        let btn_add = page.structure.side.querySelector('.add-button');
        if (btn_add) btn_add.setAttribute('data-page-subpage', page.subpage);

        if (page.subpage == 'images_image-upload') bleh_gallery_upload();
        else if (page.subpage == 'images_overview') bleh_gallery_list();
        else if (page.subpage == 'wiki_overview') bleh_wiki();
        else if (page.subpage == 'wiki_history') bleh_wiki_history();
        else if (page.subpage == 'wiki_edit') bleh_wiki_editor();
    }

    if (ff('oracle') && settings.oracle_beta) oracle_process();

    log('status is', 'page', 'info', page);
    update_page();
}

function album_tracklist() {
    const tracklist_panel = page.structure.main.querySelector('#tracklist');
    if (!tracklist_panel) return;

    const similar_items = get_similar_artists();
    const radio = document.body.querySelector('.stationlink[data-analytics-label="artist"]');

    if (!radio) return;

    radio.classList = 'station-button-large';
    render(radio, html`
        <strong>${tl(trans.play_user_radio, { u: correct_artist(page.sister) })}</strong>
        <p>${{html: tl(trans.radio_with, {
            u: html.node`<span>${Array.from(similar_items).map((item, index, arr) => {
                if (index > 3) return html.node``;

                const text = item.querySelector('.catalogue-overview-similar-artists-item-name').textContent.trim();

                return html.node`
                ${correct_artist(text)}${index < 3 ? ', ' : ''}
            `;
            })}</span>`.outerHTML
        })}}</p>
    `);

    const tracklist = tracklist_panel.querySelector(':scope > .buffer-standard');
    tracklist.after(radio);
}
