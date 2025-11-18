//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { log } from '../build/log';
import { page, root } from '../build/page';
import { ff } from '../sku';
import { html, render } from 'lighterhtml';
import { tl, trans } from '../build/trans.js';

export function basic_page_structure() {
    page.structure.container = document.body.querySelector('.page-content');
    try {
        page.structure.row = page.structure.container.querySelector('.row');
        page.structure.main = page.structure.row.querySelector('.col-main');
        page.structure.side = page.structure.row.querySelector('.col-sidebar');
    } catch (e) {
        log('unable to find elements', 'page structure');
    }

    checkup_page_structure();
}

/**
 * ensures general health of the page structure, fills in the global page object
 * @param {boolean} is_subpage controls if the checker should identify content_top's etc.
 * @param {HTMLObjectElement|null} header legacy header from last.fm to extract data from
 */
export function checkup_page_structure(is_subpage = false, header = null) {
    let params = new URLSearchParams(document.location.search);
    page.requested = {
        tab: params.get('tab'),
        page: params.get('page'),
        token: params.get('token'),
        collage: params.get('collage')
    };

    if (
        !page.structure.container ||
        !document.body.contains(page.structure.container)
    ) {
        log('page missing container, creating', 'page structure');
        page.structure.container = document.createElement('div');
        page.structure.container.classList.add('page-content', 'container');

        // listening report error
        let container_full_width = document.body.querySelector(
            '.container--full-width'
        );
        if (container_full_width)
            container_full_width.insertBefore(
                page.structure.container,
                container_full_width.firstElementChild
            );
        else
            document.body
                .querySelector('.adaptive-skin-container')
                .appendChild(page.structure.container);
    }

    page.structure.container.setAttribute('data-assigned', 'true');

    let other_container = document.body.querySelector(
        '.page-content.container:not([data-assigned])'
    );
    if (other_container) other_container.style.setProperty('display', 'none');

    if (!page.structure.row || !document.body.contains(page.structure.row)) {
        log('page missing row, creating', 'page structure');
        page.structure.row = document.createElement('div');
        page.structure.row.classList.add('row');

        page.structure.container.insertBefore(
            page.structure.row,
            page.structure.container.firstElementChild
        );
    }
    if (page.structure.row.classList.contains('buffer-4'))
        page.structure.row.classList = 'row col-main-is-primary';

    page.structure.row.setAttribute('data-assigned', 'true');

    if (!page.structure.main || !document.body.contains(page.structure.main)) {
        log('page missing main, creating', 'page structure');
        page.structure.main = document.createElement('div');
        page.structure.main.classList.add('col-main');

        page.structure.row.appendChild(page.structure.main);
    }

    page.structure.main.setAttribute('data-assigned', 'true');

    let other_main = page.structure.row.querySelector(
        '.col-main.hidden-xs:not([data-assigned])'
    );
    if (other_main) other_main.style.setProperty('display', 'none');

    if (!page.structure.side || !document.body.contains(page.structure.side)) {
        log('page missing side', 'page structure');
        // check first if another sidebar exists
        page.structure.side = page.structure.row.querySelector('.col-sidebar');

        if (!page.structure.side) {
            log('page missing side, creating', 'page structure');

            // otherwise, make anew
            page.structure.side = document.createElement('div');
            page.structure.side.classList.add('col-sidebar');

            page.structure.row.appendChild(page.structure.side);
        }
    }

    log('finished', 'page structure');

    if (header) {
        let navlist = header.querySelector('.navlist');

        if (navlist) {
            page.structure.row.insertBefore(
                navlist,
                page.structure.row.firstElementChild
            );
            page.structure.nav = navlist;

            let overview = page.structure.nav.querySelector(
                '.secondary-nav-item--overview a'
            );

            if (overview) {
                const href = overview.getAttribute('href').replace(root, '');

                // we only want to replace the 'Overview' text
                // which is not present on these pages
                if (href == 'settings' || href == 'inbox' || href == 'charts')
                    overview = null;
            }

            let text = tl(trans[page.type]);
            if (page.type == 'user') text = tl(trans.profile);

            if (overview) overview.textContent = text;
        }
    }

    page.structure.content_top = document.body.querySelector('.content-top');
}

export function checkup_nav() {
    if (!ff('short')) return;

    if (page.structure.nav)
        page.structure.nav.setAttribute('data-assigned', 'true');

    let navlists =
        page.structure.container.querySelectorAll(':scope > .navlist');
    navlists.forEach((nav, index) => {
        console.info(index);
        if (index < 1) return;

        if (ff('mualani')) {
            let toolbar = html.node`
                <div class="toolbar">
                    ${nav}
                </div>
            `;

            page.structure.row.insertBefore(toolbar, page.structure.content);
        } else {
            page.structure.row.insertBefore(nav, page.structure.content);
        }
    });
}

export function convert_to_toolbar() {
    const nav = page.structure.content_top.querySelector('.navlist');
    if (!nav) return;

    page.structure.toolbar = html.node`
        <div class="friend-tabs">
            ${nav}
        </div>
    `;

    page.structure.main.insertBefore(page.structure.toolbar,page.structure.main.firstElementChild);

    page.structure.content_top.style.display = 'none';
}

export function tab_replace(query, text) {
    if (!page.structure.nav) return;

    const tab = page.structure.nav.querySelector(`.secondary-nav-item--${query} a`);
    if (tab) tab.textContent = text;
}
