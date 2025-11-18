//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { html } from "lighterhtml";
import { page, root } from "../build/page";
import { sanitise } from "../build/tools";

export function generic_subpage_header(header_title, link_type = 'user', direct_link = '') {
    // determines top text link
    let link_field = html.node`<a href="${root}user/${sanitise(page.name)}">${page.name}</a>`;

    // not a user
    if (link_type == 'artist')
        link_field = html.node`<a href="${root}music/${sanitise(page.name)}">${page.name}</a>`;
    else if (link_type == 'album')
        link_field = html.node`<a href="${root}music/${sanitise(page.sister)}/${sanitise(page.name)}">${page.name}</a>`;
    else if (link_type == 'track')
        link_field = html.node`<a href="${root}music/${sanitise(page.sister)}/_/${sanitise(page.name)}">${page.name}</a>`;
    else if (link_type == 'direct')
        link_field = html.node`<a href="${direct_link}">${page.name}</a>`;

    return html.node`
        <section class="profile-header-subpage-section" ref=${el => page.state.header = el}>
            ${page.avatar != '' ? html.node`
                <div class="badge-avatar">
                    <img src=${page.avatar} alt=${page.name}>
                </div>
            ` : ''}
            <div class="badge-info">
                ${link_field}
                <h1 ref=${el => page.state.title = el}>${header_title}</h1>
            </div>
        </section>
    `;
}
