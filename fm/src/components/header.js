//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { html } from "lighterhtml";
import { page, root } from "../build/page";
import { sanitise } from "../build/tools";
import { correct_artist, correct_item_by_artist } from "./lotus";
import { tl, trans } from "../build/trans";

export function generic_subpage_header(header_title, link_type = 'user', direct_link = '') {
    // determines top text link
    let link_field = html.node`<a href="${root}user/${sanitise(page.name)}">${page.name}</a>`;

    let name = page.name;
    let sister = page.sister;

    if (['album', 'track'].includes(link_type)) {
        name = correct_item_by_artist(page.name, page.sister);
        //sister = correct_artist(page.sister);
    } else if (link_type == 'artist') {
        name = correct_artist(page.name);
    }

    // not a user
    if (link_type == 'artist')
        link_field = html.node`<a href="${root}music/${sanitise(page.name)}">${name}</a>`;
    else if (link_type == 'album')
        link_field = html.node`<a href="${root}music/${sanitise(page.sister)}/${sanitise(page.name)}">${name}</a>`;
    else if (link_type == 'track')
        link_field = html.node`<a href="${root}music/${sanitise(page.sister)}/_/${sanitise(page.name)}">${name}</a>`;
    else if (link_type == 'direct')
        link_field = html.node`<a href="${direct_link}">${name}</a>`;

    return html.node`
        <section class="profile-header-subpage-section" ref=${el => page.state.header = el}>
            ${page.avatar != '' ? html.node`
                <div class="badge-avatar">
                    <img src=${page.avatar} alt=${name}>
                </div>
            ` : ''}
            <div class="badge-info">
                ${link_field}
                <h1 ref=${el => page.state.title = el}>${header_title}</h1>
            </div>
        </section>
    `;
}

export function breadcrumb() {
    let label = page.subpage;

    if (page.subpage != 'overview') {
        if (page.subpage.startsWith('shoutbox')) {
            label = tl(trans.shoutbox);
        } else if (page.subpage.startsWith('tags')) {
            label = tl(trans.tags);
        } else if (page.subpage.startsWith('wiki')) {
            label = tl(trans.wiki);
        } else if (trans.hasOwnProperty(page.subpage)) {
            label = tl(trans[page.subpage]);
        }
    }

    return html.node`
        <div class="page-breadcrumb">
            ${page.subpage != 'overview' ? html.node`
                <a href="${root}music">${tl(trans.music)}</a> » <a href="${root}music/${sanitise(page.sister)}">${correct_artist(page.sister)}</a> » <a href="${root}music/${sanitise(page.sister)}${page.type == 'album' ? '/' : '/_/'}${sanitise(page.name)}">${correct_item_by_artist(page.name, page.sister)}</a> » ${label}
            ` : html.node`
                <a href="${root}music/${sanitise(page.sister)}">${correct_artist(page.sister)}</a> » <span>${correct_item_by_artist(page.name, page.sister)}</span>
            `}
        </div>
    `;
}
