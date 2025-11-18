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
    clean_number,
    desanitise,
    hex_to_hsl,
    sanitise
} from '../build/tools';
import { tl, trans } from '../build/trans';
import { bleh_about_artist } from '../components/about_artist';
import { correct_artist, correct_item_by_artist, patch_header_title } from '../components/lotus';
import { register_menu } from '../components/menu';
import {
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
import { expand_avatar } from '../avatar.js';
import { setting } from '../components/settings.js';
import tippy from 'tippy.js';
import { oracle_process } from '../components/oracle.js';
import { save_hoshino_artwork } from '../components/hoshino.js';

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

    const avatar = album_header.querySelector('.header-new-background-image');
    const position = album_header.querySelector('.header-new-chart-position-number');

    const avatar_img = avatar?.getAttribute('content').replace('/ar0/', '/avatar300s/');

    const listeners = document.body.querySelector('.header-new-info-desktop .header-metadata-tnew-display > p > abbr');

    save_hoshino_artwork(
        avatar_img,
        page.name,
        page.sister,
        clean_number(listeners?.title)
    );

    const header = html.node`
        <section class="profile-album-section">
            <div class="album-info">
                <h1>${{html: tl(trans.value_by_user, {
                    v: correct_item_by_artist(page.name, page.sister),
                    u: `<a href="${root}music/${page.sister}">${correct_artist(page.sister)}</a>`
                })}}</h1>
                <div class="stats">

                </div>
                <div class="actions">

                </div>
                <div class="tags">

                </div>
                <div class="shouts">

                </div>
                <div class="share-bar">

                </div>
            </div>
            <div class="album-image-side">
                <a class="image">
                    ${avatar ? html.node`
                        <img src=${avatar_img}>
                    ` : ''}
                </a>
            </div>
    `;
    page.structure.main.insertBefore(header, page.structure.main.firstElementChild);
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

        album_missing_a_tracklist();

        bleh_about_artist();

        bleh_tags_mini();

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

function album_missing_a_tracklist() {
    // tracklist
    let tracklist = page.structure.main.querySelector('#tracklist');

    let settings_btn;

    if (tracklist) {
        let top = tracklist.querySelector('.section-controls');
        top.classList = 'top-container';

        let header = top.querySelector('h3');

        let select_btn = top.querySelector('.dropdown-menu-clickable-button');

        if (select_btn) {
            select_btn.classList.add(
                'select-button',
                'link-select',
                'blend-v2-btn'
            );
            select_btn.classList.remove('dropdown-menu-clickable-button');
        }

        header.after(html.node`
            <div class="accompany view-buttons blend blend-v2">
                ${select_btn}
            </div>
            <div class="view-buttons blend blend-v2">
                <button class="left-icon blend-v2-btn" data-type="settings" ref=${(el) => (settings_btn = el)}>
                    ${tl(trans.settings)}
                </button>
            </div>
        `);
    } else {
        let top_overview = page.structure.main.querySelector(
            '.top-overview-panel'
        );
        if (!top_overview) return;

        let top = html.node`
            <div class="top-container">
                <h3 class="text-18">${tl(trans.tracklist)}</h3>
                <div class="view-buttons blend blend-v2">
                    <button class="left-icon blend-v2-btn" data-type="settings" ref=${(el) => (settings_btn = el)}>
                        ${tl(trans.settings)}
                    </button>
                </div>
            </div>
        `;

        tracklist = html.node`
            <section>
                ${top}
                <div class="loading-data-container">
                    <p class="loading-data-text">${tl(trans.gathering_your_plays)}</p>
                </div>
            </section>
        `;
        top_overview.after(tracklist);

        /*let url_split = window.location.href.split('/');
        let album_url = `${url_split[(url_split.length - 2)]}/${url_split[(url_split.length - 1)]}`;
        let album_as_track_url = window.location.href.replace(album_url, `${url_split[(url_split.length - 2)]}/_/${url_split[(url_split.length - 1)]}`);*/

        let url = document.querySelector('.header-metadata-display a');
        if (!url) {
            let url_split = window.location.href.split('/');
            let album_url = `${url_split[url_split.length - 2]}/${url_split[url_split.length - 1]}`;
            let album_as_track_url = window.location.href.replace(
                album_url,
                `${url_split[url_split.length - 2]}/_/${url_split[url_split.length - 1]}`
            );

            render(
                tracklist,
                html`
                    ${top}
                    <div class="loading-data-container">
                        <p class="loading-data-text failed">
                            ${tl(trans.failed_to_find_tracks)}
                        </p>
                        <a class="see-more" href="${album_as_track_url}"
                            >${tl(trans.open_album_as_track)}</a
                        >
                    </div>
                `
            );
            return;
        }
        url = url.getAttribute('href');

        // we need to fetch the tracklist
        fetch(url)
            .then(function (response) {
                console.error('returned', response, response.text);

                return response.text();
            })
            .then(function (dom) {
                let doc = new DOMParser().parseFromString(dom, 'text/html');

                //deliver_notif(`using url ${`/user/${auth.name}/library/music/${album_url}`}`);
                console.log('DOC', doc);

                let inner_tracklist = doc.querySelector(
                    '#top-tracks-section [v-else=""] .chartlist'
                );
                if (inner_tracklist == null) {
                    let url_split = window.location.href.split('/');
                    let album_url = `${url_split[url_split.length - 2]}/${url_split[url_split.length - 1]}`;
                    let album_as_track_url = window.location.href.replace(
                        album_url,
                        `${url_split[url_split.length - 2]}/_/${url_split[url_split.length - 1]}`
                    );

                    render(
                        tracklist,
                        html`
                            ${top}
                            <div class="loading-data-container">
                                <p class="loading-data-text failed">
                                    ${tl(trans.failed_to_find_tracks)}
                                </p>
                                <a class="see-more" href=${album_as_track_url}
                                    >${tl(trans.open_album_as_track)}</a
                                >
                            </div>
                        `
                    );
                    return;
                }

                inner_tracklist.classList.remove('chartlist--with-image');

                render(
                    tracklist,
                    html`
                        ${top}
                        <div class="alert alert-info">
                            ${tl(trans.sourced_from_own_plays)}
                        </div>
                        ${inner_tracklist}
                    `
                );
            });
    }

    tippy(settings_btn, {
        theme: 'window',
        content: html.node`
            <div class="dialog-settings">
                <div class="setting-group blend">
                    ${setting({ id: 'format_guest_features' })}
                    ${setting({ id: 'show_guest_features' })}
                </div>
            </div>
        `,
        placement: 'bottom',
        interactive: true,
        interactiveBorder: 10,
        trigger: 'click'
    });
}
